function saveMiddleware({ dispatch }: any) {
    return (next: any) => {
        return async (action: any) => {
            //console.log(action);
            switch (action.type) {
                default:
                    // console.log('.............');
                    // console.log(action.type);
                    // console.log(action.payload);
                    // console.log('.............');
                    break;
            }
            return next(action);
        }
    }
}

export { saveMiddleware };