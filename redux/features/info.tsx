import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// type IsGettingMap = {
//   ['isGetting' + 'Room' | 'User' | 'GolfCourse']: boolean;
// };

interface Info {
  isSignedIn: boolean | null;
  isGettingIds: { // useless
    [id: string]: boolean;
  }
}

const initialState: Info = {
  isSignedIn: null,
  isGettingIds: {}
};

export const infoSlice = createSlice({
  name: 'info',
  initialState,
  reducers: {
    setIsSignedIn: (state, action: PayloadAction<boolean>) => {
      state.isSignedIn = action.payload;
    },
    addIsGettingIds: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.isGettingIds[id] = true;
    },
    deleteIsGettingIds: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      delete state.isGettingIds[id];
    },
  }
});

export const { setIsSignedIn, addIsGettingIds, deleteIsGettingIds } = infoSlice.actions;

export default infoSlice.reducer;