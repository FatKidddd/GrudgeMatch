import { Text, View } from 'native-base';
import React from 'react';
import { HomeStackScreenProps } from '../types';

const GameScreen = ({}: HomeStackScreenProps<'Game'>) => {
  return (
    <View>
      <Text>Poop</Text>
    </View>
  );
};

export default GameScreen;