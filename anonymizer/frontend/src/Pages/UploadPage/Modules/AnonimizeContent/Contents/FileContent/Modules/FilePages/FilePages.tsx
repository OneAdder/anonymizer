import React, {useState} from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {useActiveUrl} from '../../../../Hooks/useActiveUrl';
import styles from './FilePages.module.less';
import {useActiveSettings} from '../../../../../../Hooks/useActiveSettings';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

type iPageComponent = {
    index: number;
}

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
                        <PageComponent
                            key={index}
                            index={index}
                        />
                    ))
            }
        </Document> 
    );
};


const PageComponent = (props: iPageComponent) => {
    const settings = useActiveSettings();
    if (!settings) return null;
    return (
        <Page
            scale={settings.scale}
            className={styles.page}
            renderAnnotationLayer={false}
            renderTextLayer={true}
            pageNumber={props.index + 1}
        />
    );
};

export default FileContent;