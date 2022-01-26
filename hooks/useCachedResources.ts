import { FontAwesome } from '@expo/vector-icons';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Asset } from 'expo-asset';
import { Image } from 'react-native';
import gamesData, { GameDataType } from '../gamesData';
import React, { useState, useEffect } from 'react';

const cacheImages = (images: any[]) => {
  return images.map(image => {
    if (typeof image === 'string') {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
};

// const cacheFonts = (fonts: any[]) => {
//   return fonts.map(font => Font.loadAsync(font));
// };

const useCachedResources = () => {
  const [isLoadingComplete, setLoadingComplete] = useState(false);

  const loadAssetsAsync = async () => {
    try {
      SplashScreen.preventAutoHideAsync();
      const imageAssets = cacheImages([
        // 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
        ...Object.values(gamesData).map((e: GameDataType) => e.imagePath)
      ]);

      const fontAssets = Font.loadAsync({
        ...FontAwesome.font,
        'space-mono': require('../assets/fonts/SpaceMono-Regular.ttf'),
      });

      await Promise.all([...imageAssets, fontAssets]);
    } catch (e) {
      // We might want to provide this error information to an error reporting service
      console.warn(e);
    } finally {
      setLoadingComplete(true);
      SplashScreen.hideAsync();
    }
  };

  // Load any resources or data that we need prior to rendering the app
  useEffect(() => {
    loadAssetsAsync();
  }, []);

  return isLoadingComplete;
}

export default useCachedResources;