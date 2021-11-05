import React from 'react';
import Status from '@root/Components/Status/Status';
import {Tooltip} from 'antd';
import {useActiveFile} from '../../../../../../../../Hooks/useActiveFile';
import {Button, Notification} from '@root/Components/Controls';
import styles from './Verification.module.less';
import {useDispatch} from 'react-redux';
import Actions from '@actions';

const Verificaition = () => {
    const activeFile = useActiveFile();
    const dispatch = useDispatch();

    if (!activeFile) return null;
    if (!activeFile.file) return null;
    if (!activeFile.data?.not_sure) return null;
    
    return (
        <div className={styles.wrapper}>
            <Tooltip 
                placement="bottom"
                title="Требуется ручная верификация результатов анонимизации">
                <div>
                    <Status color="red">
                        Требуется верификация
                    </Status>
                </div>
            </Tooltip>
            <Button 
                className={styles.control}
                color="blue"
                onClick={() => {
                    if (!activeFile.file) return;
                    dispatch(Actions.Pages.UploadPage.changeSettings({
                        id: activeFile.file.uid,
                        settings: {
                            verification: true
                        }
                    }));
                }}
                type="defaultColor">
                Верифицировать
            </Button>
        </div>
    );
};

export default Verificaition;