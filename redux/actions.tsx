import { ADD_CATEGORY, DELETE_CATEGORY } from "./actionTypes";

export const addCategory = (category: Category) => ({ type: ADD_CATEGORY, payload: category });
export const deleteCategory = (categoryId: string) => ({ type: DELETE_CATEGORY, payload: categoryId });