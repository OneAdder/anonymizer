import React from 'react';
import styles from './Toolbar.module.less';
import {useActiveFile} from '../../../../../../Hooks/useActiveFile';
import {Row, Col, Tooltip} from 'antd';
import classnames from 'classnames';
import Download from './Modules/Download/Download';
import ChangesMode from './Modules/ChangesMode/ChangesMode';
import Verificaition from './Modules/Verification/Verification';
import FileScale from './Modules/FileScale/FileScale';

const Toolbar = () => {
    const activeFile = useActiveFile();
    if (!activeFile) return null;
    if (!activeFile.file) return null;

    return (
        <div className={styles.wrapper}>
            <Row 
                gutter={[20, 0]}
                className={styles.row}>
                <Col className={styles.fileCol}>
                    <Row 
                        gutter={[20, 0]}
                        align="middle">
                        <Col>
                            <div className={styles.title}>
                                {activeFile.file.name}
                            </div>
                        </Col>
                        <Col>
                            <FileScale />
                        </Col>
                    </Row>
                </Col>
                <Col className={classnames(styles.colCenter, styles.changesCol)}>
                    <div className={styles.changesLabel}>
                        Изменения: 
                    </div>
                    <ChangesMode />
                </Col>
                <Col className={styles.resultsCol}>
                    <Row className={styles.resultsRow}>
                        <Col>
                            <Verificaition />
                        </Col>
                        <Col>
                            <Download />
                        </Col>
                    </Row>
                </Col>
            </Row>
        </div>
    );
};

export default Toolbar;