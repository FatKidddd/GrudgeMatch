import { useAppDispatch, useAppSelector } from '../hooks/selectorAndDispatch';
import { addRoomsMap } from '../redux/actions';
import { getDoc, doc, getFirestore } from 'firebase/firestore';
import { GolfGame } from '../types';
import React, { useEffect } from 'react';

const useRoom = (roomName: string) => {
  const db = getFirestore();
  const roomRef = doc(db, 'rooms', roomName);
  const rooms = useAppSelector(state => state.gamesHistoryReducer.rooms);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!rooms[roomName]) {
      // memoization
      getDoc(roomRef)
        .then(res => {
          const data = {
            [roomName]: res.data() as GolfGame
          };
          dispatch(addRoomsMap(data));
          console.log("Got room data with room name", roomName);
        })
        .catch(err => {
          console.log("Failed to get room data with room name", roomName);
          console.error(err);
        });
    }
  }, []);


  if (rooms[roomName]) return rooms[roomName];
  return {};
};

export { useRoom };