import { combineReducers } from 'redux';
import usersReducer from './users';
import gamesHistoryReducer from './gamesHistory';

export const rootReducer = combineReducers({ usersReducer, gamesHistoryReducer });
export type RootState = ReturnType<typeof rootReducer>;