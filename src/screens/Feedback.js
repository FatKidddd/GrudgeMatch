import React, { Component } from 'react';
import { StyleSheet, View, Text, Button, Keyboard, TextInput, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';
import { Loading } from '../components/common/Loading';
import Constants from 'expo-constants';
import { BackButton } from '../components/common/BackButton';
import { Background } from '../components/common';
import db from '../../Fire';
import firebase from 'firebase';

class FeedbackScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            feedback: '',
            response: '',
            loading: false
        };
        this.handleSubmitFeedback = this.handleSubmitFeedback.bind(this);
    }

    handleSubmitFeedback() {
        if (this.state.feedback.length > 0) {
            this.setState({ loading: true });

            const uid = firebase.auth().currentUser.uid;
            db.collection('feedbacks').doc().set({
                feedback: this.state.feedback,
                dateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
                uid: uid
            })
            .then(() => {
                console.log('Feedback Submitted.');
                this.setState({ loading: false, feedback: '', response: '' });
            })
            .catch(error => {
                console.log(error.message);
                this.setState({ loading: false });
            });
        }
    }

    render() {
        this.props.navigation.setOptions({
            headerLeft: () => (
                <BackButton
                    onPress={this.props.navigation.goBack}
                    size={30}
                />
            )
        });

        const { container, submit, submitText, viewInput, submitLabel, textInput, viewButton, response, touchableWithoutFeedback } = styles;

        return (
            <Background>
                <View style={container}>
                    <TouchableWithoutFeedback style={touchableWithoutFeedback} onPress={Keyboard.dismiss} accessible={false}>
                        <View style={container}>
                            <View style={viewInput}>
                                <Text style={submitLabel}>Feedback</Text>
                                <TextInput
                                    placeholder='Enter feedback here'
                                    value={this.state.feedback}
                                    onChangeText={feedback => this.setState({ feedback: feedback })}
                                    autoCorrect={false}
                                    style={textInput}
                                    multiline={true}
                                />
                            </View>
                            <View style={response}>
                                <Text>{this.state.response}</Text>
                            </View>
                            <View style={viewButton}>
                                {this.state.loading
                                    ? <Loading size={'large'} />
                                    : <TouchableOpacity
                                            style={submit}
                                            onPress={this.handleSubmitFeedback}
                                        >
                                        <Text style={submitText}>Submit</Text>
                                    </TouchableOpacity>
                                }
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </Background>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'center',
        marginTop: Constants.statusBarHeight,
        paddingHorizontal: 10,
    },

    viewInput: {
        flex: 2,
        width: '100%',
        maxWidth: '100%',
        //justifyContent: 'flex-start',
        justifyContent: 'center',
        alignItems: 'flex-start',
        //paddingTop: 30,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },

    submitLabel: {
        fontSize: 20,
        flexDirection: 'row',
        marginBottom: 30,
        fontWeight: '400',
    },

    textInput: {
        flexDirection: 'row',
        color: '#000',
        width: '100%',
        paddingTop: 3,
        paddingBottom: 20,
        fontSize: 20,
        lineHeight: 23,
        borderBottomWidth: 1,
        borderColor: '#bbb',
    },

    viewButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
        //backgroundColor: '#ADD8ED',
        width: '100%',
    },

    submit: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: 'rgb(12, 100, 205)',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 20,
    },

    submitText: {
        fontSize: 20,
        color: '#fff',
    },

    touchableWithoutFeedback: {
        width: '100%',
        height: '100%',
    },

    response: {
        alignItems: 'center',
        justifyContent: 'center'
    },
});

export default FeedbackScreen;