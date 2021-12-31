import { useAppDispatch, useAppSelector } from '../hooks/selectorAndDispatch';
import { setUser } from '../redux/actions';
import { getDoc, doc, getFirestore } from 'firebase/firestore';
import { User } from '../types';

const userSelector = (uid: string) => {
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
  return { id: "", name: "Unknown", roomName: "" } as User;
};

const getInitials = (name: string) => {
  return name.split(" ").map(n => n[0] != " " ? n[0] : "").join("");
  // const rgx = new RegExp(/(\p{L}{1})\p{L}+/, 'gu');
  // let initials = [...name.matchAll(rgx)] || [];
  // return ((initials.shift()?.[1] || '') + (initials.pop()?.[1] || '')).toUpperCase();
};

export { userSelector, getInitials };