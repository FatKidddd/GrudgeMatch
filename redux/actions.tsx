import { Games, User } from "../types";
import { SET_GAMES, SET_ROOM_NAME, SET_USER } from "./actionTypes";

//export const setReduxRoomName = (roomName: string) => ({ type: SET_ROOM_NAME, payload: roomName });
export const setUser = (userData: User) => ({ type: SET_USER, payload: userData });

// please find an elegant solution
export const setGames = (gameId: string, rooms: any) => ({ type: SET_GAMES, payload: { gameId, rooms } });