import { SET_ROOM_NAME } from '../actionTypes';

interface UserInfo {
  roomName: string;
};

const defaultState: UserInfo = {
  roomName: ""
};

const userInfoReducer = (state = defaultState, action: any) => {
    switch (action.type) {
        case SET_ROOM_NAME: {
            return {
                ...state,
                roomName: action.payload
            };
        }
        default: {
            return state;
        }
    }
};

export default userInfoReducer;