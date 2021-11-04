import React from 'react';
import {iFiles} from '@types';
import {Row, Col, Tooltip} from 'antd';
import moment from 'moment';
import {getFileSize} from '@root/Utils/Files/getFileSize';
import PaddingContainer from '../../../../Components/PaddingContainer/PaddingContainer';
import styles from './FileItem.module.less';
import FileStatus from '../FileStatus/FileStatus';
import classnames from 'classnames';
import {useDispatch} from 'react-redux';
import Actions from '@actions';

type iFileItem = {
    item: iFiles.Item;
    active: boolean;
}

const FileItem = (props: iFileItem) => {
    const {item} = props;
    const dispatch = useDispatch();
    const classes = {
        wrapper: classnames(
            styles.wrapper, 
            {
                [styles.wrapperActive]: props.active,
                [styles.wrapperDisabled]: props.item.status !== 'success'
            }
        )
    };

    return (
        <div 
            onClick={() => {
                if (item.status !== 'success') return;
                dispatch(Actions.Pages.UploadPage.setActiveFile(item.uid));
            }}
            className={classes.wrapper}>
            <PaddingContainer>
                <div className={styles.content}>
                    <Tooltip title={item.name}>
                        <div className={styles.title}>
                            {item.name}
                        </div>
                    </Tooltip>
                    <Row className={styles.row}>
                        <Col 
                            className={styles.label}
                            span={24}>
                            Дата загрузки
                        </Col>
                        <Col span={24}>
                            {moment(item.date).format('DD.MM.YYYY')}
                        </Col>
                    </Row>
                    <Row className={styles.row}>
                        <Col 
                            className={styles.label}
                            span={24}>
                            Статус
                        </Col>
                        <Col span={24}>
                            <FileStatus status={item.status} />
                        </Col>
                    </Row>
                    <Row 
                        className={styles.row}
                        justify="space-between">
                        <Col className={styles.label}>
                            Размер
                        </Col>
                        <Col>
                            {getFileSize(item.size)}
                        </Col>
                    </Row>
                </div>
            </PaddingContainer>
        </div>
    );
};

export default FileItem;