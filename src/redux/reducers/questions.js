import { HANDLE_GET_QUESTIONS, RESET_QUESTIONS, UPDATE_QUESTION, REMOVE_QUESTION, HANDLE_GET_ANSWERS, RESET_ANSWERS, RESET_ANSWERSLIST, HANDLE_OVERWRITE_QUESTIONS, HANDLE_OVERWRITE_ANSWERS, REMOVE_ANSWER, GET_LIKES, RESET_LIKES, HANDLE_LIKES, SET_CURR_QUESTIONID } from '../actionTypes';
// I realised that posting questions is dumb, it's much easier to just refresh the whole page
/*
Current planned structure:
questions: [
    question1: {
        questionFields: ___,
        answersLastVisible: null,
        answers: [
            answer1: {

            },
            answer2: {

            }
        ]
    },
    question2: {

    }
]
*/

/*
I shall just make it into a nested structure instead of this below ... 1 hr later, I dont know which one to do
answersList: [
    answers: [
        answer1: {

        },
        answer2: {

        }
    ]
]
changed to 

answersList: [
    {
        questionId: mlas;d,
        lastVisible: null,
        answers: []
    },
    {
        questionId: lasd;kf,
        lastVisible: null,
        answers: []
    }
]
*/

// THING I NEED TO FIX IS THAT THE LIKES ARE NOT REMOVED FROM THE STORE EVEN IF THE QUESTION IS DELETE OR REFRESHED.
// BUT I THINK IT SHLD BE FINE IF IM JUST LAZY FOR NOW SINCE IT DOESNT HURT? IDK THERE IS LIKELY SOME MEMORY AND STORAGE ISSUES...

const defaultState = {
    lastVisible: null,
    questions: [],
    answersList: [],
    likesStore: {},
    currQuestionId: null
};

const QUESTIONS = (state=defaultState, action) => {
    switch (action.type) {
        case HANDLE_GET_QUESTIONS: {
            const { questions, lastVisible } = action.payload;
            const toAddToAnswersList = questions.map(item => {
                return {
                    questionId: item.id,
                    lastVisible: null,
                    answers: []
                };
            });
            //need to fix if other user deletes question
            return Object.assign({}, state, {
                questions: [...state.questions, ...questions],
                lastVisible: lastVisible,
                answersList: [...state.answersList, ...toAddToAnswersList]
            });
        }

        case HANDLE_OVERWRITE_QUESTIONS: {
            const { questions, lastVisible } = action.payload;
            const toAddToAnswersList = questions.map(item => {
                return {
                    questionId: item.id,
                    lastVisible: null,
                    answers: []
                };
            });
            // need to fix if other user deletes question
            return Object.assign({}, state, {
                questions: questions,
                lastVisible: lastVisible,
                answersList: toAddToAnswersList
            });
        }
        case RESET_QUESTIONS: {
            return Object.assign({}, state, {
                questions: [],
                lastVisible: null,
                answersList: []
            });
        }
        case REMOVE_QUESTION: {
            const { questionId } = action.payload;
            const withoutQuestion = state.questions.filter(item => item.questionId != questionId );
            return Object.assign({}, state, {
                questions: withoutQuestion
            });
        }
        // update question and answer not done yet


        case HANDLE_GET_ANSWERS: {
            const { questionId, lastVisible, answers } = action.payload;
            return Object.assign({}, state, {
                answersList: state.answersList.map(item => item.questionId === questionId 
                    ? { 
                        ...item, 
                        lastVisible: lastVisible, 
                        answers: [...item.answers, ...answers]
                    } 
                    : item
                )
            });
        }
        case HANDLE_OVERWRITE_ANSWERS: {
            const { questionId, lastVisible, answers } = action.payload;
            return Object.assign({}, state, {
                answersList: state.answersList.map(item => item.questionId === questionId
                    ? {
                        ...item,
                        lastVisible: lastVisible,
                        answers: answers
                    }
                    : item
                )
            });
        }
        case RESET_ANSWERS: {
            const { questionId } = action.payload;
            // wrong.
            return Object.assign({}, state, {
                answersList: state.answersList.map(item => item.questionId === questionId
                    ? {
                        ...item,
                        lastVisible: null,
                        answers: []
                    }
                    : item
                )
            });
        }
        case RESET_ANSWERSLIST: {
            return Object.assign({}, state, {
                answersList: []
            });
        }
        // potential error: if another user deletes the answer which is stored as lastVisible for currentUser, the currentUser may end up not being able to get stuff.
        case REMOVE_ANSWER: {
            const { questionId, answerId } = action.payload;
            return Object.assign({}, state, {
                answersList: state.answersList.map(item => item.questionId === questionId
                    ? {
                        ...item,
                        answers: item.answers.filter(obj => obj.answerId != answerId)
                    }
                    : item
                )
            });
        }

        case SET_CURR_QUESTIONID: {
            const { questionId } = action.payload;
            return Object.assign({}, state, {
                currQuestionId: questionId
            });
        }


        case GET_LIKES: {
            const { id, liked, likes } = action.payload;
            return Object.assign({}, state, {
                likesStore: {
                    ...state.likesStore,
                    [id]: {
                        liked: liked,
                        likes: likes
                    }
                } 
            });
        }
        case RESET_LIKES: {
            return Object.assign({}, state, {
                likesStore: {}
            });
        }
        default: {
            return state;
        }
    }
};

export default QUESTIONS;

// case UPDATE_QUESTION: {
//     const { editableData } = action.payload;
//     const accumulative = {
//         ...state.questions,
//         ...editableData
//     };
//     return Object.assign({}, state, {
//         questions: accumulative
//     });
// }
// case GET_ANSWERS: {
//     const { answers, questionId } = action.payload;
//     const one = questions.find(item => item.questionId === questionId);
//     const withoutOne = questions.filter(item => item != one);
//     qWithAnswers = Object.assign({}, one, { 
//         ...one,
//         answers: answers
//     });
//     return Object.assign({}, state, {
//         questions: [...withoutOne]
//     })
// }