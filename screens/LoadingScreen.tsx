import React, { useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { View, Spinner } from 'native-base';
import { RootStackScreenProps } from '../types';

const LoadingScreen = ({ navigation }: RootStackScreenProps<'Loading'>) => {

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async user => {
      //console.log(user)
      if (user) {
        navigation.navigate('Root', {
          screen: 'Home',
          params: {
            screen: 'Games'
          }
        });
      } else {
        navigation.navigate('Auth');
      }
    });
  }, []);

  return (
    <View>
      <Spinner />
    </View>
  );
};

export default LoadingScreen;