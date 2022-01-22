import { useAppDispatch, useAppSelector } from './selectorAndDispatch';
import { getFirestore, doc, getDoc, DocumentReference, DocumentData } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActionCreatorWithPayload } from '@reduxjs/toolkit';
import { setGolfCourse } from '../redux/features/golfCourses';
import { GolfCourse } from '../types';
import { addRoom } from '../redux/features/gamesHistory';
import { setUser } from '../redux/features/users';
import { formatData } from '../utils/dateUtils';

type UseCacheProps<T> = {
  docRef: DocumentReference<DocumentData> | void;
  items: { [itemId: string]: T };
  itemId: string | void;
  toDispatch: ActionCreatorWithPayload<T, string>;
  textLog: string;
};

const useFireGet = <T,>({ docRef, items, itemId, toDispatch, textLog }: UseCacheProps<T>): [T | undefined, boolean] => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (itemId && !items[itemId] && !isLoading && !!docRef) {
      // memoization
      setIsLoading(true);
      getDoc(docRef)
        .then(res => {
          const data = {
            id: res.id,
            ...res.data()
          } as unknown as T;
          formatData(data);
          dispatch(toDispatch(data));
          setIsLoading(false);
          console.log(`Got ${textLog} data with id ${itemId}`);
        })
        .catch(err => {
          console.log(`Failed to get ${textLog} data with id ${itemId}`);
          console.error(err);
        });
    }
  }, [itemId, items, isLoading]);

  return [itemId && !!docRef ? items[itemId] : undefined, isLoading];
};

export const useGolfCourse = (golfCourseId: string | void) => {
  const db = getFirestore();
  const golfCourses = useAppSelector(state => state.golfCourses);
  return useFireGet({
    docRef: !!golfCourseId ? doc(db, 'golfCourses', golfCourseId) : undefined,
    items: golfCourses,
    itemId: golfCourseId,
    toDispatch: setGolfCourse,
    textLog: 'golfCourse'
  })
};

export const useRoom = (roomName: string | void) => {
  const db = getFirestore();
  const rooms = useAppSelector(state => state.gamesHistory.rooms);
  return useFireGet({
    docRef: !!roomName ? doc(db, 'rooms', roomName) : undefined,
    items: rooms,
    itemId: roomName,
    toDispatch: addRoom,
    textLog: 'room'
  });
};

export const useUser = (uid: string | void) => {
  const db = getFirestore();
  const users = useAppSelector(state => state.users);
  return useFireGet({
    docRef: !!uid ? doc(db, 'users', uid) : undefined,
    items: users,
    itemId: uid,
    toDispatch: setUser,
    textLog: 'user'
  });
};

export default useFireGet;