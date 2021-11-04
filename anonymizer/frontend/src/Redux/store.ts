import {configureStore} from '@reduxjs/toolkit';
import rootReducer from './rootReducer';
import createSagas from 'redux-saga';
import rootSaga from '@root/Saga/rootSaga';


const sagaMiddleware = createSagas();

const store = configureStore({
    reducer: rootReducer,
    middleware: (defaultMiddleware) => {
        return defaultMiddleware({
            thunk: false,
            serializableCheck: false
        })
            .concat(sagaMiddleware);
    } 
});
sagaMiddleware.run(rootSaga);



export type AppState = ReturnType<typeof rootReducer>;
export default store;