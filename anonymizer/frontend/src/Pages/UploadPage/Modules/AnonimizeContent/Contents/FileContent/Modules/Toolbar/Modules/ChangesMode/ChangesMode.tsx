import React from 'react';
import {Radio} from 'antd';
import {useDispatch} from 'react-redux';
import {useActiveFile} from '../../../../../../../../Hooks/useActiveFile';
import Actions from '@actions';


const ChangesMode = () => {
    const dispatch = useDispatch();
    const activeFile = useActiveFile();
    if (!activeFile) return null;
    return (
        <Radio.Group 
            size="small"
            onChange={(event) => {
                const {target} = event;
                const {value} = target;
                if (!activeFile.file?.uid) return;
                dispatch(Actions.Pages.UploadPage.changeSettings({
                    id: activeFile.file.uid,
                    settings: {
                        mode: value
                    }
                }));
            }}
            value={activeFile.settings.mode}>
            <Radio.Button value="until">
                Было
            </Radio.Button>
            <Radio.Button value="after">
                Стало
            </Radio.Button>
        </Radio.Group>
    );
};


export default ChangesMode;