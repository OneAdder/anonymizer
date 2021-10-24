
import {useFilesList} from './useFilesList';
import {useSelector} from 'react-redux';
import {AppState} from '@root/Redux/store';



export const useActiveFile = () => {
    const activeFileUID = useSelector((state:AppState) => state.Pages.UploadPage.activeFile);
    const filesList = useFilesList()
    if (!filesList) return null;
    const item = filesList.find((item) => item.file?.uid === activeFileUID);
    if (!item) return null;
    return item;
}