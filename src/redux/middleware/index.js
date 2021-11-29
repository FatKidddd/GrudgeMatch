import { GET_QUESTIONS, SET_USER, OVERWRITE_QUESTIONS, HANDLE_GET_QUESTIONS, HANDLE_OVERWRITE_QUESTIONS, GET_USERS, GET_ANSWERS, OVERWRITE_ANSWERS, HANDLE_GET_ANSWERS, HANDLE_OVERWRITE_ANSWERS } from '../actionTypes';
import db from '../../../Fire';
import firebase from 'firebase';
import { getAnswersByQuestionId } from '../selectors';

let url = null;

const getDefaultImage = async () => {
    if (!url) {
        const imageRef = firebase.storage().ref("profiles/default.png");
        url = await imageRef.getDownloadURL();
    }
    return url;
};

const handleData = async (doc, users, dispatch) => {
    return new Promise(async resolve => {
        let item = doc.data();
        item.id = doc.id;
        const user = users[item.uid];
        if (!user) {
            const userRef = db.collection('users').doc(item.uid);
            await userRef.get()
                .then(async response => {
                    const data = response.data();
                    const img = data.profilePicture ? data.profilePicture : await getDefaultImage();
                    item.profilePicture = img;
                    item.displayName = data.displayName;
                }).catch(async err => {
                    const url = await getDefaultImage();
                    item.displayName = 'Anonymous';
                    item.profilePicture = url;
                });
            const data = {
                profilePicture: item.profilePicture,
                displayName: item.displayName
            }
            let uid = item.uid;
            dispatch({ type: GET_USERS, payload: { uid, data } });
        } else {
            item.profilePicture = user.profilePicture ? user.profilePicture : null;
            item.displayName = user.displayName;
        }
        resolve(item);
    });
};


const callFirebase = async (dataRef, start, users, dispatch) => {
    let queries;
    if (start == null) { 
        queries = dataRef.orderBy('dateCreated', 'desc').limit(3) 
    } else { 
        queries = dataRef.orderBy('dateCreated', 'desc').startAfter(start).limit(3); 
    }
    let data = [];
    let lastVisible;
    await queries.get()
        .then(async (res) => {
            lastVisible = res.docs[res.docs.length - 1];
            let actions = res.docs.map(doc => handleData(doc, users, dispatch));
            let results = Promise.all(actions);
            await results.then(res_data => {
                data = res_data;
            });
        });
    return { data, lastVisible };
};


function saveMiddleware({ dispatch, getState }) {
    return (next) => {
        return (action) => {
            switch (action.type) {
                case GET_QUESTIONS: 
                    callFirebase(
                        action.payload.dataRef,
                        getState().QUESTIONS.lastVisible, 
                        getState().USER.users, 
                        dispatch
                    ).then(({ data, lastVisible }) => {
                        if (lastVisible != null) {
                            let questions = data;
                            return next({ type: HANDLE_GET_QUESTIONS, payload: { questions, lastVisible } });
                        }
                    });
                    break;
                
                case OVERWRITE_QUESTIONS: 
                    callFirebase(
                        action.payload.dataRef, 
                        null, 
                        getState().USER.users, 
                        dispatch
                    ).then(({ data, lastVisible }) => {
                        let questions = data;
                        return next ({ type: HANDLE_OVERWRITE_QUESTIONS, payload: { questions, lastVisible } });
                    });
                    break;



                case GET_ANSWERS:
                    callFirebase(
                        action.payload.dataRef, 
                        getAnswersByQuestionId(getState(), action.payload.questionId).lastVisible, 
                        getState().USER.users, 
                        dispatch
                    ).then(({ data, lastVisible }) => {
                        if (lastVisible != null && data.length > 0) {
                            let answers = data;
                            let questionId = action.payload.questionId;
                            return next({ type: HANDLE_GET_ANSWERS, payload: { questionId, lastVisible, answers } });
                        }
                    });
                    break;

                case OVERWRITE_ANSWERS:
                    callFirebase(
                        action.payload.dataRef, 
                        null, 
                        getState().USER.users, 
                        dispatch
                    ).then(({ data, lastVisible }) => {
                        let answers = data;
                        let questionId = action.payload.questionId;
                        return next({ type: HANDLE_OVERWRITE_ANSWERS, payload: { questionId, lastVisible, answers } });
                    });
                    break;

                case SET_USER:
                    break;

                case GET_USERS:
                    //console.log(getState().USER.users);
                    break;
                default:
                    break;
            }
            return next(action);
        }
    }
}

export { saveMiddleware };