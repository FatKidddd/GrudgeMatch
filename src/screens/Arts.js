import React from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import { Background } from '../components/common';

const ArtsScreen = ({ navigation }) => {
    return (
        <Background>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text>Arts Screen</Text>
                <Button
                    title='Go To Home Screen'
                    onPress={() => navigation.navigate('Home')}
                />
            </View>
        </Background>
    );
}

export default ArtsScreen;