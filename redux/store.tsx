import { createStore, applyMiddleware, compose } from 'redux';
import { rootReducer } from './reducers';
import { saveMiddleware } from './middleware';
import thunk from 'redux-thunk';

const storeEnhancers = compose; // window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const store = createStore(
  rootReducer,
  storeEnhancers(applyMiddleware(saveMiddleware, thunk))
);

export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch