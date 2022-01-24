import { GolfCourse } from "../../types";
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface GolfCourses {
  [courseId: string]: GolfCourse;
};

const initialState: GolfCourses = {};

export const golfCoursesSlice = createSlice({
  name: 'golfCourses',
  initialState,
  reducers: {
    setGolfCourse: (state, action: PayloadAction<GolfCourse>) => {
      const golfCourse = action.payload;
      state[golfCourse.id] = golfCourse;
    },
    deleteGolfCourse: (state, action: PayloadAction<string>) => {
      const golfCourseId = action.payload;
      delete state[golfCourseId];
    },
    clearGolfCourses: (state) => {
      state = {};
    },
    // addGolfCourseIds: (state, action: PayloadAction<Array<string>>) => {
    //   const ids = action.payload;
    //   state.ids.push(...ids);
    // },
    // deleteGolfCourseIds: (state) => {
    //   state.ids = [];
    // }
  },
});

export const { setGolfCourse, deleteGolfCourse } = golfCoursesSlice.actions;

export default golfCoursesSlice.reducer;