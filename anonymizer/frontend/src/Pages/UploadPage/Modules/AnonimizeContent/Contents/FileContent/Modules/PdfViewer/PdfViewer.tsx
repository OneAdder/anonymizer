import React, {useEffect, useState} from 'react';
import styles from './PdfViewer.module.less';
import {pdfjs} from 'react-pdf';
import {useActiveUrl} from '../../../../Hooks/useActiveUrl';
import {StateContext, iStateContext} from './Context/useState';
import ContentController from './Controller/ContentController';
import {useDispatch} from 'react-redux';
import {useActiveFile} from '../../../../../../Hooks/useActiveFile';
import Actions from '@actions';

const PdfViewer = () => {
    const url = useActiveUrl();
    const dispatch = useDispatch();
    const file = useActiveFile();
    const [context, setContext] = useState<iStateContext>({
        data: null,
        error: false,
        fetching: false
    });

    useEffect(() => {
        if (!url) return;
        setContext({
            ...context,
            fetching: true
        });
        pdfjs
            .getDocument(url)
            .promise
            .then((result) => {
                setContext({
                    ...context,
                    fetching: false,
                    data: result
                });
            })
            .catch(() => {
                setContext({
                    fetching: false,
                    data: null,
                    error: true
                });
            })
    }, [url]);

    useEffect(() => {
        if (!file?.file?.uid) return;
        if (!context.data) return;
        dispatch(Actions.Pages.UploadPage.setPagesNumber({
            num: context.data.numPages,
            id: file.file.uid
        }));
    }, [file?.file?.uid, context.data]);

    if (!url) return null;
    return (
        <StateContext.Provider value={context}>
            <div className={styles.wrapper}>
                <ContentController />
            </div>
        </StateContext.Provider>
    );
};

export default PdfViewer;