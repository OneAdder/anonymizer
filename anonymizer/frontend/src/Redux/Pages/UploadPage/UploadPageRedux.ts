import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {iActions, iState} from './types';
import {getFullState, requestStart, requestSuccess, requestError} from '@root/Utils/Redux/requestState/getRequestState';
import {getFileID} from '@utils/Files/getFileId'
import moment from 'moment';


const initialState:iState.Value = {
    files: {},
    activeFile: null
}

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
                    mode: 'after'
                }
                state.files[id].file = {
                    date: moment().toISOString(),
                    name: file.name,
                    size: file.size,
                    status: 'loading',
                    uid: id
                }
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
            state.files[id].data = data;
            const fileLink = state.files[id].file;
            if (!fileLink) return state;
            fileLink.status = 'success';
        },
        _uploadFileError: (state, action: PayloadAction<iActions._uploadFileError>) => {
            const id = getFileID(action.payload);
            if (!(id in state.files)) {
                return state;
            }
            requestError(state.files[id])
            const file = state.files[id].file;
            if (!file) return state;
            file.status = 'error';
        },
        setActiveFile: (state, action: PayloadAction<iActions.setActiveFile>) => {
            state.activeFile = action.payload;
        },
        changeMode: (state, action: PayloadAction<iActions.changeMode>) => {
            const {payload} = action;
            const {id, mode} = payload;
            const file = state.files[id];
            if (!file) return state;
            file.mode = mode;
        }
    }
})

export default Slice;