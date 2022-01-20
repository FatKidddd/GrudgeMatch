import { useAppDispatch, useAppSelector } from './selectorAndDispatch';
import { setGolfCourse } from '../redux/slices/golfCourses';
import { getDoc, doc, getFirestore } from 'firebase/firestore';
import { GolfCourse } from '../types';
import { useEffect } from 'react';

const useGolfCourse = (golfCourseId: string | undefined): GolfCourse | undefined => {
  const db = getFirestore();
  const golfCourses = useAppSelector(state => state.golfCourses);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (golfCourseId && !golfCourses[golfCourseId]) {
      // memoization
      const golfCourseRef= doc(db, 'golfCourses', golfCourseId);
      getDoc(golfCourseRef)
        .then(res => {
          const data = {
            id: golfCourseId,
            ...res.data()
          } as GolfCourse;
          dispatch(setGolfCourse(data));
          console.log("Got golfCourse data with id", golfCourseId);
        })
        .catch(err => {
          console.log("Failed to get golfCourse data with id", golfCourseId);
          console.error(err);
        });
    }
  }, []);

  return golfCourseId ? golfCourses[golfCourseId] : undefined;
};

export default useGolfCourse;