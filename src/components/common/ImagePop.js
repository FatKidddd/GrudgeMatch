import React from 'react';
import { Modal, View, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

export const ImagePop = ({ image, imageZoom, changeImageZoom }) => {
    return (
        <Modal
            animationType="slide"
            transparent={false}
            visible={imageZoom}
            presentationStyle={'pageSheet'}
        >
            <View style={{ flex: 1, marginTop: Constants.statusBarHeight, alignItems: 'center', justifyContent: 'center', backgroundColor: 'black' }}>
                <TouchableOpacity onPress={changeImageZoom} style={{ alignSelf: 'flex-end', padding: 20, marginRight: 10 }}>
                    <Ionicons name='md-close' size={30} style={{ color: 'white' }} />
                </TouchableOpacity>
                <View style={{ flex: 1, width: '100%' }}>
                    <Image source={{ uri: image }} style={{ width: '100%', height: '100%', resizeMode: 'contain' }} />
                </View>
            </View>
        </Modal>
    );
};