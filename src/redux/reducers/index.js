import { combineReducers } from 'redux';
import USER from './user';
import QUESTIONS from './questions';
import EDITS from './edits';

export default combineReducers({ USER, QUESTIONS, EDITS });

