import { Games, User } from "../types";
import { DELETE_USER, SET_GAMES, SET_ROOM_NAME, SET_USER } from "./actionTypes";

//export const setReduxRoomName = (roomName: string) => ({ type: SET_ROOM_NAME, payload: roomName });
export const setUser = (userData: User) => ({ type: SET_USER, payload: userData });
export const deleteUser = (userId: string) => ({ type: DELETE_USER, payload: userId });

// please find an elegant solution
export const setGames = (gameId: string, rooms: any) => ({ type: SET_GAMES, payload: { gameId, rooms } });