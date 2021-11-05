import {useMemo} from 'react';
import Api from '@api';
import {useActiveFile} from '../../../Hooks/useActiveFile';


export const useActiveUrl = () => {
    const activeFile = useActiveFile();
    const url = useMemo(() => {
        if (!activeFile) return null;
        if (!activeFile.data) return null;
        if (activeFile.settings.mode === 'after') {
            return Api.Anonimize.download({
                name: activeFile.data.filename,
                hidden: true
            });
        } else {
            return Api.Anonimize.download({
                name: activeFile.data.filename,
            });
        }
    }, [activeFile]);
    return url;
};