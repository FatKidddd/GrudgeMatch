import React from 'react';
import { Pressable } from 'native-base';
import { FontAwesome } from '@expo/vector-icons';

export default function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.5 : 1,
      })}>
      <FontAwesome
        name="chevron-left"
        size={20}
        style={{ marginRight: 15 }}
      />
    </Pressable>
  );
};