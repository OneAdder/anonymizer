import rootSagaCreator from '@root/Utils/Saga/rootSagaCreator'
import AnonimizeSagas from './Anonimize/AnonimizeSaga';

export default function* rootSaga() {
    const sagas:any[] = [
        AnonimizeSagas
    ];
    yield rootSagaCreator(sagas, 'ROOT');
}