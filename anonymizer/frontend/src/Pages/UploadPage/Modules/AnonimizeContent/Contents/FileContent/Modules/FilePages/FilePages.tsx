import React, {useState} from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {useActiveUrl} from '../../../../Hooks/useActiveUrl';
import styles from './FilePages.module.less';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;


const FileContent = () => {
    const [pages, setPages] = useState<null|number>(null);
    const url = useActiveUrl();
    if (!url) return null;

    return (
        <Document 
            renderMode="canvas"
            className={styles.document}
            onLoadSuccess={(data) => {
                setPages(data.numPages);
            }}
            file={url}>
                {
                    pages && new Array(pages)
                        .fill('')
                        .map((item, index) => (
                            <Page
                                scale={1}
                                className={styles.page}
                                renderAnnotationLayer={false}
                                key={index}
                                renderTextLayer={true}
                                pageNumber={index + 1}
                            />
                        ))
                }
        </Document> 
    );
};

export default FileContent;