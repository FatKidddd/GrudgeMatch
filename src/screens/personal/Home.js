import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
//import { connect } from 'react-redux';
import firebase from 'firebase';
import { Background } from '../../components/common';

class HomeScreen extends Component {
	constructor(props) {
		super(props);
		this.state = {
			email: '',
			displayName: '',
			loading: false,
		};
	}

	componentDidMount() {
		const { email, displayName } = firebase.auth().currentUser;
		this.setState({ email, displayName });
	}

	render() {
		const { header, randomText } = styles;
		
		return (
			<Background>
				<View style={header}>
					<Text style={randomText}>
						Hi {this.state.displayName}
					</Text>
				</View>
			</Background>
		);
	}
}

const styles = StyleSheet.create({
	header: {
		flex: 1,
		justifyContent: 'center',
		marginTop: Constants.statusBarHeight,
	},
	
	randomText: {
		alignSelf: 'center',
		color: 'white',
		fontSize: 24,
		fontWeight: '500'
	},
});

// const mapStateToProps = state => {
// 	return { user: state.USER.username };
// };

// export default connect(
// 	null,
// 	{ getQuestions }
// )(HomeScreen);

export default HomeScreen;