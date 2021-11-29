import React, { Component } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ImageBackground } from 'react-native';
import firebase from 'firebase';
import { connect } from 'react-redux';
import { setUser } from '../redux/actions';

class LoadingScreen extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        firebase.auth().onAuthStateChanged(async user => {
            if (user) {
                await this.props.setUser();
                this.props.navigation.navigate('LoggedInTab');
            } else {
                this.props.navigation.navigate('Auth');
            }
        });
    }

    render() {
        return (
            <View style={styles.container}>
                <ImageBackground source={require('../../assets/splash.png')} style={styles.image} />
                    {/* <View style={styles.section}></View>
                    <View style={styles.section}>
                        <ActivityIndicator size='large'></ActivityIndicator>
                    </View>
                    <View style={styles.section}></View>
                </ImageBackground> */}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    image: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
    },

    section: {
        flex: 1,
        justifyContent: 'flex-end'
    }
});

export default connect(
    null,
    { setUser }
)(LoadingScreen);