import { useAppDispatch, useAppSelector } from './selectorAndDispatch';
import { getFirestore, doc, getDoc, DocumentReference, DocumentData } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActionCreatorWithPayload } from '@reduxjs/toolkit';
import { setGolfCourse } from '../redux/features/golfCourses';
import { addRoom } from '../redux/features/gamesHistory';
import { setUser } from '../redux/features/users';
import { formatData } from '../utils/dateUtils';
import { useIsMounted } from './common';
import { Mutex } from 'async-mutex';

type UseFireGetProps<T> = {
  docRef: DocumentReference<DocumentData> | void;
  items: { [itemId: string]: T };
  itemId: string | void;
  toDispatch: ActionCreatorWithPayload<T, string>;
  textLog: string;
};

const useFireGet = <T,>({ docRef, items, itemId, toDispatch, textLog }: UseFireGetProps<T>): [T | undefined, boolean] => {
  const [isLoading, setIsLoading] = useState(false);
  const isMounted = useIsMounted();
  const dispatch = useAppDispatch();

  const mutex = itemId ? getMutex(itemId) : null;

  const getData = async () => {
    if (mutex?.isLocked()) {
      setIsLoading(true);
      await mutex?.waitForUnlock();
      if (!isMounted.current) return;
      setIsLoading(false);
    } else {
      await mutex?.runExclusive(async () => {
        if (itemId && !items[itemId] && !isLoading && !!docRef) {
          setIsLoading(true);
          try {
            const res = await getDoc(docRef);
            const data = {
              id: res.id,
              ...res.data()
            } as unknown as T;
            formatData(data);
            dispatch(toDispatch(data));
            console.log(`Got ${textLog} data with id ${itemId}`);
          } catch (err) {
            console.log(`Failed to get ${textLog} data with id ${itemId}`);
            console.error(err);
          } finally {
            if (!isMounted.current) return;
            setIsLoading(false);
          }
        }
      });
    }
  };

  useEffect(() => {
    getData();
    return () => mutex?.cancel();
  }, [itemId, items]);

  return [itemId && !!docRef ? items[itemId] : undefined, isLoading];
};

interface Cache {
  [id: string]: Mutex;
};

const cache: Cache = {};

const getMutex = (id: string) => {
  if (!cache[id])
    cache[id] = new Mutex();
  return cache[id];
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

export const useUser = (uid: string | void) => {
  const db = getFirestore();
  const users = useAppSelector(state => state.users);
  return useFireGet({
    docRef: !!uid ? doc(db, 'users', uid) : undefined,
    items: users,
    itemId: uid,
    toDispatch: setUser,
    textLog: 'user',
  });
};


// export const useUserIds = (userIds: string[] | void) => {
  
// };

export default useFireGet;