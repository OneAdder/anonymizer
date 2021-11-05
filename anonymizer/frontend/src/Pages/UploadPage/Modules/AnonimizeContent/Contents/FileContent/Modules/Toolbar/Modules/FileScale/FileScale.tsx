import React, {useCallback} from 'react';
import {Button} from '@root/Components/Controls';
import {Space} from 'antd';
import {PlusOutlined, MinusOutlined} from '@ant-design/icons';
import styles from './FileScale.module.less';
import Actions from '@actions';
import {useDispatch} from 'react-redux';
import {useActiveFile} from '../../../../../../../../Hooks/useActiveFile';
import {useActiveSettings} from '../../../../../../../../Hooks/useActiveSettings';



const FileScale = () => {
    const dispatch = useDispatch();
    const file = useActiveFile();
    const settings = useActiveSettings();

    const changeScale = useCallback((delta: number) => () => {
        if (!file) return;
        if (!file.file) return;
        if (delta > 0) {
            dispatch(Actions.Pages.UploadPage.changeScale({
                id: file.file.uid,
                type: 'increase'
            }));
        } else {
            dispatch(Actions.Pages.UploadPage.changeScale({
                id: file.file.uid,
                type: 'decrease'
            }));
        }
    }, [file]);
    
    if (!settings) return null;
    
    return (
        <Space className={styles.wrapper}> 
            <Button 
                disabled={settings.scale > 2.5}
                className={styles.btn}
                type="link"
                onClick={changeScale(1)}
                icon={<PlusOutlined />}
            />
            <Button 
                disabled={settings.scale < 0.3}
                className={styles.btn}
                type="link"
                onClick={changeScale(-1)}
                icon={<MinusOutlined />}
            />
        </Space>
    );
};

export default FileScale;


