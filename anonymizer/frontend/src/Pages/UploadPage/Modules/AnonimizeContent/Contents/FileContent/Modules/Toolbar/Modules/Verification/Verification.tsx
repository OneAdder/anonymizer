import React, {useMemo} from 'react';
import Status from '@root/Components/Status/Status';
import {Tooltip} from 'antd';
import {useActiveFile} from '../../../../../../../../Hooks/useActiveFile';
import {Button} from '@root/Components/Controls';
import Box from '@root/Components/Box/Box';
import styles from './Verification.module.less';
import {useDispatch} from 'react-redux';
import Actions from '@actions';
import {useActiveSettings} from '../../../../../../../../Hooks/useActiveSettings';
import {turnOnNotification, turnOffNotification} from './Modules/Notification/Notification';

const Verificaition = () => {
    const activeFile = useActiveFile();
    const dispatch = useDispatch();
    const settings = useActiveSettings();
    const disabled = useMemo(() => {
        if (activeFile?.settings.mode === 'until') return true;
        if (!activeFile?.data) return true;
        if (activeFile.data.pages === null) return true;
        return false;
    }, [activeFile]);

    if (!settings) return null;
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
            <Box visible={!settings.verification}>
                <Button 
                    className={styles.control}
                    disabled={disabled}
                    color="blue"
                    onClick={() => {
                        if (!activeFile.file) return;
                        turnOnNotification.open();
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
            </Box>
            <Box visible={settings.verification}>
                <Button 
                    className={styles.control}
                    color="blue"
                    disabled={disabled}
                    onClick={() => {
                        if (!activeFile.file) return;
                        turnOffNotification.open();
                        dispatch(Actions.Pages.UploadPage.endVerification({
                            id: activeFile.file.uid
                        }));
                        dispatch(Actions.Pages.UploadPage.changeSettings({
                            id: activeFile.file.uid,
                            settings: {
                                verification: false
                            }
                        }));
                    }}
                    type="primary">
                    Завершить
                </Button>
            </Box>
        </div>
    );
};

export default Verificaition;