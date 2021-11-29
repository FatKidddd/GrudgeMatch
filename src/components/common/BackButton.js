import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BackButton = ({ size, onPress }) => {
    return (
        <TouchableOpacity
            style={styles.button}
            onPress={onPress}
        >
            <Ionicons size={size} name='ios-arrow-back' style={{ color: 'white' }} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: { 
        paddingHorizontal: 20, 
        paddingVertical: 5 
    },

});

export { BackButton };