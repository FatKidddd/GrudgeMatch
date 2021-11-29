import { Text, View } from 'native-base';
import React from 'react';
import { HomeStackScreenProps } from '../types';

const GamesScreen = ({}: HomeStackScreenProps<'Games'>) => {
  return (
    <View>
      <Text>Poop</Text>
    </View>
  );
};

export default GamesScreen;