import React, { useEffect } from 'react';
import { ImageBackground } from 'react-native';
import gamesData from '../gamesData';
import { HomeStackScreenProps } from '../types';
import { GolfGameScreen } from './games';

const GameScreen = (props: HomeStackScreenProps<'Game'>) => {
  const { navigation, route } = props;

  useEffect(() => {
    if (!(route.params && route.params.gameId)) {
      navigation.navigate("Games");
    }
  }, []);

  const renderGame = (gameId: string) => {
    switch (gameId) {
      case "golf":
        return (
          <ImageBackground
            source={gamesData[gameId].imagePath}
            resizeMode="cover"
            style={{ flex: 1, backgroundColor: '#eeeeee' }}
            imageStyle={{ opacity: 0.4 }}
            // blurRadius={10}
          >
            <GolfGameScreen navigation={navigation}/>
          </ImageBackground>
        );
      default:
        return null;
    }
  };

  return renderGame('golf'); //route.params.gameId);
};

export default GameScreen;