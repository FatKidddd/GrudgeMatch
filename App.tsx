import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './redux/store';
import { Provider } from 'react-redux';
import { NativeBaseProvider, extendTheme } from "native-base";
import useCachedResources from './hooks/useCachedResources';
import Navigation from './navigation';
// Import the functions you need from the SDKs you need
import { StatusBar, LogBox } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';

LogBox.ignoreLogs(['Setting a timer for a long period of time'])

import { initializeApp } from "firebase/app";
// import { initializeAuth } from 'firebase/auth';
// import { getReactNativePersistence } from 'firebase/auth/react-native';

import { SSRProvider } from '@react-aria/ssr';
import { initializeFirestore } from "firebase/firestore"; 

import { connectToDevTools } from "react-devtools-core";

if (__DEV__) {
  connectToDevTools({
    host: "localhost",
    port: 8097,
  });
}

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
initializeFirestore(app, {
  // useFetchStreams: false,
  // cacheSizeBytes: 100000000,
  experimentalForceLongPolling: true // bug fix for when running on android standalone app
});
// enableIndexedDbPersistence(getFirestore())
//   .catch((err) => {
//     console.error(err);
//   });

// Provide it to initializeAuth.
// const auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
LogBox.ignoreLogs(['AsyncStorage has been extracted from react-native core and will be removed in a future release']); 

const theme = extendTheme({
  components: {
    Button: {
      // baseStyle: ({ colorScheme }) => ({
      //   // color: 'red.200'
      //   // rounded: 'md',
      //   bg: `${colorScheme}.200`
      // }),
      // baseStyle: {
      //   font
      // },
      defaultProps: {
        colorScheme: 'teal',
        // variant: 'subtle'
        // _text: {
        //   color: 'white'
        // }
      },
    },
  },
  config: {
    useSystemColorMode: false,
    //initialColorMode: "dark",
  }
});


export default function App() {
  const isLoadingComplete = useCachedResources();
  
  // console.log(Application.applicationId)
  // console.log(Application.applicationName)
  // console.log(Constants.manifest)
  if (!isLoadingComplete) return null;
  return (
    <Provider store={store}>
      <SSRProvider>
        <NativeBaseProvider theme={theme}>
          <SafeAreaProvider>
            <Navigation />
          </SafeAreaProvider>
        </NativeBaseProvider>
      </SSRProvider>
    </Provider>
  );
};


