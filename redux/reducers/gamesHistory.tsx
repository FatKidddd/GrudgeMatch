import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { GolfGame } from "../../types";
import { ADD_ROOMS_MAP, ADD_ROOMS_TO_GAME, DELETE_ROOMS } from "../actionTypes";

// will need to change the structure of everything when more games are introduced, for now only one

export interface SavedGolfGame {
  id: string;
  dateSaved: Date;
};

export interface SavedGolfGames {
  rooms: Array<SavedGolfGame>;
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
};

export interface GamesHistory {
  "golf": SavedGolfGames;
  rooms: { // need to use a map because if someone has like 1000+ rooms, need to clear cache, will implement this in the future
    [roomName: string]: GolfGame;
  };
  // gameId: Array<___Game>;
};

const defaultState: GamesHistory = {
  "golf": {
    rooms: [],
    lastVisible: null
  },
  rooms: {},
};

const gamesHistoryReducer = (state = defaultState, action: any) => {
  switch (action.type) {
    case ADD_ROOMS_TO_GAME: {
      const { gameId, rooms, lastVisible } = action.payload;
      return {
        ...state,
        [gameId]: {
          lastVisible,
          rooms: [...state[gameId as 'golf'].rooms, ...rooms]
        }
      };
    }
    case ADD_ROOMS_MAP: {
      const roomsToAdd = action.payload;
      return {
        ...state,
        rooms: {
          ...state.rooms,
          ...roomsToAdd
        }
      };
    }
    case DELETE_ROOMS: {
      const gameId = action.payload;
      return {
        ...state,
        [gameId]: {
          lastVisible: null,
          rooms: []
        }
      }
    }
    default: {
      return state;
    }
  }
};

export default gamesHistoryReducer;