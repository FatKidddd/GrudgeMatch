import { useAppDispatch, useAppSelector } from './selectorAndDispatch';
import { getFirestore, doc, getDoc, DocumentReference, DocumentData } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActionCreatorWithPayload } from '@reduxjs/toolkit';
import { setGolfCourse } from '../redux/features/golfCourses';
import { addRoom } from '../redux/features/gamesHistory';
import { setUser } from '../redux/features/users';
import { formatData } from '../utils/dateUtils';
import { addIsGettingIds, deleteIsGettingIds } from '../redux/features/info';
import { useEffectIf } from './common';

type UseFireGetProps<T> = {
  docRef: DocumentReference<DocumentData> | void;
  items: { [itemId: string]: T };
  itemId: string | void;
  toDispatch: ActionCreatorWithPayload<T, string>;
  textLog: string;
  dontCall?: boolean;
};

const useFireGet = <T,>({ docRef, items, itemId, toDispatch, textLog, dontCall }: UseFireGetProps<T>): [T | undefined, boolean] => {
  // const isGettingIds = useAppSelector(state => state.info.isGettingIds);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (itemId && !items[itemId] && !isLoading && !!docRef && !dontCall) {
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
  }, [textLog, itemId, isLoading, docRef]);

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
    textLog: 'golfCourse',
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
    textLog: 'room',
  });
};

export const useUser = (uid: string | void, dontCall?: boolean) => {
  const db = getFirestore();
  const users = useAppSelector(state => state.users);
  return useFireGet({
    docRef: !!uid ? doc(db, 'users', uid) : undefined,
    items: users,
    itemId: uid,
    toDispatch: setUser,
    textLog: 'user',
    dontCall
  });
};

// export const useUserIds = (userIds: string[] | void) => {
  
// };

export default useFireGet;