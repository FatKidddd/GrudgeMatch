import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { ColorSchemeName, Pressable } from 'react-native';
import AuthScreen from '../screens/AuthScreen';
import LoadingScreen from '../screens/LoadingScreen';
import SettingsScreen from '../screens/SettingsScreen';
import GamesScreen from '../screens/GamesScreen';
import GameScreen from '../screens/GameScreen';
import { DrawerActions } from '@react-navigation/routers';
import { signOut, getAuth } from 'firebase/auth';

import { RootStackParamList, HomeStackParamList, HomeStackScreenProps, RootDrawerParamList, RootStackScreenProps, RootDrawerScreenProps } from '../types';
import LinkingConfiguration from './LinkingConfiguration';
import { Text } from 'native-base';

const Navigation = ({ colorScheme }: { colorScheme?: ColorSchemeName }) => {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Loading"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Root" component={DrawerNavigator} />
      <Stack.Screen name="Loading" component={LoadingScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} />
    </Stack.Navigator>
  );
};

const Drawer = createDrawerNavigator<RootDrawerParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();

const HomeNavigator = () => {
  return (
    <HomeStack.Navigator
      initialRouteName='Games'
      screenOptions={{ headerLeft: () => null }}
    >
      <HomeStack.Screen
        name="Games"
        component={GamesScreen}
        options={({ navigation }: HomeStackScreenProps<'Games'>) => ({
          headerLeft: () => (
            <Pressable
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
              })}>
              <Ionicons
                name="md-menu"
                size={25}
                style={{ marginRight: 15 }}
              />
            </Pressable>
          ),
          gestureEnabled: false
        })}
      />
      <HomeStack.Screen
        name="Game"
        component={GameScreen}
        options={({ navigation }: HomeStackScreenProps<'Game'>) => ({
          headerShown: false,
          headerLeft: () => (
            <Pressable
              onPress={() => navigation.navigate('Games')}
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
              })}>
              <FontAwesome
                name="chevron-left"
                size={20}
                style={{ marginRight: 15 }}
              />
            </Pressable>
          )
        })}
      />
    </HomeStack.Navigator>
  );
};

const handleLogOut = () => {
  const auth = getAuth();
  signOut(auth);
  console.log("Logged out");
};

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={{
      }}>
      <Drawer.Screen
        name="Home"
        component={HomeNavigator}
        options={({ navigation }: RootDrawerScreenProps<'Home'>) => ({
          headerShown: false
        })}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={({ navigation }: RootDrawerScreenProps<'Settings'>) => ({
          headerRight: () => ( 
            <Pressable
              onPress={handleLogOut}
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
                marginRight: 12
              })}>
              <Text color='red.500'>Log out</Text>
            </Pressable>
           )
        })}
      />
    </Drawer.Navigator>
  );
};

// function TabBarIcon(props: {
//   name: React.ComponentProps<typeof FontAwesome>['name'];
//   color: string;
// }) {
//   return <FontAwesome size={30} style={{ marginBottom: -3 }} {...props} />;
// }

export default Navigation;