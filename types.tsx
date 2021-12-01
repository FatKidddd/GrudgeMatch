//import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

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
  id: String;
  name: String;
  pastGames: {
    [gameId: string]: Array<String>;
  }
};

export interface Game {
  id: String;
  name: String;
  pictureUrl: String;
};


// Game refers to one room of multiple people
export interface Room {
  userIds: Array<String>;
  dateCreated: Date;
  gameId: String;
  gameOwnerUserId: String;
  bannedUserIds: Array<String>;

  // or qrcode
  //room name is now id roomName: String;
  password: String;
};

// possible to create two rooms with exact same name by sending at the same time?

// cant think of a better variable name because the game and room are interlinked
export interface GolfGame extends Room {
  location?: String;
  course?: String;
  difficulty?: Number;
  parArr?: Array<Number>;
  handicapIndexArr?: Array<Number>;
  usersStrokes: {
    [userId: string]: Array<Number>;
  }
  usersStrokesParBirdieCount: {
    [userId: string]: [Number, Number, Number];
  }
  pointsArr: {
    // userId1 + '-' + userId2
    [userPairId: string]: {
      give: Boolean | true;
      frontCount: Number | 0;
      backCount: Number | 0;
      netPoints: Number | 0;
    };
  };

  winnerId?: String;

  frontBetAmount?: Number | 5;
  backBetAmount?: Number | 10;
  betIsSingleHole?: Boolean | true;
};