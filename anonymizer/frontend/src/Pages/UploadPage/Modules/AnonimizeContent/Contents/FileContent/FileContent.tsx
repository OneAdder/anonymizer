import React from 'react';
import Toolbar from './Modules/Toolbar/Toolbar';
import {useActiveUrl} from '../../Hooks/useActiveUrl';
import styles from './FileContent.module.less';
import {Scrollbars} from 'react-custom-scrollbars';
import FilePages from './Modules/FilePages/FilePages';
import PdfViewer from './Modules/PdfViewer/PdfViewer';

const FileContent = () => {
    const url = useActiveUrl();
    if (!url) return null;
    return (
        <>
            <Toolbar />
            <div className={styles.pdfContent}>
                <Scrollbars hideTracksWhenNotNeeded>
                    <PdfViewer />
                    {/* <FilePages /> */}
                </Scrollbars>    
            </div>
        </>
    );
};


export default FileContent;