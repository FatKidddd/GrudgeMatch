import React, { Component } from 'react';
import { Text, View, StyleSheet, StatusBar, Image, TextInput, TouchableOpacity, TouchableWithoutFeedback, Dimensions, Keyboard } from 'react-native';
import { Loading } from '../../components/common';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import db from '../../../Fire';
import firebase from 'firebase';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import SlidingUpPanel from 'rn-sliding-up-panel';
import { connect } from 'react-redux';
import { overwriteAnswers } from '../../redux/actions';

// need to fix the submit answer bug and add edit functionality.

class SubmitAnswerScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            answerText: '',
            loading: false,
            errorMessage: '',
            image: null,
            visible: false
        }
        this.submitAnswer = this.submitAnswer.bind(this);
        this.pickImage = this.pickImage.bind(this);
        this.height = Dimensions.get('screen').height/4*3;
        this.handleVisibility = this.handleVisibility.bind(this);
    }

    componentDidMount() {
        this.getPhotoPermission();
        // if (this.props.route.params != null) {
        //     this.props.questionId = this.props.route.params.questionId;
        // } else {
        //     this.props.navigation.navigate('AnswersList');
        // }
    }

    async getPhotoPermission() {
        if (Constants.platform.ios) {
            const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            
            if (status != 'granted') {
                alert('Permission is required to access your camera roll');
            }
        }
    }

    async pickImage() {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
        });

        if (!result.cancelled) {
            this.setState({ image: result.uri });
        }
    }

    async uploadPhotoAsync(uri, uid) {
        const path = `photos/${uid}/${Date.now()}.jpg`;

        return new Promise(async (res, rej) => {
            const response = await fetch(uri);
            const file = await response.blob();

            let upload = firebase.storage().ref(path).put(file);

            upload.on(
                'state_changed',
                snapshot => {},
                err => {
                    rej(err);
                },
                async () => {
                    const uri = await upload.snapshot.ref.getDownloadURL();
                    res(uri);
                }
            );
        });
    };

    async submitAnswer() {
        const { answerText, image } = this.state;
        if (answerText.length > 0) {
            this.setState({ loading: true });

            const uid = firebase.auth().currentUser.uid;

            const remoteUri = image ? await this.uploadPhotoAsync(image, uid) : '';
            
            const answerRef = db.collection('questions').doc(this.props.questionId).collection('answers');
            answerRef.doc().set({
                answerText: answerText,
                dateCreated: firebase.firestore.Timestamp.fromDate(new Date()),
                //displayName: firebase.auth().currentUser.displayName,
                uid: uid,
                //userImage: firebase.auth().currentUser.photoURL,
                image: remoteUri
            })
            .then(async() => {
                console.log('Answer Submitted.')
                const increment = firebase.firestore.FieldValue.increment(1);
                const questionRef = db.collection('questions').doc(this.props.questionId);
                await questionRef.update({
                    answersCount: increment
                }).then(() => {
                    console.log('Increased by one');
                    // this.setState({ loading: false, answerText: '', image: null }, () => {
                    //     this.props.navigation.navigate('AnswersList', { refresh: true });
                    // });
                    this.props.overwriteAnswers(answerRef, this.props.questionId);
                    this.setState({ loading: false, answerText: '', image: null });
                    this.handleVisibility();
                }).catch(error => {
                    console.log(error.message);
                    this.setState({ loading: false });
                });
            })
            .catch(error => {
                console.log(error.message);
                this.setState({ loading: false });
            });
        }
    }

    handleVisibility() {
        if (!this.state.visible) this._panel.show();
        else this._panel.hide();
        this.setState({ visible: !this.state.visible });
    }

    render() {
        const { dragHandler, container, panelContainer, userInfoContainer, profileImageContainer, profileImage, usernameContainer, usernameStyle, yearContainer, yearStyle, textContainer, submitButton, submitText, submitLabel, textInput, imageContainer, imageButtons, imageButton } = styles;
        this.props.navigation.setOptions({
            headerRight: () => (
                <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                    <TouchableOpacity onPress={this.handleVisibility}> 
                        <MaterialCommunityIcons size={30} name='plus' style={{ paddingHorizontal: 10, color: 'white' }} />
                    </TouchableOpacity>
                </View>
            ),
        });

        const { displayName, profilePicture, year } = this.props.data;

        return (
            // <View style={{ top: 0, bottom: 0, height: 500, position: 'absolute', width: '100%' }}>
            <View>
                <SlidingUpPanel 
                    ref={c => this._panel = c}
                    draggableRange={{ top: this.height, bottom: 0 }}   
                    height={this.height} 
                    showBackdrop={false}
                    containerStyle={panelContainer}
                    friction={0.65}
                    onBottomReached={() => this.setState({ visible: false })}
                    onDragStart={Keyboard.dismiss}
                >  
                    {/* {(dragHandlers) => ( */}
                        <View style={{ flex: 1 }}>
                            {/* <View {...dragHandlers} style={dragHandler}>
                                <MaterialIcons name='drag-handle' size={30} style={{ alignSelf: 'center', color: '#cccccc' }} />
                            </View> */}
                            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                                <View style={container}>
                                    <View style={userInfoContainer}>
                                        <View style={profileImageContainer}>
                                            {profileImage ? <Image source={{ uri: profilePicture }} style={profileImage} /> : null}
                                        </View>
                                        <View style={usernameContainer}>
                                            <Text style={usernameStyle}>{displayName}</Text>
                                        </View>
                                        <View style={yearContainer}>
                                            <Text style={yearStyle}>Year: {year ? year : 0}</Text>
                                        </View>
                                    </View>
                                    <View style={textContainer}>
                                        <TextInput
                                            placeholder='Your Comment'
                                            value={this.state.answerText}
                                            onChangeText={answerText => this.setState({ answerText: answerText })}
                                            style={textInput}
                                            multiline={true}
                                        />
                                    </View>
                                    <View style={imageContainer}>
                                        <View style={imageButtons}>
                                            {/* need to add button function for link */}
                                            <TouchableOpacity style={imageButton}>
                                                <Ionicons name='ios-link' size={32} color='#DBDBDB' />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={this.pickImage} style={imageButton}>
                                                <Ionicons name='md-camera' size={32} color='#DBDBDB' />
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={this.removeImage} style={imageButton}>
                                                <Ionicons name='md-trash' size={32} color='#DBDBDB' />
                                            </TouchableOpacity>
                                        </View>
                                        <View style={{ marginHorizontal: 32, maginTop: 32, height: 150 }}>
                                            {this.state.image
                                                ? <Image source={{ uri: this.state.image }} style={{ width: '100%', height: '100%' }} />
                                                : null
                                            }
                                        </View>
                                    </View>
                                    <Text>{this.state.errorMessage}</Text>
                                    {!this.state.loading ?
                                        <TouchableOpacity style={submitButton} onPress={this.submitAnswer}>
                                            <Text style={submitText}>Send</Text>
                                        </TouchableOpacity>
                                        :
                                        <Loading size={'small'} />
                                    }
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    {/* )} */}
                </SlidingUpPanel>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    dragHandler: { 
        justifyContent: 'center', 
        alignItems: 'stretch', 
        //backgroundColor: 'red', 
        borderRadius: 0, 
        padding: 8,
    },

    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20
    },

    panelContainer: {
        backgroundColor: 'white', 
        borderTopRightRadius: 50, 
        borderTopLeftRadius: 50, 
        width: '100%',
        shadowRadius: 100,
        shadowColor: 'black',
        shadowOpacity: 0.3,
    },

    userInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10
    }, 

    profileImageContainer: {
        width: 30,
        height: 30,
        borderRadius: 15,
        overflow: 'hidden',
        marginRight: 10
    },

    profileImage: {
        width: 30,
        height: 30,
    },

    usernameContainer: {
        flexDirection: 'row',
        flex: 1
    },

    usernameStyle: {
        fontSize: 14,
        fontWeight: '500'
    },  

    yearContainer: {
        flexDirection: 'row',
    },

    yearStyle: {
        fontSize: 14,
        fontWeight: '300'
    },

    textContainer: {
        height: 200,
        backgroundColor: '#f3f3f3',
        borderRadius: 10,
        marginVertical: 10,
        paddingVertical: 10,
    },

    textInput: {
        flex: 1,
        paddingHorizontal: 12,
        borderRadius: 10
    },


    submitButton: {
        alignSelf: 'flex-end'
    },

    submitText: {
        fontSize: 14,
        color: '#0080ff'
    },

    response: {
        alignItems: 'center',
        justifyContent: 'center'
    },

    imageContainer: {
        justifyContent: 'center',
        alignItems: 'stretch',
        //backgroundColor: 'blue'
    },

    imageButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },

    imageButton: {
        marginRight: 8
    }
});

const mapStateToProps = state => {
    return {
        data: state.USER.data
    };
};

export default connect(
    mapStateToProps,
    { overwriteAnswers }
)(SubmitAnswerScreen);