import React from 'react';
import {Upload} from 'antd';
import {useDispatch} from 'react-redux';
import Actions from '@actions';

type iUploadWrapper = {
    children: JSX.Element;
}

const UploadWrapper = (props: iUploadWrapper) => {
    const dispatch = useDispatch();
    return (
        <Upload.Dragger 
            multiple
            showUploadList={false}
            beforeUpload={(file, list) => {
                const index = list.indexOf(file);
                if (index === list.length - 1) {
                    list.forEach((item) => {
                        dispatch(Actions.Pages.UploadPage.uploadFile(item));
                    })
                }
                return false;
            }}>
            {props.children}
        </Upload.Dragger>
    )
}

export default UploadWrapper;