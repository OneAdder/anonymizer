import React from 'react';
import styles from './Loading.module.less';


const Loading = () => {
    return (
        <div className={styles.wrapper}>
            Загрузка PDF документа...
        </div>
    );
};

export default Loading;