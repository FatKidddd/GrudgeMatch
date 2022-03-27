import React, { useEffect, useState } from 'react';
import { Box, Text, Heading, VStack, FormControl, Input, Link, Button, HStack, Center, useToast, Image, Spinner } from "native-base";
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { ResponseType } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as AppleAuthentication from 'expo-apple-authentication';
import { OAuthProvider, GoogleAuthProvider, onAuthStateChanged, signInWithCredential, getAuth, createUserWithEmailAndPassword, updateProfile, User, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { Platform, TouchableOpacity } from 'react-native';
import { GoogleSvg } from '../components';
import * as Crypto from 'expo-crypto';

const NO_OF_FREE_ROOMS = 8;

WebBrowser.maybeCompleteAuthSession();
// both login and registration

const AuthScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  //const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [errorMessages, setErrorMessages] = useState({ email: '', password: '', username: '', general: '' });
  const [hide, setHide] = useState(true);
  const toast = useToast();

  useEffect(() => {
    validateFields();
  }, [email, password, username]);

  const validateFields = () => {
    const emailIsValid = !!email.toLowerCase()
      .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    const passwordIsValid = password.length >= 6;
    const usernameIsValid = isRegister ? username.length > 0 && username.length <= 10 : true;
    setErrorMessages({
      ...errorMessages,
      email: email.length !== 0 && !emailIsValid ? 'Invalid email' : '',
      password: password.length !== 0 && !passwordIsValid ? 'Password needs to be at least 6 characters' : '',
      username: username.length !== 0 && !usernameIsValid ? 'Username can only be up to 10 characters' : ''
    });
    return emailIsValid && passwordIsValid && usernameIsValid;
  };

  const auth = getAuth();
  const db = getFirestore();

  const handleFailed = (errorMessage: string) => {
    toast.show({
      title: `${isRegister ? 'Registration' : 'Login'} failed`,
      status: 'error',
      description: errorMessage
    });
  };

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    expoClientId: "446448293024-5q6t25pt7mc7p4to2rk1uvd7fci1tm5v.apps.googleusercontent.com",
    iosClientId: "446448293024-9u0b4sak30e4deqj5eaaan3og5ancs9j.apps.googleusercontent.com",
    androidClientId: "446448293024-61rd8brl910re64ei65q5q8vmrbe3du8.apps.googleusercontent.com"
    //"446448293024-dqp1c1vjankcc1fqhh6t8j1f2omak51h.apps.googleusercontent.com",
    // webClientId: 'GOOGLE_GUID.apps.googleusercontent.com',
  });

  useEffect(() => {
    if (response?.type === 'success') {
      // console.log(response)
      // const { authentication } = response;
      // const id_token = authentication?.idToken;
      // console.log(id_token)
      // onSignIn(response);
      const { id_token } = response.params;
      
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then((result) => {
          console.log('User signed in');

          const userRef = doc(db, 'users', result.user.uid);
          getDoc(userRef)
            .then(res => {
              if (!res.exists()) {
                setDoc(userRef, {
                  name: result.user.displayName,
                  roomNames: {},
                  roomsLimit: NO_OF_FREE_ROOMS,
                  roomsUsed: 0
                });
              }
            });
        })
        .catch(error => {
          // Handle Errors here.
          let errorCode = error.code;
          let errorMessage = error.message;
          // The email of the user's account used.
          let email = error.email;
          // The firebase.auth.AuthCredential type that was used.
          let credential = error.credential;
          // ...
          handleFailed('Sign in with Google was unsuccessful.');
          console.error(error);
        });
    } else {
      setIsLoading(false);
      if (response !== null)
        handleFailed('Sign in with Google was unsuccessful.');
    }
  }, [response]);

  const signInWithGoogle = () => {
    if (isLoading) return;
    setIsLoading(true);
    promptAsync();
  };

  const signInWithApple = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const nonce = Math.random().toString(36).substring(2, 10);
      const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, nonce);
      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL
        ],
        nonce: hashedNonce
      });
      const { identityToken } = appleCredential;
      const provider = new OAuthProvider('apple.com');
      const credential = provider.credential({
        idToken: identityToken!,
        rawNonce: nonce
      });
      const result = await signInWithCredential(auth, credential);
      console.log('User signed in');

      const userRef = doc(db, 'users', result.user.uid);
      const res = await getDoc(userRef);
      if (!res.exists()) {
        setDoc(userRef, {
          name: appleCredential.fullName?.givenName ?appleCredential.fullName?.givenName : 'Anonymous',
          roomNames: {},
          roomsLimit: NO_OF_FREE_ROOMS,
          roomsUsed: 0
        });
      }
    } catch (e: any) {
      if (e.code === 'ERR_CANCELED') {
        // handle that the user canceled the sign-in flow
      } else {
        // handle other errors
        handleFailed('Sign in with Apple was unsuccessful.');
        console.error(e);
      }
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    setIsLoading(true);
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredentials) => {
        setIsLoading(false);
        const userRef = doc(db, 'users', userCredentials.user.uid);
        setDoc(userRef, {
          name: username,
          roomNames: {},
          roomsLimit: NO_OF_FREE_ROOMS,
          roomsUsed: 0
        })
          .then(res => console.log("Set required info on new user creation"))
          .catch(err => console.error(err));
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
        handleFailed('Your registration was unsuccessful.');
      });
  };

  const handleEmailLogin = () => {
    setIsLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .catch(err => {
        setIsLoading(false);
        console.error(err)
        handleFailed('Your login was unsuccessful');
      });
  };

  const handleSubmit = () => {
    if (!validateFields()) return;
    if (isRegister) handleSignUp();
    else handleEmailLogin();
  };

  return (
    <Center flex={1}>
      <Box safeArea p="2" py="8" w="90%" maxW="350">
        {!isRegister
          ? <Heading
            size="lg"
            fontWeight="600"
            color="coolGray.800"
            _dark={{
              color: "warmGray.50",
            }}
          >
            Welcome
          </Heading>
          : null
        }
        <Heading
          mt="1"
          _dark={{
            color: "warmGray.200",
          }}
          color="coolGray.600"
          fontWeight="medium"
          size="xs"
        >
          {isRegister ? 'Register a new account!' : 'Sign in to continue!'}
        </Heading>

        <FormControl>
          <VStack space={3} mt="5">
            {isRegister
              ? <>
                <FormControl.Label>Username</FormControl.Label>
                <Input value={username} onChangeText={newUsername => setUsername(newUsername)} />
              </>
              : null}
            <FormControl.Label>Email</FormControl.Label>
            <Input value={email} onChangeText={newEmail => setEmail(newEmail)} />
            <FormControl.Label>Password</FormControl.Label>
            <Input
              type={hide ? "password" : "text"}
              value={password}
              onChangeText={newPassword => setPassword(newPassword)}
              InputRightElement={
                <Button onPress={() => setHide(!hide)} height='100%'>
                  <Ionicons size={20} name={hide ? "eye-outline" : "eye-off-outline"} color='#eeeeee'/>
                </Button>}
            />
            {/* <Link
            _text={{
              fontSize: "xs",
              fontWeight: "500",
              color: "indigo.500",
            }}
            alignSelf="flex-end"
            mt="1"
          >
            Forget Password?
          </Link> */}
            {Object.entries(errorMessages).map(([key, value]) => 
              value ? <Text key={key} fontSize='xs' color='error.500' fontWeight={500}>{value}</Text> : null
            )}
            {isLoading
              ? <Spinner size="lg" />
              : <Button mt="2" onPress={handleSubmit}>
                {isRegister ? 'Sign up' : 'Sign in'}
              </Button>}
              {isLoading
                ? <Spinner size="lg" />
                : <VStack space={2} alignItems='center' mt={3}>
                  <HStack justifyContent={'space-between'} alignItems={'center'} space={2}>
                    <Text>Sign in with Google</Text>
                    <TouchableOpacity onPress={signInWithGoogle}>
                      <GoogleSvg />
                    </TouchableOpacity>
                  </HStack>
                  {Platform.OS === 'ios' &&
                    <AppleAuthentication.AppleAuthenticationButton
                      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                      cornerRadius={5}
                      style={{ width: 200, height: 44 }}
                      onPress={signInWithApple}
                    />}
                </VStack>}
            <HStack mt="6" justifyContent="center">
              <Link
                _text={{
                  color: "indigo.500",
                  fontWeight: "medium",
                  fontSize: "sm",
                }}
                onPress={() => setIsRegister(!isRegister)}
              >
                {!isRegister ? 'Don\'t have an account?' : 'Go to login page'}
              </Link>
            </HStack>
          </VStack>
        </FormControl>
      </Box>
    </Center>
  );
};

export default AuthScreen;