import React, { Component } from 'react';
import { Text, View, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import firebase from 'firebase';
import * as Google from 'expo-google-app-auth';
import db from '../../../Fire';

const IOS_CLIENT_ID = "651709745555-bi4cv3hpsngegoj3i3uur9n3l840l6sg.apps.googleusercontent.com";
const ANDROID_CLIENT_ID = "651709745555-ph5711eiovvkti4obh4tt8v27nnvosor.apps.googleusercontent.com";

class LoginScreen extends Component {
	constructor(props) {
		super(props);
		this.state = {
			email: '',
			password: '',
			loading: false,
		};

		this.handleEmailLogin = this.handleEmailLogin.bind(this);
		//this.handleGoogleLogin = this.handleGoogleLogin.bind(this);
		this.signInWithGoogleAsync = this.signInWithGoogleAsync.bind(this);
	}

	handleFailed(errorMessage) {
		Alert.alert(
			'Login Failed',
			errorMessage,
			[
				{ text: 'Close', onPress: null },
			],
			{ cancelable: true },
		);
	}

	handleEmailLogin() {
		this.setState({ errorMessage: '', loading: true });
		console.log(this.state.email, this.state.password);
		firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
			.then(() => {
				this.setState({ email: '', password: '' });
			})
			.catch(error => {
				this.setState({ 
					loading: false 
				}, () => { 
					this.handleFailed('Your login was unsuccessful.');
				});
			});
	}

	onSignIn(googleUser) {
		console.log('Google Auth Response', googleUser);
		// We need to register an Observer on Firebase Auth to make sure auth is initialized.
		var unsubscribe = firebase.auth().onAuthStateChanged(function (firebaseUser) {
			unsubscribe();
			// Check if we are already signed-in Firebase with the correct user.
			if (!this.isUserEqual(googleUser, firebaseUser)) {
				// Build Firebase credential with the Google ID token.
				var credential = firebase.auth.GoogleAuthProvider.credential(
					googleUser.idToken,
					googleUser.accessToken
				);
				// Sign in with credential from the Google user.
				firebase
					.auth()
					.signInWithCredential(credential)
					.then(result => {
						console.log('User signed in');
						const user = db.collection("users").doc(result.user.uid);
						if (result.additionalUserInfo.isNewUser) {
							user.set({
								profilePicture: result.additionalUserInfo.profile.picture ? result.additionalUserInfo.profile.picture : '',
								displayName: result.additionalUserInfo.profile.given_name,
								dateCreated: Date.now(),
							})
						}
						// } else {
						// 	user.update({
						// 		lastLoggedIn: Date.now()
						// 	})
						// }
					})
					.catch(function (error) {
						// Handle Errors here.
						var errorCode = error.code;
						var errorMessage = error.message;
						// The email of the user's account used.
						var email = error.email;
						// The firebase.auth.AuthCredential type that was used.
						var credential = error.credential;
						// ...
					});
			} else {
				console.log('User already signed-in Firebase.');
			}
		}.bind(this));
	}

	isUserEqual(googleUser, firebaseUser) {
		if (firebaseUser) {
			var providerData = firebaseUser.providerData;
			for (var i = 0; i < providerData.length; i++) {
				if (providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
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
				androidClientId: ANDROID_CLIENT_ID,
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
		const { email, password, loading } = this.state;
		const { container, switchContainer, switchButton, inputContainer, inputRow, bottomContainer, inputStyle, submitButton, textStyle, focusedText, alternativeContainer, alternativeTextContainer, alternativeText, alternativeRow } = styles;
		return (
			// <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS == "ios" ? "padding" : "height"} >
			<View style={container}>
				<View style={switchContainer}>
					<TouchableOpacity style={[switchButton, { borderBottomColor: 'black'}]}>
						<Text style={focusedText}>Login</Text>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => { this.props.handleChange(false); }} style={switchButton}>
						<Text>Sign Up</Text>
					</TouchableOpacity>
				</View>
				<View style={inputContainer}>
					<View style={inputRow}>
						<TextInput
							style={inputStyle}
							autoCorrect={false}
							placeholder='Email'
							value={email}
							onChangeText={email => this.setState({ email })}
						/>
						{/* <Ionicons size={25} name='ios-mail' style={{ paddingHorizontal: 10 }} /> */}
					</View>
					<View style={inputRow}>
						<TextInput
							style={inputStyle}
							secureTextEntry
							placeholder='Password'
							value={password}
							onChangeText={password => this.setState({ password })}
						/>
						{/* <Ionicons size={25} name='ios-key' style={{ paddingHorizontal: 10 }} /> */}
					</View>
				</View>
				<View style={bottomContainer}>
					{!loading
						?
						<TouchableOpacity style={submitButton} onPress={this.handleEmailLogin}>
							<Text style={textStyle}>Login</Text>
						</TouchableOpacity>
						:
						<ActivityIndicator size={'large'} />
					}
					<View style={alternativeContainer}>
						<View style={alternativeTextContainer}>
							<Text style={alternativeText}>Alternative Sign In Methods</Text>
						</View>
						<View style={alternativeRow}>
							<TouchableOpacity onPress={this.signInWithGoogleAsync}>
								<Ionicons name='logo-google' size={50} />
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</View>	
		);
	}
}

const styles = {
	container: {
		flex: 0.7,
		//height: 500,
		backgroundColor: 'white',
		justifyContent: 'space-between',
		alignItems: 'center',
		borderRadius: 70,
		marginHorizontal: 10,
		padding: 10,
	},

	switchContainer: {
		flex: 1,
		flexDirection: 'row',
		width: '100%',
		justifyContent: 'space-evenly',
		alignItems: 'center',
	},

	switchButton: {
		borderBottomColor: '#aaaaaa',
		borderBottomWidth: 2,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 10
	},

	inputContainer: {
		flex: 3,
		justifyContent: 'space-evenly',
		alignItems: 'center',
		width: '100%',
	},

	inputRow: {
		flexDirection: 'row',
	},

	bottomContainer: {
		flex: 3,
		width: '100%',
		justifyContent: 'space-between',
		alignItems: 'stretch'
	},

	inputStyle: {
		paddingVertical: 18,
		paddingHorizontal: 22,
		fontSize: 18,
		fontWeight: '400',
		flex: 0.85,
		backgroundColor: 'rgb(242, 242, 242)',
		borderRadius: 10
	},

	submitButton: {
		paddingVertical: 18,
		borderRadius: 10,
		backgroundColor: '#467088',
		justifyContent: 'center',
		alignItems: 'center',
		marginHorizontal: 25
	},

	textStyle: {
		fontSize: 20,
		color: '#ffffff',
	},

	focusedText: {
		fontSize: 14,
		fontWeight: '700'
	},

	alternativeContainer: {
		flex: 1,
		justifyContent: 'space-evenly',
		alignItems: 'center'
	},

	alternativeRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-evenly'
	},

	alternativeTextContainer: {
		borderBottomColor: '#bbbbbb',
		borderBottomWidth: 2,
		paddingBottom: 10,
		alignSelf: 'stretch',
		alignItems: 'center',
		marginHorizontal: 25
	},
	
	alternativeText: {
		fontSize: 15
	}
};

export default LoginScreen;