//import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Timestamp } from 'firebase/firestore';

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
  Game: {
    gameId: string;
  };
};

export type HomeStackScreenProps<Screen extends keyof HomeStackParamList> = NativeStackScreenProps<
  HomeStackParamList,
  Screen
>;

export interface User {
  id: string;
  name: string;
  roomNames: {
    [gameId: string]: string;
  };
  imageUrl?: string;
  // collection pastGames 
    // with game / sportId as document 
      // and collection of past rooms
// #FFABAB, #FFDAAB, #DDFFAB, #ABE4FF, #D9ABFF
  // #F2E7D2, #F79EB1, #AE8FBA, #4C5E91, #473469
};

export interface Game {
  id: string;
  name: string;
  pictureUrl: string;
};


// Game refers to one room of multiple people
export interface Room {
  id: string;
  userIds: Array<string>;
  dateCreated: string; // may need to change to just Date type --> nvm it has to be string because Date is not serializable
  dateEnded?: string | null | undefined;
  gameId: string;
  gameOwnerUserId: string;
  bannedUserIds: Array<string>;
  gameEnded: boolean;

  // or qrcode
  //room name is now id roomName: string;
  password: string;

  prepDone: boolean;
};

// possible to create two rooms with exact same name by sending at the same time?

// cant think of a better variable name because the game and room are interlinked
export type Stroke = number | null;

export type GolfStrokes = Stroke[];
// [
//   Stroke, Stroke, Stroke, Stroke, Stroke, Stroke,
//   Stroke, Stroke, Stroke, Stroke, Stroke, Stroke,
//   Stroke, Stroke, Stroke, Stroke, Stroke, Stroke
// ] | [
//   Stroke, Stroke, Stroke, Stroke, Stroke, Stroke,
//   Stroke, Stroke, Stroke
// ];

export interface HandicapInfo {
  give: boolean;
  frontCount: number;
  backCount: number;
  locked: boolean;
};

export interface GolfGame extends Room {
  golfCourseId?: string;

  usersStrokes: {
    [userId: string]: GolfStrokes;
  }
  pointsArr: {
    // userId1 + '-' + userId2
    [userPairId: string]: HandicapInfo;
  };

  winnerId?: string;

  frontBetAmount?: number;
  backBetAmount?: number;
  betIsSingleHole?: boolean;

};

export interface GolfCourse {
  id: string;
  location: string;
  name: string;
  clubName: string;
  parArr: Array<number>;
  handicapIndexArr: Array<number>;
};

export interface Games {
  golf: GolfGame;
};

export type SavedRoom = {
  id: string;
  dateSaved: string;
};