import React, { Component } from 'react';
import { View, Text, Image, Button, TextInput } from 'react-native';
import firebase from 'firebase';
import { Background } from '../components/common';

class QuizScreen extends Component {
    constructor() {
        super();
        this.state = {
            userImage: null
        };
    }

    componentDidMount() {
    }

    async getImage() {
        const imageRef = firebase.storage().ref("profiles/default.png");
        const url = await imageRef.getDownloadURL();
        this.setState({ userImage: url });
        // .then(url => {
        //     console.log(url);
        //     this.setState({ userImage: url });
        // })
        // .catch(error => {
        //     console.log(error.message);
        // });
    }

    render() {
        return (
            <Background>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Text>Quiz Screen</Text>
                    <TextInput style={{backgroundColor: 'white', alignSelf: 'stretch'}}/>
                    <Button onPress={()=>this.getImage()} title={'Penis'}/>
                    {this.state.userImage ? <Image source={{ uri: this.state.userImage }} style={{ width: 100, height: 100 }} /> : null}
                </View>
            </Background>
        );
    }
}

export default QuizScreen;