import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Application from 'expo-application';
import Constants from 'expo-constants';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyArYG40JyZ01TC1fC464x-VJ9_j2_5Bjl4",
  authDomain: "grudgematch-594b7.firebaseapp.com",
  projectId: "grudgematch-594b7",
  storageBucket: "grudgematch-594b7.appspot.com",
  messagingSenderId: "848401189581",
  appId: "1:848401189581:web:ff6dc00b83762bc5b27784",
  measurementId: "G-GKVFZ8EX09"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


import {
  Text,
  Link,
  HStack,
  Center,
  Heading,
  Switch,
  useColorMode,
  NativeBaseProvider,
  extendTheme,
  VStack,
  Code,
} from "native-base";
import LoginScreen from './screens/Login';

// Define the config
const config = {
  useSystemColorMode: false,
  initialColorMode: "dark",
};

// extend the theme
export const theme = extendTheme({ config });

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();
  
  console.log(Application.applicationId)
  // console.log(Application.applicationName)
  // console.log(Constants.manifest)
  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <NativeBaseProvider>
        {/* <SafeAreaProvider>
          <Navigation colorScheme={colorScheme} />
          <StatusBar />
        </SafeAreaProvider> */}
        <LoginScreen />
        {/* <Center
          _dark={{ bg: "blueGray.900" }}
          _light={{ bg: "blueGray.50" }}
          px={4}
          flex={1}
        >
          <VStack space={5} alignItems="center">
            <Heading size="lg">Welcome to NativeBase</Heading>
            <HStack space={2} alignItems="center">
              <Text>Edit</Text>
              <Code>App.tsx</Code>
              <Text>poop and save to reload.</Text>
            </HStack>
            <Link href="https://docs.nativebase.io" isExternal>
              <Text color="primary.500" underline fontSize={"xl"}>
                Learn NativeBase
              </Text>
            </Link>
            <ToggleDarkMode />
          </VStack>
        </Center>
        */}
      </NativeBaseProvider>
    );
  }
};

// Color Switch Component
function ToggleDarkMode() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <HStack space={2} alignItems="center">
      <Text>Dark</Text>
      <Switch
        isChecked={colorMode === "light" ? true : false}
        onToggle={toggleColorMode}
        aria-label={
          colorMode === "light" ? "switch to dark mode" : "switch to light mode"
        }
      />
      <Text>Light</Text>
    </HStack>
  );
}

