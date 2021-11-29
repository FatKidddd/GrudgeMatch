import React, { Component } from 'react';
import { Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GoogleAuthProvider, onAuthStateChanged, signInWithCredential, getAuth, UserCredential } from 'firebase/auth';
import * as Google from 'expo-google-app-auth';

const IOS_CLIENT_ID = "446448293024-9u0b4sak30e4deqj5eaaan3og5ancs9j.apps.googleusercontent.com";
//const ANDROID_CLIENT_ID = "446448293024-rgm2vttk81voqpjmdbm25ctrdie00bkd.apps.googleusercontent.com";

class LoginScreen extends Component<any> {
	constructor(props: any) {
		super(props);
		this.state = {
			email: '',
			password: '',
			loading: false,
		};

		this.signInWithGoogleAsync = this.signInWithGoogleAsync.bind(this);
	}

	handleFailed(errorMessage: string) {
		Alert.alert(
			'Login Failed',
			errorMessage,
			[
				{ text: 'Close' },
			],
			{ cancelable: true },
		);
	}

	onSignIn(googleUser: any) {
		console.log('Google Auth Response', googleUser);
		// We need to register an Observer on Firebase Auth to make sure auth is initialized.
    const auth = getAuth();
		let unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
			unsubscribe();
			// Check if we are already signed-in Firebase with the correct user.
			if (!this.isUserEqual(googleUser, firebaseUser)) {
				// Build Firebase credential with the Google ID token.
				let credential = GoogleAuthProvider.credential(
					googleUser.idToken,
					googleUser.accessToken
				);
				// Sign in with credential from the Google user.
				signInWithCredential(auth, credential)
					.then((result) => {
						console.log('User signed in');
						//const user = db.collection("users").doc(result.user.uid);
							// user.set({
							// 	displayName: result.additionalUserInfo.profile.given_name,
							// 	dateCreated: Date.now(),
							// })
						// } else {
						// 	user.update({
						// 		lastLoggedIn: Date.now()
						// 	})
						// }
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
            console.error(error);
					});
			} else {
				console.log('User already signed-in Firebase.');
			}
		}).bind(this);
	}

	isUserEqual(googleUser: any, firebaseUser: any) {
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
	}

	signInWithGoogleAsync = async () => {
		this.setState({ errorMessage: '', loading: true });
		try {
			const result = await Google.logInAsync({
        behavior: 'web',
				//androidClientId: ANDROID_CLIENT_ID,
				iosClientId: IOS_CLIENT_ID,
				scopes: ['profile', 'email'],
			});

			if (result.type === 'success') {
				this.onSignIn(result);
				//console.log("LoginScreen.js.js 21 | ", result.user.givenName);
				return result.accessToken;
			} else {
				this.setState({ loading: false });
				return { cancelled: true };
			}
		} catch (e) {
			//console.log('LoginScreen.js.js 30 | Error with login', e);
			this.setState({ loading: false });
			return { error: true };
		}
	}

	render() {
		return (
			<View style={styles.container}>
        <TouchableOpacity onPress={this.signInWithGoogleAsync}>
          <Ionicons name='logo-google' size={50} />
        </TouchableOpacity>
			</View>	
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 0.7,
		backgroundColor: 'white',
		alignItems: 'center',
		borderRadius: 70,
		marginHorizontal: 10,
		padding: 10,
	},
});

export default LoginScreen;