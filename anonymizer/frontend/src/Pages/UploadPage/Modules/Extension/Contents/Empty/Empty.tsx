import React from 'react';
import UploadWrapper from '../../Modules/UploadWrapper/UploadWrapper';
import Icon from '../../Icons/AddFilesImg';
import styles from './Empty.module.less';

const EmptyContent = () => {
    return (
        <div className={styles.wrapper}>
            <UploadWrapper>
                <>
                    <div>
                        <Icon />
                        <div className={styles.title}>
                        Кликните или перенесите файлы
                        </div>
                        <div className={styles.desc}>
                        Можно загрузить сразу несколько файлов
                        </div>
                    </div>
                </>
            </UploadWrapper>
        </div>
    )
}


export default EmptyContent;