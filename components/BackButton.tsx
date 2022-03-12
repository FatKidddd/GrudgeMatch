import React from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

export default function BackButton({ onPress }: { onPress: () => void }) {
  return (
      // style={({ pressed }) => ({
      //   opacity: pressed ? 0.5 : 1,
      // })}>
    <TouchableOpacity onPress={onPress}>
      <FontAwesome
        name="chevron-left"
        size={20}
        style={{ marginRight: 15, padding: 5 }}
      />
    </TouchableOpacity>
  );
};