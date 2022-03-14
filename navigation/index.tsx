import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ColorSchemeName, Pressable } from 'react-native';
import AuthScreen from '../screens/AuthScreen';
import LoadingScreen from '../screens/LoadingScreen';
import SettingsScreen from '../screens/SettingsScreen';
import GamesScreen from '../screens/GamesScreen';
import GameScreen from '../screens/GameScreen';
import ShopScreen from '../screens/ShopScreen';
import { signOut, getAuth, onAuthStateChanged } from 'firebase/auth';

import { RootStackParamList, HomeStackParamList, HomeStackScreenProps, RootDrawerParamList, RootStackScreenProps, RootDrawerScreenProps } from '../types';
import LinkingConfiguration from './LinkingConfiguration';
import { Text } from 'native-base';
import { useAppDispatch, useAppSelector } from '../hooks/selectorAndDispatch';
import { setIsSignedIn } from '../redux/features/info';
import { HamburgerButton, BackButton, createLocalFileCache, setDefaultImageCache } from '../components';

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

const cache = createLocalFileCache();
setDefaultImageCache(cache);

const RootNavigator = () => {
  const isSignedIn = useAppSelector(state => state.info.isSignedIn);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async user => {
      dispatch(setIsSignedIn(!!user));
    });
    return () => unsubscribe();
  }, []);

  return (
    <Stack.Navigator
      // initialRouteName="Loading"
      screenOptions={{ headerShown: false }}
    >
      {isSignedIn === null
        ? <Stack.Screen name="Loading" component={LoadingScreen} />
        : isSignedIn
          ? <Stack.Screen name="Root" component={DrawerNavigator} />
          : <Stack.Screen name="Auth" component={AuthScreen} options={{ animationTypeForReplace: !isSignedIn ? "pop" : "push" }}/>}
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
        options={(navProps: HomeStackScreenProps<'Games'>) => ({
          headerLeft: () => <HamburgerButton {...navProps} isGamesScreen={true} />,
          gestureEnabled: false
        })}
      />
      <HomeStack.Screen
        name="Game"
        component={GameScreen}
        options={({ navigation }: HomeStackScreenProps<'Game'>) => ({
          headerShown: false,
          headerLeft: () => <BackButton onPress={() => navigation.navigate('Games')}/>
        })}
      />
    </HomeStack.Navigator>
  );
};

const handleLogOut = () => {
  const auth = getAuth();
  signOut(auth);
  cache.clearAsync(); // clear images
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
        name="Shop"
        component={ShopScreen}
        options={(navProps: RootDrawerScreenProps<'Shop'>) => ({
          headerLeft: () => <HamburgerButton {...navProps} />
        })}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={(navProps: RootDrawerScreenProps<'Settings'>) => ({
          headerLeft: () => <HamburgerButton {...navProps} />,
          headerRight: () => ( 
            <Pressable
              onPress={handleLogOut}
              style={({ pressed }) => ({
                opacity: pressed ? 0.5 : 1,
                marginRight: 15
              })}>
              <Text color='red.500'>Log out</Text>
            </Pressable>
          )
        })}
      />
    </Drawer.Navigator>
  );
};

export default Navigation;