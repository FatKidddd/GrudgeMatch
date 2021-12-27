import { useAppDispatch, useAppSelector } from '../hooks/selectorAndDispatch';
import { setUser } from '../redux/actions';
import { getDoc, doc, getFirestore } from 'firebase/firestore';
import { User } from '../types';

export default function userSelector(uid: string) {
  const db = getFirestore();
  const users = useAppSelector(state => state.usersReducer);
  const dispatch = useAppDispatch();
  const userRef = doc(db, 'users', uid);

  const getUser = async (uid: string) => {
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
  };

  if (users[uid]) return users[uid];
  getUser(uid);
  return { id: "", name: "Unknown", roomName: "" };
};