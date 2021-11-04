import React from 'react';
import styles from './Toolbar.module.less';
import {useActiveFile} from '../../../../../../Hooks/useActiveFile';
import {Row, Col, Tooltip} from 'antd';
import classnames from 'classnames';
import Download from './Modules/Download/Download';
import Box from '@root/Components/Box/Box';
import Status from '@root/Components/Status/Status';
import ChangesMode from './Modules/ChangesMode/ChangesMode';

const Toolbar = () => {
    const activeFile = useActiveFile();
    if (!activeFile) return null;
    if (!activeFile.file) return null;

    return (
        <div className={styles.wrapper}>
            <Row className={styles.row}>
                <Col span={8}>
                    <div className={styles.title}>
                        {activeFile.file.name}
                    </div>
                </Col>
                <Col 
                    className={classnames(styles.colCenter, styles.changesCol)}
                    span={8}>
                    <div className={styles.changesLabel}>
                        Изменения: 
                    </div>
                    <ChangesMode />
                </Col>
                <Col span={4}>
                    <Box visible={Boolean(activeFile.data?.not_sure)}>
                        <>
                            <Tooltip 
                                placement="bottom"
                                title="Требуется ручная верификация результатов анонимизации">
                                <div>
                                    <Status color="red">
                                        Требуется верификация
                                    </Status>
                                </div>
                            </Tooltip>
                        </>
                    </Box>
                </Col>

                <Col 
                    className={styles.colEnd}
                    span={4}>
                    <Download />
                </Col>
            </Row>
            
            
        </div>
    );
};

export default Toolbar;