
import {useActiveFile} from '@root/Pages/UploadPage/Hooks/useActiveFile';


export const useActiveSettings = () => {
    const item = useActiveFile();
    if (!item) return null;
    return item.settings;
};
