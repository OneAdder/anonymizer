import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {iActions, iState} from './types';
import {getFullState, requestStart, requestSuccess, requestError} from '@root/Utils/Redux/requestState/getRequestState';
import {getFileID} from '@utils/Files/getFileId';
import moment from 'moment';


const initialState:iState.Value = {
    files: {
        "NTg3NDc5YXBwbGljYXRpb24vcGRmMTYzNTA4ODQyNDYwNg==": {
            errMsg:"",
            error: false,
            fetching: false,
            loaded: true,
            data: {
                filename:"1636053420.725758_cv.pdf",
                input:"1636053412.614628_cv.pdf.pdf",
                not_sure: true,
                pages: null
            },
            file: {
                date:"2021-11-04T19:16:52.275Z",
                name:"cv.pdf",
                size:587479,
                status:"success",
                uid:"NTg3NDc5YXBwbGljYXRpb24vcGRmMTYzNTA4ODQyNDYwNg=="
            },
            settings: {
                mode: 'after',
                scale: 1,
                verification: false
            }
        }
    },
    activeFile: null
};

const Slice = createSlice({
    name:'Pages/UploadPage',
    initialState,
    reducers: {
        uploadFile: (state, action: PayloadAction<iActions.uploadFile>) => {
            const file = action.payload;
            const id = getFileID(file);
            if (!(id in state.files)) {
                state.files[id] = {
                    ...getFullState(),
                    file: null,
                    settings: {
                        mode: 'after',
                        scale: 1,
                        verification: false
                    }
                };
                state.files[id].file = {
                    date: moment().toISOString(),
                    name: file.name,
                    size: file.size,
                    status: 'loading',
                    uid: id
                };
            }
            requestStart(state.files[id]);
        },
        _uploadFileSuccess: (state, action: PayloadAction<iActions._uploadFileSuccess>) => {
            const {payload} = action;
            const {data, file} = payload;
            const id = getFileID(file);
            if (!(id in state.files)) {
                return state;
            }
            requestSuccess(state.files[id]);
            state.files[id].data = {
                ...data,
                pages: null
            };
            const fileLink = state.files[id].file;
            if (!fileLink) return state;
            fileLink.status = 'success';
        },
        _uploadFileError: (state, action: PayloadAction<iActions._uploadFileError>) => {
            const id = getFileID(action.payload);
            if (!(id in state.files)) {
                return state;
            }
            requestError(state.files[id]);
            const file = state.files[id].file;
            if (!file) return state;
            file.status = 'error';
        },
        setActiveFile: (state, action: PayloadAction<iActions.setActiveFile>) => {
            state.activeFile = action.payload;
        },
        changeSettings: (state, action: PayloadAction<iActions.changeSettings>) => {
            const {payload} = action;
            const {id, settings} = payload;
            const file = state.files[id];
            if (!file) return state;
            file.settings = {
                ...file.settings,
                ...settings
            };
        },
        changeScale: (state, action: PayloadAction<iActions.changeScale>) => {
            const {payload} = action;
            const {id, type} = payload;
            const file = state.files[id];
            if (!file) return state;
            const currentScale = file.settings.scale;
            if (type === 'decrease') file.settings.scale = currentScale - 0.1;
            else file.settings.scale = currentScale + 0.1;
        },
        setPagesNumber: (state, action: PayloadAction<iActions.setPagesNumber>) => {
            const {payload} = action;
            const {id, num} = payload;
            const file = state.files[id];
            if (!file) return state;
            if (!file.data) return state;
            file.data.pages = num;
        }
    }
});

export default Slice;