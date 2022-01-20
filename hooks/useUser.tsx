import { useAppDispatch, useAppSelector } from '../hooks/selectorAndDispatch';
import { setUser } from '../redux/slices/users'; 
import { getDoc, doc, getFirestore } from 'firebase/firestore';
import { User } from '../types';
import { useEffect } from 'react';

const useUser = (uid: string): User | undefined => {
  const db = getFirestore();
  const userRef = doc(db, 'users', uid);
  const users = useAppSelector(state => state.users);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!users[uid]) {
      // memoization
      getDoc(userRef)
        .then(res => {
          const data = {
            id: uid,
            ...res.data()
          } as User;
          dispatch(setUser(data));
          console.log("Got info of user with id", uid)
        })
        .catch(err => {
          console.log("Failed to get user profile with id ", uid);
          console.error(err);
        });
    }
  }, []);

  return users[uid];
};

export default useUser;