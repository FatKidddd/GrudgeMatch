import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { Box, Text, Heading, VStack, FormControl, Input, Link, Button, HStack, Center, useToast, Image, Spinner } from "native-base";
import { Ionicons } from '@expo/vector-icons';
import { GoogleAuthProvider, onAuthStateChanged, signInWithCredential, getAuth, createUserWithEmailAndPassword, updateProfile, User, signInWithEmailAndPassword } from 'firebase/auth';
import * as Google from 'expo-google-app-auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { TouchableOpacity } from 'react-native';
import { SvgUri } from 'react-native-svg';
import { GoogleSvg } from '../components';

const IOS_CLIENT_ID = "446448293024-9u0b4sak30e4deqj5eaaan3og5ancs9j.apps.googleusercontent.com";
const ANDROID_CLIENT_ID = "446448293024-dqp1c1vjankcc1fqhh6t8j1f2omak51h.apps.googleusercontent.com";

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

  const onSignIn = (googleUser: any) => {
    console.log('Google Auth Response', googleUser);
    // We need to register an Observer on Firebase Auth to make sure auth is initialized.
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      unsubscribe();
      // Check if we are already signed-in Firebase with the correct user.
      if (!isUserEqual(googleUser, firebaseUser)) {
        // Build Firebase credential with the Google ID token.
        let credential = GoogleAuthProvider.credential(googleUser.idToken, googleUser.accessToken);
        // Sign in with credential from the Google user.
        signInWithCredential(auth, credential)
          .then((result) => {
            console.log('User signed in');

            const userRef = doc(db, 'users', result.user.uid);
            getDoc(userRef)
              .then(res => {
                if (!res.exists()) {
                  setDoc(userRef, {
                    name: result.user.displayName,
                    roomNames: {}
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
        console.log('User already signed-in Firebase.');
      }
    });
  };

  const isUserEqual = (googleUser: any, firebaseUser: User | null) => {
    if (firebaseUser) {
      let providerData = firebaseUser.providerData;
      for (let i = 0; i < providerData.length; i++) {
        if (providerData[i].providerId === GoogleAuthProvider.PROVIDER_ID &&
          providerData[i].uid === googleUser.getBasicProfile().getId()) {
          // We don't need to reauth the Firebase connection.
          return true;
        }
      }
    }
    return false;
  };

  const signInWithGoogleAsync = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const result = await Google.logInAsync({
        behavior: 'web',
        androidClientId: ANDROID_CLIENT_ID,
        iosClientId: IOS_CLIENT_ID,
        scopes: ['profile', 'email'],
      });

      if (result.type === 'success') {
        onSignIn(result);
        return result.accessToken;
      } else {
        setIsLoading(false);
        return { cancelled: true };
      }
    } catch (e) {
      setIsLoading(false);
      handleFailed('Sign in with Google was unsuccessful.');
      return { error: true };
    }
  }

  const handleSignUp = () => {
    setIsLoading(true);
    createUserWithEmailAndPassword(auth, email, password)
      .then(async (userCredentials) => {
        setIsLoading(false);
        const userRef = doc(db, 'users', userCredentials.user.uid);
        setDoc(userRef, {
          name: username,
          roomNames: {}
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
      .then(res => {
        setIsLoading(false);
      })
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
                <Button onPress={() => setHide(!hide)}>
                  <Ionicons size={20} name={hide ? "eye-outline" : "eye-off-outline"} />
                </Button>
              }
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
              : <Button mt="2" colorScheme="indigo" onPress={handleSubmit}>
                {isRegister ? 'Sign up' : 'Sign in'}
              </Button>}
            <HStack justifyContent={'space-between'} alignItems={'center'} marginTop={3}>
              <Text>Sign in with Google</Text>
              <TouchableOpacity onPress={signInWithGoogleAsync}>
                <GoogleSvg />
              </TouchableOpacity>
            </HStack>
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