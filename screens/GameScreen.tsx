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

  const gamesImagePath = '../assets/images/games/';

  const renderGame = (gameId: string) => {
    switch (gameId) {
      case "golf":
        const bgImg = gamesData[gameId].imageName;
        const path = gamesImagePath + bgImg;
        return (
          <ImageBackground
            source={require('../assets/images/games/golf_bg.jpg')}
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

  return renderGame(route.params.gameId);
};

export default GameScreen;