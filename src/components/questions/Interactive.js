import React from 'react';
import Likes from './Likes';
import db from '../../../Fire';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';


const Comment = ({ navigate, answersCount }) => {
    const { section, interactiveButton, icon, text, row } = styles;

    return (
        <View style={section}>
            <TouchableOpacity style={interactiveButton} onPress={navigate}>
                <View style={row}>
                    <MaterialIcons size={20} name='mode-comment' style={icon} />
                    <Text style={text}>{answersCount}</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const Bookmark = navigate => {
    const { section, interactiveButton, icon, text, row } = styles;

    return (
        <View style={section}>
            <TouchableOpacity style={interactiveButton} onPress={() => { }}>
                <View style={row}>
                    <Ionicons size={20} name='ios-bookmark' style={icon} />
                </View>
            </TouchableOpacity>
        </View>
    );
};

const Share = id => {
    const { section, interactiveButton, icon, text, row } = styles;

    return (
        <View style={section}>
            <TouchableOpacity style={interactiveButton} onPress={() => {}}>
                <View style={row}>
                    <Ionicons size={20} name='md-share' style={icon} />
                </View>
            </TouchableOpacity>
        </View>
    );
};

export const Interactive = ({ docRef, refId, answersCount=0, navigate=null, like=true, comment=false, bookmark=true, share=true }) => {
    const { container } = styles;

    return (
        <View style={container}>
            {like
                ? <Likes
                    docRef={docRef}
                    refId={refId}
                    styles={styles}
                />
                : null
            }
            {comment
                ? <Comment navigate={navigate} answersCount={answersCount}/> 
                : null
            }
            {bookmark
                ? <Bookmark /> 
                : null
            }
            {share
                ? <Share /> 
                : null
            }
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center'
    },

    section: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },

    interactiveButton: {
        padding: 7,
        //backgroundColor: 'red'
    },

    icon: {
        color: '#bbbbbb',
        marginRight: 5
    },

    text: {
        color: '#bbbbbb',
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 3,
    }
});