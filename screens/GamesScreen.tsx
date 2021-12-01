import React, { useCallback, useMemo } from 'react';
import { HomeStackScreenProps } from '../types';
import { Box, FlatList, Heading, Avatar, HStack, VStack, Stack, AspectRatio, Image, Text, Spacer, Center, Pressable } from 'native-base';
import gamesData from '../gamesData';

const GamesScreen = ({ navigation }: HomeStackScreenProps<'Games'>) => {
  const handlePress = (itemId: string) => {
    navigation.navigate("Game", {
      gameId: itemId
    });
  };

  return (
    <Box
      w={{
        base: "100%",
        md: "25%",
      }}
    >
      <FlatList
        data={gamesData}
        renderItem={({ item }) => (
          <Pressable onPress={() => handlePress(item.id)}>
            <Box
              alignSelf="center"
              marginY={3}
              width="90%"
              rounded="lg"
              overflow="hidden"
              borderColor="coolGray.200"
              borderWidth="1"
              _dark={{
                borderColor: "coolGray.600",
                backgroundColor: "gray.700",
              }}
              _web={{
                shadow: 2,
                borderWidth: 0,
              }}
              _light={{
                backgroundColor: "gray.50",
              }}
            >
              {/* Aspect ratio is buggy */}
              <Image
                source={{
                  uri: "https://www.holidify.com/images/cmsuploads/compressed/Bangalore_citycover_20190613234056.jpg",
                }}
                alt="image"
                height={200}
                width="100%"
                resizeMode="cover"
              />
              <HStack p="4" space={3}>
                <Heading size="md" ml="-1">
                  {item.id}
                </Heading>
                {/*arrow icon*/}
              </HStack>
            </Box>
          </Pressable>
        )}
        keyExtractor={(item) => item.id}
      />
    </Box>
  );
};

export default React.memo(GamesScreen);