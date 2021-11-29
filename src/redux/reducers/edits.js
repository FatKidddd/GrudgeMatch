import { UPDATE_EDIT_BY_TYPE_AND_ID, SET_CURRENT_EDIT_ID } from '../actionTypes';

const defaultState = {
    edits: {
        'questions': {

        },
        'answers': {

        },
        'arts': {

        },
        'comments': {
            
        }
    },
    currentEditId: ''
};

const EDITS = (state=defaultState, action) => {
    switch (action.type) {
        case UPDATE_EDIT_BY_TYPE_AND_ID: {
            const { type, id, data } = action.payload;
            return Object.assign({}, state, {
                edits: {
                    ...state.edits,
                    [type]: {
                        ...state.edits.type,
                        [id]: {
                            data
                        }
                    }
                }
            });
        }
        case SET_CURRENT_EDIT_ID: {
            return Object.assign({}, state, {
                currentEditId: action.payload 
            });
        }
        default: {
            return state;
        }
    }
};

export default EDITS;

/*
Edits = {
    questions: {
        id: {
            subjects: [],
            questionTitle: ...
            questionText: ...
        }
    },
    answers: {
        {
            id: '',
            answerText: ...
        }
    },
    arts: {

    }
}
*/