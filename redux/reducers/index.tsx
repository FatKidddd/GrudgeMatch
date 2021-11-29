import { combineReducers } from 'redux';
import categoriesReducer from './categories';
import colorsReducer from './colors';
import infoReducer from './info';

export const rootReducer = combineReducers({ categoriesReducer, colorsReducer, infoReducer });
export type RootState = ReturnType<typeof rootReducer>;