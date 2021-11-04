import React from 'react';
import styles from './AnonimizeContent.module.less';
import ContentController from './Controllers/ContentController/ContentController';

const AnonimizeContent = () => {
    return (
        <div className={styles.wrapper}>
            <ContentController />
        </div>
    );
};


export default AnonimizeContent;