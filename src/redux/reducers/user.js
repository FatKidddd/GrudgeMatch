import { SET_USER, GET_USERS } from '../actionTypes';

const defaultState = {
    data: null,
    users: {}
};

const USER = (state = defaultState, action) => {
    switch (action.type) {
        case SET_USER: {
            return Object.assign({}, state, {
                data: action.payload.data
            });
        }
        case GET_USERS: {
            const { uid, data } = action.payload;
            return Object.assign({}, state, {
                users: {
                    ...state.users,
                    [uid]: data
                }
            })
        }
        default: {
            return state;
        }
    }
};

export default USER;