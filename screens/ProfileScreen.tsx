import { Text, View } from 'native-base';
import React from 'react';
import { RootDrawerScreenProps } from '../types';

const ProfileScreen = ({}: RootDrawerScreenProps<'Profile'>) => {
  return (
    <View>
      <Text>Poop</Text>
    </View>
  );
};

export default ProfileScreen;