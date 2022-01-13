import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { Games, GolfGame, User } from "../types";
import { ADD_ROOMS_MAP, ADD_ROOMS_TO_GAME, DELETE_ROOMS, DELETE_USER, SET_ROOM_NAME, SET_USER } from "./actionTypes";
import { SavedGolfGame } from "./reducers/gamesHistory";

//export const setReduxRoomName = (roomName: string) => ({ type: SET_ROOM_NAME, payload: roomName });
export const setUser = (userData: User) => ({ type: SET_USER, payload: userData });
export const deleteUser = (userId: string) => ({ type: DELETE_USER, payload: userId });

// please find an elegant solution
export const addRooms = (gameId: "golf", rooms: SavedGolfGame[], lastVisible: QueryDocumentSnapshot<DocumentData>) => ({ type: ADD_ROOMS_TO_GAME, payload: { gameId, rooms, lastVisible } });
export const addRoomsMap = (rooms: { [roomName: string]: GolfGame }) => ({ type: ADD_ROOMS_MAP, payload: rooms });
export const deleteRooms = (gameId: "golf") => ({ type: DELETE_ROOMS, payload: gameId });