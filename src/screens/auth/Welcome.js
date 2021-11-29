import React, { Component } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import Animated, { Easing } from 'react-native-reanimated';
import { Background } from '../../components/common';

class WelcomeScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            opacityValue1: new Animated.Value(0),
            opacityValue2: new Animated.Value(0),
            opacityValue3: new Animated.Value(0),
            slidingValue: new Animated.Value(200)
        }
    }

    componentDidMount() {
        this.doAnimations()
    }

    doAnimations() {
        // text
        this.state.opacityValue2.setValue(0);
        Animated.timing(this.state.opacityValue2, {
            toValue: 1,
            duration: 300,
            easing: Easing.linear
        }).start(() => {
            this.state.opacityValue1.setValue(0)
            Animated.timing(this.state.opacityValue1, {
                toValue: 1,
                duration: 600,
                easing: Easing.linear
            }).start();
        });
        // tab
        this.state.slidingValue.setValue(100);
        Animated.timing(this.state.slidingValue, {
            toValue: 0,
            duration: 600,
            easing: Easing.out(Easing.cubic)
        }).start(() => {
            this.state.opacityValue3.setValue(0)
            Animated.timing(this.state.opacityValue3, {
                toValue: 1,
                duration: 600,
                easing: Easing.linear
            }).start();
        });
    }

    render() {
        const { container, image, title, welcome, topSection, middleSection, auth, login, register, loginText, registerText } = styles;
        const transformStyle = {
            transform: [{
                translateY: this.state.slidingValue,
            }]
        }

        return (
            <Background blurRadius={0}>
                <View style={topSection}>
                    <Animated.Text style={[welcome, { opacity: this.state.opacityValue2 }]}>Welcome.</Animated.Text>
                </View>
                <View style={middleSection}>
                    <Animated.Text style={[title, { opacity: this.state.opacityValue1 }]}>Fetch</Animated.Text>
                </View>
                <Animated.View style={[auth, transformStyle]}>
                    <Animated.View style={{ opacity: this.state.opacityValue3 }}>
                        <TouchableOpacity style={login} onPress={() => this.props.navigation.navigate('Together')}>
                            <Text style={loginText}>Log In</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={register} onPress={() => this.props.navigation.navigate('Together')}>
                            <Text style={registerText}>Sign Up</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </Animated.View>
            </Background>
        );
    }
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
    },

    image: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center'
    },

    topSection: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },

    middleSection: {
        flex: 2,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },

    auth: {
        flex: 2,
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 50,
        bottom: -50
    },

    title: {
        fontSize: 70,
        fontWeight: '500',
        color: 'white',
    },

    welcome: {
        fontSize: 25,
        fontWeight: '400',
        color: 'white',
    },

    login: {
        paddingHorizontal: 130,
        paddingVertical: 25,
        backgroundColor: '#eeeeee',
        borderRadius: 20,
        marginTop: 50,
        marginBottom: 25
    },

    register: {
        paddingHorizontal: 130,
        paddingVertical: 15,
        backgroundColor: '#eeeeee',
        borderRadius: 20,
    },

    loginText: {
        color: '#555555',
        fontWeight: '500',
        fontSize: 16
    },

    registerText: {
        color: '#555555',
        fontWeight: '500',
        fontSize: 16
    }
});

export default WelcomeScreen;