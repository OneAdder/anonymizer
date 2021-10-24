import * as React from 'react';
import styles from './UploadPage.module.less';
import Extension from './Modules/Extension/Extension';
import AnonimizeContent from './Modules/AnonimizeContent/AnonimizeContent';

const UploadPage = () => {
    return (
        <div className={styles.wrapper}>
            <div className={styles.extension}>
                <Extension />
            </div>
            <div className={styles.content}>
                <AnonimizeContent />
            </div>
        </div>
    )
}

export default UploadPage;