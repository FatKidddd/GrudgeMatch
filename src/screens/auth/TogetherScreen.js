import React, { Component } from 'react';
import { TouchableWithoutFeedback, View } from 'react-native';
import LoginScreen from './Login';
import RegistrationScreen from './Registration';
import { Background } from '../../components/common';

class TogetherScreen extends Component {
    constructor() {
        super();
        this.state = {
            either: true
        };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(bool) {
        this.setState({ either: bool });
    }
    render() {
        return (
            <Background blurRadius={3}>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                {this.state.either
                    ? <LoginScreen handleChange={this.handleChange} />
                    : <RegistrationScreen handleChange={this.handleChange} />
                }
                </View>
            </Background>
        );
    }
}

export default TogetherScreen;