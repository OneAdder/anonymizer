import React, {useEffect} from 'react';
import {useFilesList} from '../../../../Hooks/useFilesList';
import NoData from '../../Contents/NoData/NoData';
import NoChoosen from '../../Contents/NoChoosen/NoChoosen';
import {useSelector} from 'react-redux';
import {AppState} from '@root/Redux/store';
import FileContent from '../../Contents/FileContent/FileContent';
import { useActiveFile } from '@root/Pages/UploadPage/Hooks/useActiveFile';

const ContentController = () => {
    const files = useFilesList();
    const activeFileName = useSelector((state:AppState) => state.Pages.UploadPage.activeFile);
    const activeFile = useActiveFile();

    if (!files.length) return <NoData />;
    if (!activeFileName) return <NoChoosen />;
    if (activeFile) return <FileContent />;
    return null;
};



export default ContentController;