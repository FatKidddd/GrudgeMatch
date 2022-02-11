import { GolfCourse } from "../../types";
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { padArr } from "../../utils";

interface GolfCourses {
  cache: {
    [courseId: string]: GolfCourse;
  };
  customGolfCourse: Omit<GolfCourse, 'id'>;
};

const initialState: GolfCourses = {
  cache: {},
  customGolfCourse: {
    name: '',
    clubName: '',
    location: '',
    parArr: new Array(18).fill(null),
    handicapIndexArr: new Array(18).fill(null)
  }
};

export const golfCoursesSlice = createSlice({
  name: 'golfCourses',
  initialState,
  reducers: {
    addGolfCourses: (state, action: PayloadAction<GolfCourse[]>) => {
      const golfCourses = action.payload;
      for (const golfCourse of golfCourses) {
        state.cache[golfCourse.id] = golfCourse;
      }
    },
    setGolfCourse: (state, action: PayloadAction<GolfCourse>) => {
      const golfCourse = action.payload;
      state.cache[golfCourse.id] = golfCourse;
    },
    deleteGolfCourse: (state, action: PayloadAction<string>) => {
      const golfCourseId = action.payload;
      delete state.cache[golfCourseId];
    },
    clearGolfCourses: (state) => {
      state.cache = {};
    },
    // addGolfCourseIds: (state, action: PayloadAction<Array<string>>) => {
    //   const ids = action.payload;
    //   state.ids.push(...ids);
    // },
    // deleteGolfCourseIds: (state) => {
    //   state.ids = [];
    // }

    setCustomGolfCourseArrLen: (state, action: PayloadAction<number>) => {
      const len = action.payload;
      let { parArr, handicapIndexArr } = state.customGolfCourse;
      parArr = len === 9 ? parArr.slice(0, 9) : padArr(parArr, 18);
      handicapIndexArr = len === 9 ? handicapIndexArr.slice(0, 9) : padArr(handicapIndexArr, 18);
    },
    editCustomGolfCourseTile: (state, action: PayloadAction<{ arrName: 'parArr' | 'handicapIndexArr', idx: number, val: number }>) => {
      const { arrName, idx, val } = action.payload;
      state.customGolfCourse[arrName][idx] = val;
    },
  },
});

export const { addGolfCourses, setGolfCourse, deleteGolfCourse, setCustomGolfCourseArrLen, editCustomGolfCourseTile } = golfCoursesSlice.actions;

export default golfCoursesSlice.reducer;