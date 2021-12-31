import { User } from "../../types";
import { DELETE_USER, SET_ROOM_NAME, SET_USER } from "../actionTypes";

// may need to nest by one level if i need to keep track of other users data?
interface Users {
  [userId: string]: User;
};

const defaultState: Users = {};

const userInfoReducer = (state = defaultState, action: any) => {
  switch (action.type) {
    // case SET_ROOM_NAME: {
    //   return {
    //     ...state,
    //     //roomName: action.payload
    //   };
    // }
    case SET_USER: {
      const user = action.payload;
      return {
        ...state,
        [user.id]: user
      };
    }
    case DELETE_USER: {
      const userId = action.payload;
      const { [userId]: garbage, ...withoutUser } = state;
      return withoutUser;
    }
    default: {
      return state;
    }
  }
};

export default userInfoReducer;