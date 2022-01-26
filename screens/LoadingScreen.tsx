import React from 'react';
import { Center, Spinner } from 'native-base';
import { RootStackScreenProps } from '../types';

const LoadingScreen = ({ navigation }: RootStackScreenProps<'Loading'>) => {
  return (
    <Center flex={1}>
      <Spinner size="lg" />
    </Center>
  );
};

export default LoadingScreen;