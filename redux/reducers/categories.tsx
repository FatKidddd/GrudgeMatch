import { ADD_CATEGORY, DELETE_CATEGORY } from '../actionTypes';

const defaultState: CategoriesState = {
    categories: {
        byId: {},
        allIds: []
    }, 
};

const categoriesReducer = (state = defaultState, action: any) => {
    switch (action.type) {
        case ADD_CATEGORY: {
            const { id } = action.payload;
            return {
                ...state,
                categories: {
                    byId: {
                        ...state.categories.byId,
                        [id]: action.payload
                    },
                    allIds: state.categories.allIds.concat(id)
                }
            };
        }
        case DELETE_CATEGORY: {
            const id = action.payload;
            const { [id]: content, ...categoriesByIdWithout } = state.categories.byId;
            return {
                ...state,
                categories: {
                    byId: categoriesByIdWithout,
                    allIds: state.categories.allIds.filter(categoryId => categoryId !== id)
                }
            };
        }
        default: {
            return state;
        }
    }
};

export default categoriesReducer;