import { useAppDispatch, useAppSelector } from './selectorAndDispatch';
import { getFirestore, doc, getDoc, DocumentReference, DocumentData, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActionCreatorWithPayload } from '@reduxjs/toolkit';
import { setGolfCourse } from '../redux/features/golfCourses';
import { addRoom } from '../redux/features/gamesHistory';
import { setUser } from '../redux/features/users';
import { formatData } from '../utils/dateUtils';
import { useIsMounted } from './common';
import { Mutex } from 'async-mutex';
import { User } from '../types';

type UseFireGetProps<T> = {
  docRef: DocumentReference<DocumentData> | void;
  items: { [itemId: string]: T };
  itemId: string | void;
  toDispatch: ActionCreatorWithPayload<T, string>;
  textLog: string;
  altDocRef?: DocumentReference<DocumentData> | void;
};

const useFireGet = <T,>({ docRef, items, itemId, toDispatch, textLog, altDocRef }: UseFireGetProps<T>): [T | undefined, boolean] => {
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
            let res = await getDoc(docRef);
            if (!res.exists() && altDocRef && isMounted.current) {
              console.log('Using altDocRef');
              res = await getDoc(altDocRef);
            }
            const data = {
              id: res.id,
              ...res.data()
            } as unknown as T;
            if (!isMounted.current) return;
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
    if (!isMounted.current) return;
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
  const golfCourses = useAppSelector(state => state.golfCourses.cache);
  return useFireGet({
    docRef: !!golfCourseId ? doc(db, 'golfCourses', golfCourseId) : undefined,
    items: golfCourses,
    itemId: golfCourseId,
    toDispatch: setGolfCourse,
    textLog: 'golfCourse',
    altDocRef: !!golfCourseId ? doc(db, 'customGolfCourses', golfCourseId) : undefined,
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

export const useSnapshotUser = (uid: string | void) => {
  const [user, setUser] = useState<User>();
  const isMounted = useIsMounted();
  const db = getFirestore();

  useEffect(() => {
    if (!uid) return;
    const userRef = doc(db, 'users', uid);
    const unsubscribe = onSnapshot(userRef, res => {
      if (!isMounted.current) return;
      const data = {
        id: res.id,
        ...res.data()
      } as User;
      console.log('user data', data);
      setUser(data);
    });
    return () => {
      console.log("unsubscribed user snapshot");
      unsubscribe();
    }
  }, [uid]);

  return user;
};

export default useFireGet;