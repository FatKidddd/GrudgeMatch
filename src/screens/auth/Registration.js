import React, { Component } from 'react';
import { View, Text, TextInput, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import * as firebase from 'firebase';
import db from '../../../Fire';

class RegistrationScreen extends Component {
	constructor(props) {
		super(props);
		this.state = {
			email: '',
			username: '',
			password: '',
			//password_confirmation: '',
			loading: false,
		};

		this.handleSignUp = this.handleSignUp.bind(this);
	}

	handleFailed(errorMessage) {
		Alert.alert(
			'Registration Failed',
			errorMessage,
			[
				{ text: 'Close', onPress: null },
			],
			{ cancelable: true },
		);
	}

	// async handleData(result) {
	// 	console.log('User signed up');
	// 	const user = db.collection("users").doc(result.user.uid);
	// 	if (result.additionalUserInfo.isNewUser) {
	// 		await user.set({
	// 			gmail: result.user.email,
	// 			profilePicture: result.additionalUserInfo.profile.picture,
	// 			locale: result.additionalUserInfo.profile.locale,
	// 			firstName: result.additionalUserInfo.profile.given_name,
	// 			lastName: result.additionalUserInfo.profile.family_name,
	// 			dateCreated: Date.now()
	// 		}).catch(error => console.log(error.errorMessage));
	// 	}
	// }

	handleSignUp() {
		this.setState({ loading: true });
		firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password)
			.then(async (userCredentials) => {
				this.setState({ loading: false });
				userCredentials.user.updateProfile({
					displayName: this.state.username,
					photoURL: null
				}).then(res => {
					const user = db.collection("users").doc(userCredentials.user.uid);
					user.set({
						profilePicture: '',
						displayName: this.state.username,
						dateCreated: Date.now(),
					})
				});
			})
			.catch(error => {
				this.setState({
					loading: false
				}, () => {
					this.handleFailed('Your registration was unsuccessful.');
				});
			});
	}

	render() {
		const { username, email, password, loading } = this.state;
		const { container, switchContainer, switchButton, inputContainer, inputRow, bottomContainer, inputStyle, submitButton, textStyle, focusedText } = styles;
		
		return (
			<View style={container}>
				<View style={switchContainer}>
					<TouchableOpacity onPress={() => this.props.handleChange(true)} style={switchButton}>
						<Text>Login</Text>
					</TouchableOpacity>
					<TouchableOpacity style={[switchButton, { borderBottomColor: 'black' }]}>
						<Text style={focusedText}>Sign Up</Text>
					</TouchableOpacity>
				</View>
				<View style={inputContainer}>
					<View style={inputRow}>
						<TextInput
							style={inputStyle}
							autoCorrect={false}
							placeholder='Username'
							value={username}
							onChangeText={username => this.setState({ username })}
						/>
					</View>
					<View style={inputRow}>
						<TextInput
							style={inputStyle}
							autoCorrect={false}
							placeholder='Email'
							value={email}
							onChangeText={email => this.setState({ email })}
						/>
					</View>
					<View style={inputRow}>
						<TextInput
							style={inputStyle}
							secureTextEntry
							placeholder='Password'
							value={password}
							onChangeText={password => this.setState({ password })}
						/>
					</View>
				</View>
				<View style={bottomContainer}>
					{!loading
						?
						<TouchableOpacity style={submitButton} onPress={this.handleSignUp}>
							<Text style={textStyle}>Sign Up</Text>
						</TouchableOpacity>
						:
						<ActivityIndicator size={'large'} />
					}
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
		flex: 4,
		justifyContent: 'space-evenly',
		alignItems: 'center',
		width: '100%',
	},

	inputRow: {
		flexDirection: 'row',
	},

	bottomContainer: {
		flex: 2,
		width: '100%',
		justifyContent: 'space-between',
		alignItems: 'stretch',
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
	}
};

export default RegistrationScreen;
