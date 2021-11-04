import Actions from '@actions';
import {put, takeEvery, call} from 'redux-saga/effects';
import {PayloadAction} from '@reduxjs/toolkit';
import {iActions} from '@redux/Pages/UploadPage/types';
import Api from '@api';


const AnonimizeFile = function* (action: PayloadAction<iActions.uploadFile>) {
    try {
        const {data} = yield call(Api.Anonimize.anonimize, action.payload);
        yield put(Actions.Pages.UploadPage._uploadFileSuccess({
            data,
            file: action.payload
        }));
    } catch (ex) {
        yield put(Actions.Pages.UploadPage._uploadFileError(action.payload));
    }
};


export default function*() {
    yield takeEvery(Actions.Pages.UploadPage.uploadFile, AnonimizeFile);
}