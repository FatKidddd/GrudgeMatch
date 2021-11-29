import React, { Component } from 'react';
import HomeScreen from '../screens/personal/Home';
import ProfileScreen from '../screens/personal/Profile';
import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItemList, createDrawerNavigator, DrawerItem } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { DrawerActions } from '@react-navigation/routers';
import firebase from 'firebase';
import { View, Alert } from 'react-native';

function CustomDrawerContent(props) {
    const signOutUser = () => {
        firebase.auth().signOut();
    };

    const sayMessage = () => {
        Alert.alert(
            'You died',
            'GG',
            [],
            { cancelable: false },
        );
    };

    const killMyself = () => {
        Alert.alert(
            'Die',
            'Are you sure you want to die?',
            [
                { text: 'No', onPress: null },
                { text: 'Yes', onPress: () => { setTimeout(() => sayMessage(), 1000) } }
            ],
            { cancelable: false },
        );
    };

    return (
        <DrawerContentScrollView {...props}>
            <DrawerItemList {...props} />
            <DrawerItem label='Kill Myself' onPress={killMyself} />
            <DrawerItem label='Log Out' onPress={signOutUser} />
        </DrawerContentScrollView>
    );
}

const Drawer = createDrawerNavigator();

const LoggedInDrawer = ({ navigation, route }) => {
    return (
        //drawerContent={() => <DrawerItem label='Log Out' onPress={() => AsyncStorage.removeItem('token')} />}
        // Header for screens do not work in drawer nav, so stack nav are used.
        <Drawer.Navigator 
            initialRouteName='Home' 
            drawerContent={({ ...props }) => 
                <CustomDrawerContent {...props} />
            }
        >
            <Drawer.Screen 
                name='Home' 
                component={HomeScreen} 
                options={({ navigation }) => ({
                    headerLeft: () => (
                        <Ionicons
                            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
                            name='ios-menu'
                            size={30}
                            style={{ paddingLeft: 20, color: 'white' }}
                        />
                    ),
                })}
            />
            <Drawer.Screen 
                name='Profile' 
                component={ProfileScreen} 
                options={({ navigation }) => ({
                    headerLeft: () => (
                        <Ionicons
                            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
                            name='ios-menu'
                            size={30}
                            style={{ paddingLeft: 20, color: 'white' }}
                        />
                    ),
                })}
            />
        </Drawer.Navigator>
    );
};

export default LoggedInDrawer;
