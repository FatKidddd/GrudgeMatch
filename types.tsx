/**
 * Learn more about using TypeScript with React Navigation:
 * https://reactnavigation.org/docs/typescript/
 */

//import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DrawerScreenProps } from '@react-navigation/drawer';

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
   
  // screens: {
  //   Root: {
  //     screens: {
  //       Home: {
  //         screens: {
  //           Games: 'games',
  //           Game: 'game'
  //         },
  //       },
  //       Profile: 'profile',
  //       Settings: 'settings'
  //     },
  //   },
  //   Loading: 'loading',
  //   Auth: 'auth'
  // },


export type RootStackParamList = {
  Root: NavigatorScreenParams<RootDrawerParamList> | undefined;
  Loading: undefined;
  Auth: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  Screen
>;

export type RootDrawerParamList = {
  Home: NavigatorScreenParams<HomeStackParamList> | undefined;
  Profile: undefined;
  Settings: undefined;
};

export type RootDrawerScreenProps<Screen extends keyof RootDrawerParamList> = CompositeScreenProps<
  NativeStackScreenProps<RootDrawerParamList, Screen>,
  NativeStackScreenProps<RootStackParamList>
>;

export type HomeStackParamList = {
  Games: undefined;
  Game: undefined;
};

export type HomeStackScreenProps<Screen extends keyof HomeStackParamList> = NativeStackScreenProps<
  HomeStackParamList,
  Screen
>;

interface User {
  id: String;
  name: String;
  sportIds: Array<String>
  pastGames: {
    sportId1: Array<gameId>
    ...
  }
};

interface Sport {
  id: String;
  name: String;
  pictureUrl: String;
};

interface UserGolfGame extends Game {
  id: String;
  userId: String;
  strokes: Array<Number>
  parArr: Array<Number>
  handicapIndexArr: Array<Number>
  strokesCount?: Number;
  parCount?: Number;
  birdieCount?: Number;
  location?: String;
  difficulty?: Number;
};

// Game refers to one room of multiple people
interface Game {
  id: String;
  userIds: Array<String>
  dateCreated: Number
  sportId: String;

  // or qrcode
  gameCode: String
  password: String
};