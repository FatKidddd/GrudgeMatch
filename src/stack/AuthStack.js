import React from 'react';
import TogetherScreen from '../screens/auth/TogetherScreen';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomeScreen from '../screens/auth/Welcome';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AuthStack = createStackNavigator();

const AuthStackNavigator = () => {
    return (
        <AuthStack.Navigator>
            <AuthStack.Screen 
                name='Welcome' 
                component={WelcomeScreen} 
                options={({ navigation }) => ({
                    headerShown: false
                })}
            />
            <AuthStack.Screen 
                name='Together' 
                component={TogetherScreen}
                options={({ navigation }) => ({
                    title: 'Authentication',
                    headerTransparent: true,
                    headerLeft: () => (
                        <TouchableOpacity
                            style={{ paddingLeft: 20 }}
                            onPress={() => {
                                navigation.navigate('Welcome');
                            }}
                        >
                            <Ionicons size={30} name='ios-arrow-back' />
                        </TouchableOpacity>
                    )
                })}
            />
        </AuthStack.Navigator>
    );
};

export default AuthStackNavigator;