import { GolfGame } from "../../types";
import { SET_GAMES } from "../actionTypes";

export interface GamesHistory {
  "game1": Array<GolfGame>;

  // gameId: Array<___Game>;
};

const defaultState: GamesHistory = {
  "game1": [],
};

const gamesHistoryReducer = (state = defaultState, action: any) => {
  switch (action.type) {
    case SET_GAMES: {
      const { gameId, rooms } = action.payload;
      return {
        ...state,
        [gameId]: rooms
      };
    }
    default: {
      return state;
    }
  }
};

export default gamesHistoryReducer;