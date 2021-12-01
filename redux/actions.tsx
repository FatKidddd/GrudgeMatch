import { SET_ROOM_NAME } from "./actionTypes";

export const setRoomName = (roomName: string) => ({ type: SET_ROOM_NAME, payload: roomName });