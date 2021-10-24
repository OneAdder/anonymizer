import React from 'react';
import UploadWrapper from '../../Modules/UploadWrapper/UploadWrapper';
import styles from './List.module.less';
import Icon from '../../Icons/AddFileIcon';
import FilesList from './Modules/FilesList/FilesList';
import PaddingContainer from './Components/PaddingContainer/PaddingContainer';

const List = () => {
    return (
        <div>
            <PaddingContainer>
                <div className={styles.uploadBtn}>
                    <UploadWrapper>
                        <div className={styles.uploadBtnContent}>
                            <div className={styles.uploadBtnIcon}>
                                <Icon />
                            </div>
                            Загрузить еще
                        </div>
                    </UploadWrapper>
                </div>
            </PaddingContainer>
            <div className={styles.filesList}>
                <FilesList />
            </div>
        </div>
    )
}

export default List;