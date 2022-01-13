import React, { useEffect, useMemo } from 'react';
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
        return <GolfGameScreen navigation={navigation}/>
      case "game2":
        return null;
      default:
        return null;
    }
  };

  return renderGame(route.params.gameId);
};

export default GameScreen;