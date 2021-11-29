import React, { Component, PureComponent } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Loading } from '../common';
import firebase from 'firebase';
import db from '../../../Fire';
import { connect } from 'react-redux';
import { getLikes } from '../../redux/actions';
import { getLikesById } from '../../redux/selectors';


// changed from state management to redux.
class Likes extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
        }
        this.user = firebase.auth().currentUser;
        // there may be overflow for number of likers. https://stackoverflow.com/questions/57231519/get-information-if-the-feed-is-liked-by-the-user-in-a-single-query-firestore
        this.likesCollection = this.props.docRef.collection('likers');
        this.statsRef = this.likesCollection.doc('--stats--');
        this.likersRef = this.likesCollection.doc(this.user.uid);
    }

    componentDidMount() {
        if (this.props.data == null) {
            this.getLikes();
        }
    }

    async getLikes() {
        let liked = false;
        let likes = 0;
        await this.likesCollection.doc(this.user.uid).get()
            .then(doc => {
                if (doc.exists) {
                    liked = true
                }
            })
            .catch(error => console.log(error.message));

        await this.likesCollection.doc('--stats--').get()
            .then(res => {
                if (res.data()) {
                    likes = res.data().likesCount;
                }
            })
            .catch(error => console.log(error.message));
        
        this.props.getLikes(this.props.refId, liked, likes);
    }

    handleLike() {
        const data = this.props.data;
        if (data != null) {
            const increment = firebase.firestore.FieldValue.increment(1);
            const decrement = firebase.firestore.FieldValue.increment(-1);
            const batch = db.batch();
            if (data.liked) {
                batch.delete(this.likersRef);
                batch.set(this.statsRef, { likesCount: decrement }, { merge: true });
                this.props.getLikes(this.props.refId, !data.liked, data.likes-1);
            } else {
                batch.set(this.likersRef, { username: this.user.displayName })
                batch.set(this.statsRef, { likesCount: increment }, { merge: true });
                this.props.getLikes(this.props.refId, !data.liked, data.likes+1);
            }
            batch.commit();
        }
    }

    render() {
        const { section, interactiveButton, icon, row, text } = this.props.styles;
        let liked = false;
        let likes = 0;
        if (this.props.data) {
            liked = this.props.data.liked;
            likes = this.props.data.likes;
        }

        if (this.state.loading) {
            return (
                <Loading size={'small'} />
            );
        } else {
            return (
                <View style={section}>
                    <TouchableOpacity style={interactiveButton} onPress={() => this.handleLike()}>
                        <View style={row}>
                            <Ionicons size={20} name='md-heart' style={[icon, liked ? { color: '#ff5b5b' } : {} ]}/>
                            <Text style={text}>{likes}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            );
        }
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        data: getLikesById(state, ownProps.refId)
    };
};

export default connect(
    mapStateToProps,
    { getLikes }
)(Likes);