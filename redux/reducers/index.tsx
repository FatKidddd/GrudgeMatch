import { combineReducers } from 'redux';
import userInfoReducer from './userInfo';

export const rootReducer = combineReducers({ userInfoReducer });
export type RootState = ReturnType<typeof rootReducer>;