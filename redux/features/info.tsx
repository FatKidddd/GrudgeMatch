import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// type IsGettingMap = {
//   ['isGetting' + 'Room' | 'User' | 'GolfCourse']: boolean;
// };

interface Info {
  isSignedIn: boolean | null;
}

const initialState: Info = {
  isSignedIn: null,
};

export const infoSlice = createSlice({
  name: 'info',
  initialState,
  reducers: {
    setIsSignedIn: (state, action: PayloadAction<boolean>) => {
      state.isSignedIn = action.payload;
    },
  }
});

export const { setIsSignedIn } = infoSlice.actions;

export default infoSlice.reducer;