import { DocumentData, QueryDocumentSnapshot, Timestamp } from "firebase/firestore";
import { GolfGame, SavedRoom } from "../../types";
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { GamesDataType } from "../../gamesData";

export type SavedGames = { // finally managed to get this working
  [gameId in keyof GamesDataType]: {
    savedRooms: SavedRoom[],
    lastVisibleId: string | null | undefined;
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
    lastVisibleId: undefined
  }
};

export const gamesHistorySlice = createSlice({
  name: 'gamesHistory',
  initialState,
  reducers: {
    // increment: (state) => {
    //   state.value += 1
    // },
    addSavedRooms: (state, action: PayloadAction<{ gameId: keyof GamesDataType, savedRooms: SavedRoom[], lastVisibleId: string | null | undefined }>) => {
      const { gameId, savedRooms, lastVisibleId } = action.payload;
      state[gameId].savedRooms.push(...savedRooms);
      state[gameId].lastVisibleId = lastVisibleId;
      console.log(state)
    },
    deleteSavedRooms: (state, action: PayloadAction<keyof GamesDataType>) => {
      const gameId = action.payload;
      state[gameId] = {
        savedRooms: [],
        lastVisibleId: undefined
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
