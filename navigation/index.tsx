import { FontAwesome } from '@expo/vector-icons';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { ColorSchemeName, Pressable } from 'react-native';
import AuthScreen from '../screens/AuthScreen';
import LoadingScreen from '../screens/LoadingScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import GamesScreen from '../screens/GamesScreen';
import GameScreen from '../screens/GameScreen';

import { RootStackParamList, HomeStackParamList, HomeStackScreenProps, RootDrawerParamList, RootStackScreenProps, RootDrawerScreenProps } from '../types';
import LinkingConfiguration from './LinkingConfiguration';

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
    <Stack.Navigator>
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
    <HomeStack.Navigator initialRouteName='Games'>
      <HomeStack.Screen name="Games" component={GamesScreen} />
      <HomeStack.Screen name="Game" component={GameScreen} />
    </HomeStack.Navigator>
  );
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
          title: 'Games',
          // headerRight: () => (
          //   <Pressable
          //     onPress={() => navigation.navigate('Modal')}
          //     style={({ pressed }) => ({
          //       opacity: pressed ? 0.5 : 1,
          //     })}>
          //     <FontAwesome
          //       name="info-circle"
          //       size={25}
          //       style={{ marginRight: 15 }}
          //     />
          //   </Pressable>
          // ),
        })}
      />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
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