import React from 'react';
import {useFilesList} from '../../../../../../Hooks/useFilesList';
import PaddingContainer from '../../Components/PaddingContainer/PaddingContainer';
import styles from './FilesList.module.less';
import FileItem from './Components/FileItem/FileItem';
import {useSelector} from 'react-redux';
import {AppState} from '@root/Redux/store';

const FilesList = () => {
    const data = useFilesList();
    const activeFileName = useSelector((state:AppState) => state.Pages.UploadPage.activeFile);

    return (
        <div>
            <PaddingContainer>
                <div className={styles.title}>
                    Всего {data.length} файлов
                </div>
            </PaddingContainer>
            <div>
                {data.map((item, index) => {
                    if (!item.file) return null;
                    return (
                        <FileItem 
                            active={activeFileName === item.file.uid}
                            key={index}
                            item={item.file}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default FilesList;