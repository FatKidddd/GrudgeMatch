import { SET_ROOM_NAME } from "./actionTypes";

export const setReduxRoomName = (roomName: string) => ({ type: SET_ROOM_NAME, payload: roomName });