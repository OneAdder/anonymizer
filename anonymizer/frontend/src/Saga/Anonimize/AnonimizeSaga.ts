import createRootSaga from '@root/Utils/Saga/rootSagaCreator';
import AnonimizeFiles from './AnonimizeFiles';

export default function* rootSaga() {
    yield createRootSaga([
        AnonimizeFiles
    ], 'ANONIMIZE');
}