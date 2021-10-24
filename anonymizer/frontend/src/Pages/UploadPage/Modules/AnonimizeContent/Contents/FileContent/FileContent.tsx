import React,{useState} from 'react';
import Toolbar from './Modules/Toolbar/Toolbar';
import {useActiveUrl} from '../../Hooks/useActiveUrl';
import styles from './FileContent.module.less';
import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;


const FileContent = () => {
    const url = useActiveUrl();
    const [pages, setPages] = useState<null|number>(null);

    if (!url) return null;
    return (
        <>
            <Toolbar />
            <div className={styles.pdfContent}>
                <embed 
                    src={url}
                    height="100%"
                    width="100%"
                />
                
            </div>
        </>
    )
}


export default FileContent;