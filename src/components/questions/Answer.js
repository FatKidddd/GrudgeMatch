import React, { Component } from 'react';
import { Text, View, StyleSheet, Alert, Image, TextInput, TouchableOpacity, InteractionManager } from 'react-native';
import Options from './Options';
import db from '../../../Fire';
import { deleteCollection } from './Delete';
import { connect } from 'react-redux';
import { removeAnswer } from '../../redux/actions';
import firebase from 'firebase';
import { Interactive } from './Interactive';
import { Loading } from '../common';
import { ImagePop } from '../common/ImagePop';

class Answer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isFocused: false,
            editable: false,
            text: this.props.answerText,
            pointerEvents: 'none',
            loading: true,
            imageZoom: false
            // add the view more function
        };

        this.handleEditable = this.handleEditable.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
        this.deleteAnswer = this.deleteAnswer.bind(this);
        this.changeImageZoom = this.changeImageZoom.bind(this);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.state === nextState || this.props.dateCreated != nextProps.dateCreated) {
            return false;
        }
        return true;
    }

    componentDidMount() {
        InteractionManager.runAfterInteractions(async () => {
            this.setState({ loading: false });
        });
    }

    // haven't added likes

    handleEditable() {
        let pointerEvents = 'none';
        if (this.state.pointerEvents === 'none') {
            pointerEvents = 'auto';
        } else if (this.state.pointerEvents === 'auto') {
            pointerEvents = 'none';
        }
        this.setState({
            editable: !this.state.editable,
            pointerEvents: pointerEvents
        });
    }

    handleUpdate() {
        db.collection('questions').doc(this.props.questionId).collection('answers').doc(this.props.answerId).update({
            answerText: this.state.text
        })
            .then(res => {
                console.log('Updated answer');
            })
            .catch(error => {
                console.log(error.message);
            });
    }

    deleteAnswer() {
        const questionRef = db.collection('questions').doc(this.props.questionId);
        const answer = questionRef.collection('answers').doc(this.props.answerId);
        // need to somehow add a for loop here to continuously delete
        deleteCollection(answer, 'likers', 50);
        answer.delete().catch(error => console.log(error.message));
        const decrement = firebase.firestore.FieldValue.increment(-1);
        questionRef.update({
           answersCount: decrement
        }).then(res => {
            console.log('Decreased by one');
        }).catch(error => {
            console.log(error.message);
        });
        
        this.props.removeAnswer(this.props.questionId, this.props.answerId);
    }

    changeImageZoom() {
        this.setState({ imageZoom: false });
    }

    render() {
        const { container, body, section, item, answerText, createdText, owner, header, uploadedImage, userContainer, userInfo, profileImageContainer, profileImage, footer } = styles;
        let dateObj = new Date(this.props.dateCreated * 1000);
        let date = dateObj.getDate();
        let month = dateObj.getMonth();
        let year = dateObj.getFullYear();
        let timeString = date + '/' + month + '/' + year;
        //console.log(this.props.answerId);
        return (
            <View style={container}>
                {this.state.loading 
                    ? <Loading size={'small'} />
                    : <View>
                        <View style={item}>
                            <View style={header}>
                                <View style={userContainer}>
                                    <View style={profileImageContainer}>
                                        {this.props.userImage ? <Image source={{ uri: this.props.userImage }} style={profileImage} /> : <View style={profileImage}></View>}
                                    </View>
                                    <View style={userInfo}>
                                        <Text style={owner}>{this.props.displayName}</Text>
                                        <Text style={createdText}>Created: {timeString}</Text>
                                    </View>
                                </View>
                                <Options
                                    answerId={this.props.answerId}
                                    //handleEditable={this.handleEditable} 
                                    //editable={this.state.editable}
                                    //handleUpdate={this.handleUpdate}
                                    delete={this.deleteAnswer}
                                />
                            </View>
                            <View style={body}>
                                <View style={section}>
                                    <Text style={answerText}>{this.props.answerText}</Text>
                                </View>
                                <View>
                                    {this.props.image
                                        ?
                                        <TouchableOpacity onPress={() => this.setState({ imageZoom: true })}>
                                            <Image source={{ uri: this.props.image }} style={uploadedImage} />
                                        </TouchableOpacity>
                                        : null
                                    }
                                </View>
                                <ImagePop image={this.props.image} imageZoom={this.state.imageZoom} changeImageZoom={this.changeImageZoom} />
                            </View>
                            <View style={footer}>
                                <Interactive
                                    docRef={db.collection('questions').doc(this.props.questionId).collection('answers').doc(this.props.answerId)}
                                    refId={this.props.answerId}
                                    comment={false}
                                />
                            </View>
                        </View>
                    </View>
                }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
        marginHorizontal: 16,
        alignItems: 'stretch',
    },

    item: {
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        alignItems: 'stretch',
    },

    body: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        marginBottom: 10,
    },

    section: {
        flexDirection: 'row',
        flex: 1,
        marginRight: 5
    },

    answerText: {
        fontSize: 14,
        fontWeight: '300'
    },

    editableAnswer: {
        fontSize: 20,
        borderColor: '#6ab8de',
        //borderColor: '#a5dbf5',
        borderRadius: 4,
        borderWidth: 3,
        backgroundColor: '#ffffff',
        paddingHorizontal: 5,
    },

    subjectContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start'
    },

    subjectView: {
        backgroundColor: '#dddddd',
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 8,
        marginRight: 5
    },

    subject: {
        fontSize: 12,
        color: 'white',
        fontWeight: '600'
    },

    created: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },

    createdText: {
        fontSize: 10,
        fontWeight: '100',
    },

    owner: {
        fontSize: 12,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },

    userInfo: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center'
    },

    headerButtonView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    headerButton: {
        paddingHorizontal: 5,
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

    uploadedImage: {
        //width: '100%', 
        //height: 200,
        width: 100,
        height: 100,
        resizeMode: 'contain',
        borderRadius: 10,
        marginBottom: 10,
    },

    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end'
    }
});

export default connect(
    null,
    { removeAnswer }
)(Answer);