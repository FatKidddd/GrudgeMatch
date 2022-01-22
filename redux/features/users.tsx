import { User } from "../../types";
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Users {
  [userId: string]: User;
};

const initialState: Users = {};

export const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      const user = action.payload;
      state[user.id] = user;
    },
    deleteUser: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      delete state[userId];
    }
  },
});

export const { setUser, deleteUser } = usersSlice.actions;

export default usersSlice.reducer;