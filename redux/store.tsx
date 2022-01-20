import { configureStore } from '@reduxjs/toolkit'
import gamesHistoryReducer from './slices/gamesHistory';
import usersReducer from './slices/users';
import golfCoursesReducer from './slices/golfCourses';

export const store = configureStore({
  reducer: {
    gamesHistory: gamesHistoryReducer,
    users: usersReducer,
    golfCourses: golfCoursesReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch