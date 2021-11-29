import { GET_QUESTIONS, RESET_QUESTIONS, REMOVE_QUESTION, UPDATE_QUESTION, GET_ANSWERS, RESET_ANSWERS, OVERWRITE_QUESTIONS, 
        OVERWRITE_ANSWERS, REMOVE_ANSWER, 
        GET_LIKES, RESET_LIKES, HANDLE_LIKES, 
        SET_USER, GET_USERS, SET_CURR_QUESTIONID, 
        UPDATE_EDIT_BY_TYPE_AND_ID, 
        SET_CURRENT_EDIT_ID} from './actionTypes';
import db from '../../Fire';
import firebase from 'firebase';
// I've come to the conclusion that being lazy is the best solution, like actually.
// export const postQuestion = (subject, questionText) => async dispatch => {
//     if (subject.length > 0 && questionText.length > 0) {
//         const created = Date.now();
//         const user = firebase.auth().currentUser();
//         const data = {
//             subject: subject,
//             questionText: questionText,
//             dateCreated: created,
//             userData: {
//                 firstName: user
//             }
//         };
//         //post data
//         fire.db.collection('questions').doc().set({
//             subject: subject,
//             questionText: questionText,
//             dateCreated: fire.db.Timestamp.fromDate(created),
//             userRef: fire.db.doc('users/' + firebase.auth().currentUser.uid)
//         }).catch(error => console.log(error.message));
//         // just add data to questions
//         //dispatch({ type: POST_QUESTION, payload: { data } });
//     }
// };
//export const postQuestion = data => ({ type: POST_QUESTION, payload: { data } });

export const getQuestions = (dataRef) => ({ type: GET_QUESTIONS, payload: { dataRef } });
export const overwriteQuestions = (dataRef) => ({ type: OVERWRITE_QUESTIONS, payload: { dataRef } });


export const updateQuestion = editableData => async dispatch => {
    const { questionId, subject, questionText } = editableData;
    if (subject.length > 0 && questionText.length > 0) {
        db.collection('questions').doc(questionId).update({
            subject: subject,
            questionText: questionText
        }).catch(error => console.log(error.message));
        dispatch({ type: UPDATE_QUESTION, payload: { questionId, editableData } })
    }
};
export const resetQuestions = (questions, lastVisible) => ({ type: RESET_QUESTIONS, payload: { questions, lastVisible } });
export const removeQuestion = questionId => ({ type: REMOVE_QUESTION, payload: { questionId } });


export const getAnswers = (dataRef, questionId) => ({ type: GET_ANSWERS, payload: { dataRef, questionId } });
export const overwriteAnswers = (dataRef, questionId) => ({ type: OVERWRITE_ANSWERS, payload: { dataRef, questionId } });
export const resetAnswers = questionId => ({ type: RESET_ANSWERS, payload: { questionId } });
export const removeAnswer = (questionId, answerId) => ({ type: REMOVE_ANSWER, payload: { questionId, answerId } });


export const getLikes = (id, liked, likes) => ({ type: GET_LIKES, payload: { id, liked, likes } });
export const handleLikes = (id, liked, likes) => ({ type: HANDLE_LIKES, payload: { id, liked, likes } });
export const resetLikes = () => ({ type: RESET_LIKES, payload: {} });

export const setCurrQuestionId = questionId => ({ type: SET_CURR_QUESTIONID, payload: { questionId }});

export const getUsers = (uid, data) => ({ type: GET_USERS, payload: { uid, data }});

// changed setUser to async function
export const setUser = () => async dispatch => {
    const userRef = db.collection('users').doc(firebase.auth().currentUser.uid);
    await userRef.get()
        .then(res => {
            const data = res.data();
            dispatch({ type: SET_USER, payload: { data } });
        })
        .catch(error => console.log(error.message));
};




// edit Question Details
export const setCurrentEditId = id => ({ type: SET_CURRENT_EDIT_ID, payload: id });
export const updateEditByTypeId = (type, id, data) => ({ type: UPDATE_EDIT_BY_TYPE_AND_ID, payload: { type, id, data } });