import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './redux/store';
import { Provider } from 'react-redux';
import { NativeBaseProvider, extendTheme } from "native-base";
import useCachedResources from './hooks/useCachedResources';
import Navigation from './navigation';
// Import the functions you need from the SDKs you need
import * as Application from 'expo-application';
import Constants from 'expo-constants';
import { StatusBar, LogBox, View } from 'react-native';

LogBox.ignoreLogs(['Setting a timer for a long period of time'])

import { initializeApp } from "firebase/app";

import { SSRProvider } from '@react-aria/ssr';

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

const config = {
  useSystemColorMode: false,
  initialColorMode: "dark",
};

export const theme = extendTheme({ config });

export default function App() {
  const isLoadingComplete = useCachedResources();
  
  // console.log(Application.applicationId)
  // console.log(Application.applicationName)
  // console.log(Constants.manifest)
  if (!isLoadingComplete)
    return null;
  return (
    <Provider store={store}>
      <SSRProvider>
        <NativeBaseProvider>
          <SafeAreaProvider>
            <Navigation />
            <StatusBar />
          </SafeAreaProvider>
        </NativeBaseProvider>
      </SSRProvider>
    </Provider>
  );
};


