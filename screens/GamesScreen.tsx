import React, { useCallback, useMemo } from 'react';
import { HomeStackScreenProps } from '../types';
import { Box, FlatList, Heading, Avatar, HStack, VStack, Stack, AspectRatio, Image, Text, Spacer, Center, Pressable } from 'native-base';
import gamesData, { GameDataType, GamesDataType } from '../gamesData';
import { useUser } from '../hooks/useFireGet';

const GamesScreen = ({ navigation }: HomeStackScreenProps<'Games'>) => {
  const handlePress = (itemId: string) => {
    navigation.navigate("Game", { gameId: itemId } as { gameId: keyof GamesDataType; });
  };

  const data = Object.values(gamesData).sort((a: GameDataType, b: GameDataType) => {
    return a.name < b.name ? -1 : a.name === b.name ? 0 : 1;
  });

  // const [user, userIsLoading] = useUser('Hh5YbkLZuOaSJ60DPN1MWB9MORg2');
  // const [user2, userIsLoading2] = useUser('Hh5YbkLZuOaSJ60DPN1MWB9MORg2', true);

  const renderItem = useCallback(({ item }: { item: GameDataType }) => (
    <Pressable onPress={() => handlePress(item.id)}>
      <Box
        alignSelf="center"
        marginY={3}
        width="90%"
        rounded="lg"
        overflow="hidden"
        borderColor="coolGray.200"
        borderWidth="1"
        // _dark={{
        //   borderColor: "coolGray.600",
        //   backgroundColor: "gray.700",
        // }}
        // _web={{
        //   shadow: 2,
        //   borderWidth: 0,
        // }}
        _light={{
          backgroundColor: "gray.50",
        }}
      >
        {/* Aspect ratio is buggy */}
        <Image
          source={item.imagePath}
          alt="image"
          height={200}
          width="100%"
          resizeMode="cover"
        />
        <HStack p="4" space={3}>
          <Heading size="md">
            {item.name}
          </Heading>
          {/*arrow icon*/}
        </HStack>
      </Box>
    </Pressable>
  ), []);

  return (
    <Box width='100%' flex={1}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </Box>
  );
};

export default GamesScreen;