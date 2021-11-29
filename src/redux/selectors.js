// export const getQuestions = store => store.QUESTIONS;

// export const getQuestionsById = (store, id) => ({ ...store.QuestionsMap[id], id });

// /**
//  * example of a slightly more complex selector
//  * select from store combining information from multiple reducers
//  */
// export const getQuestions = store =>
//     getQuestionsList(store).map(id => getQuestionsById(store, id));

export const getAnswersByQuestionId = (state, id) => state.QUESTIONS.answersList.find(item => item.questionId === id);

export const getLikesById = (state, id) => state.QUESTIONS.likesStore[id] ? state.QUESTIONS.likesStore[id] : null;

export const getQuestionById = (state, id) => state.QUESTIONS.questions.find(item => item.id === id);

export const getEditByTypeId = (state, type, id) => state.EDITS.edits[type] ? state.EDITS.edits[type][id] : null;