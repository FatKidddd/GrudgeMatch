import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './redux/store';
import { Provider } from 'react-redux';
import { NativeBaseProvider, extendTheme } from "native-base";
import useCachedResources from './hooks/useCachedResources';
import Navigation from './navigation';
import { Platform, LogBox } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
// import { initializeAuth } from 'firebase/auth';
// import { getReactNativePersistence } from 'firebase/auth/react-native';
import { SSRProvider } from '@react-aria/ssr';
import { initializeFirestore } from "firebase/firestore"; 
import * as Sentry from 'sentry-expo';

import Purchases from 'react-native-purchases';

LogBox.ignoreLogs(['Setting a timer for a long period of time'])

// import { connectToDevTools } from "react-devtools-core";
// if (__DEV__) {
//   connectToDevTools({
//     host: "localhost",
//     port: 8097,
//   });
// }


Sentry.init({
  dsn: 'https://d31ec085382e42eaacb1b149685ab924@o1140567.ingest.sentry.io/6197877',
  enableInExpoDevelopment: true,
  debug: true, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
});

// // Access any @sentry/react-native exports via:
// Sentry.Native.*

// // Access any @sentry/browser exports via:
// Sentry.Browser.*


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
  colors: {
    main: {
      '1': '#277699',
      '2': '#52FFAE',
      '3': '#118C53',
      '4': '#D94530',
      '5': '#21A351'
    }
  },
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
      // baseStyle: {
      //   bg: '#66beb2'
      // },
      defaultProps: {
        colorScheme: 'teal',
        // bg: 'teal.500',
        
        // variant: 'subtle'
        // _text: {
        //   color: 'gray.50'
        // }
      },
    },
  },
  config: {
    useSystemColorMode: false,
    //initialColorMode: "dark",
  }
});

const usePurchases = () => {
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      Purchases.setDebugLogsEnabled(true);
      if (Platform.OS === 'ios') {
        await Purchases.setup("appl_TCecRMmBIWTliKafwPvjVJxZFIf");
      } else if (Platform.OS === 'android') {
        await Purchases.setup("goog_RmsPfLAzUwRclxkDyPKZyrpJDTK");
        // // OR: if building for Amazon, be sure to follow the installation instructions then:
        //   await Purchases.setup({ apiKey: "public_amazon_sdk_key", useAmazon: true });
      }
      setDone(true);
    })();
  }, []);

  return done;
};


export default function App() {
  const loadedCachedResources = useCachedResources();
  const loadedPurchases = usePurchases();

  // console.log(Application.applicationId)
  // console.log(Application.applicationName)
  // console.log(Constants.manifest)
  if (!loadedCachedResources || !loadedPurchases) return null;
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


