import { useAppDispatch, useAppSelector } from './selectorAndDispatch';
import { addRoom } from '../redux/slices/gamesHistory';
import { getDoc, doc, getFirestore, DocumentReference, DocumentData } from 'firebase/firestore';
import { GolfGame } from '../types';
import { useEffect } from 'react';
import { ActionCreatorWithPayload } from '@reduxjs/toolkit';

const useRoom = (roomName: string): GolfGame | undefined => {
  const db = getFirestore();
  const roomRef = doc(db, 'rooms', roomName);
  const rooms = useAppSelector(state => state.gamesHistory.rooms);
  return useCache({
    docRef: roomRef,
    items: rooms,
    itemId: roomName,
    toDispatch: addRoom
  });
  // const dispatch = useAppDispatch();

  // useEffect(() => {
  //   if (!rooms[roomName]) {
  //     // memoization
  //     getDoc(roomRef)
  //       .then(res => {
  //         const data = {
  //           id: res.id,
  //           ...res.data()
  //         } as GolfGame
  //         dispatch(addRoom(data));
  //         console.log("Got room data with room name", roomName);
  //       })
  //       .catch(err => {
  //         console.log("Failed to get room data with room name", roomName);
  //         console.error(err);
  //       });
  //   }
  // }, []);

  // return rooms[roomName];
};

type UseCacheProps<T> = {
  docRef: DocumentReference<DocumentData>;
  items: { [itemId: string]: T };
  itemId: string | undefined;
  toDispatch: ActionCreatorWithPayload<T, string>;
};

const useCache = <T,>({ docRef, items, itemId, toDispatch }: UseCacheProps<T>): T | undefined => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (itemId && !items[itemId]) {
      // memoization
      getDoc(docRef)
        .then(res => {
          const data = {
            id: res.id,
            ...res.data()
          } as unknown as T;
          dispatch(toDispatch(data));
          console.log("Got data", itemId);
        })
        .catch(err => {
          console.log("Failed to get data", itemId);
          console.error(err);
        });
    }
  }, []);

  return itemId ? items[itemId] : undefined;
};

export default useRoom;