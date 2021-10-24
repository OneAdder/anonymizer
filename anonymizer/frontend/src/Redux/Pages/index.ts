import {combineReducers} from 'redux';
import UploadPage from './UploadPage/UploadPageRedux';

export default combineReducers({
    UploadPage: UploadPage.reducer
});

export const actions = {
    UploadPage: UploadPage.actions
};

