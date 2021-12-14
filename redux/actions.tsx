import { User } from "../types";
import { SET_ROOM_NAME, SET_USER } from "./actionTypes";

//export const setReduxRoomName = (roomName: string) => ({ type: SET_ROOM_NAME, payload: roomName });
export const setUser = (userData: User) => ({ type: SET_USER, payload: userData });