import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { GolfGame } from "../../types";
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { GamesDataType } from "../../gamesData";

export type SavedRoom = {
  id: string;
  dateSaved: Date;
};

export type SavedGames = { // finally managed to get this working
  [gameId in keyof GamesDataType]: {
    savedRooms: SavedRoom[],
    lastVisible: QueryDocumentSnapshot<DocumentData> | null | undefined;
  };
}

export interface GamesHistory extends SavedGames {
  rooms: { // need to use a map because if someone has like 1000+ rooms, need to clear cache, will implement this in the future
    [roomName: string]: GolfGame;
  };
};

const initialState: GamesHistory = {
  rooms: {},
  golf: {
    savedRooms: [],
    lastVisible: null
  }
};

export const gamesHistorySlice = createSlice({
  name: 'gamesHistory',
  initialState,
  reducers: {
    // increment: (state) => {
    //   state.value += 1
    // },
    addSavedRooms: (state, action: PayloadAction<{ gameId: keyof GamesDataType, savedRooms: SavedRoom[], lastVisible: QueryDocumentSnapshot<DocumentData> | null }>) => {
      const { gameId, savedRooms, lastVisible } = action.payload;
      state[gameId].savedRooms.concat(savedRooms);
      state[gameId].lastVisible = lastVisible;
    },
    deleteSavedRooms: (state, action: PayloadAction<keyof GamesDataType>) => {
      const gameId = action.payload;
      state[gameId] = {
        savedRooms: [],
        lastVisible: null
      };
    },
    addRoom: (state, action: PayloadAction<GolfGame>) => {
      const room = action.payload;
      state.rooms[room.id] = room;
    },
  },
});

// Action creators are generated for each case reducer function
export const { addSavedRooms, addRoom, deleteSavedRooms } = gamesHistorySlice.actions;

export default gamesHistorySlice.reducer;
