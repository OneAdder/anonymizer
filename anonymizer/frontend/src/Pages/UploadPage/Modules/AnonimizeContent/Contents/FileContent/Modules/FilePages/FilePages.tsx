import React, {useState} from 'react';
import { Document, pdfjs } from 'react-pdf';
import {useActiveUrl} from '../../../../Hooks/useActiveUrl';
import styles from './FilePages.module.less';
import PageItem from './Modules/PageItem/PageItem';
import {useActiveFile} from '../../../../../../Hooks/useActiveFile';
import {useDispatch} from 'react-redux';
import Actions from '@actions';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;



const FileContent = () => {
    const activeFile = useActiveFile();
    const dispatch = useDispatch();
    const url = useActiveUrl();
    const pages = activeFile?.data?.pages;

    if (!activeFile?.data) return null;
    if (!url) return null;

    return (
        <Document 
            renderMode="canvas"
            className={styles.document}
            onLoadSuccess={(data) => {
                if (!activeFile.file) return;
                dispatch(Actions.Pages.UploadPage.setPagesNumber({
                    num: data.numPages,
                    id: activeFile.file.uid
                }));
            }}

            file={url}>
            {
                pages && new Array(pages)
                    .fill('')
                    .map((item, index) => (
                        <PageItem
                            
                            key={index}
                            index={index}
                        />
                    ))
            }
        </Document> 
    );
};

export default FileContent;