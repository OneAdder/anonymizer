import {RequestFullState} from '@utils/Redux/requestState/types';
import {RcFile} from 'antd/lib/upload';
import {iFiles} from '@types';
import {iAnonimize} from '@root/Api/types';
 
export declare namespace iState {
    type fileMode = 'after' | 'until';
    type Settings = {
        mode: fileMode;
        scale: number;
        verification: boolean;
    }
    type Value = {
        files: {
            [key:string]: 
                RequestFullState<iAnonimize.oAnonimize> & 
                {
                    file: iFiles.Item | null;    
                    settings: Settings;
                }
        },
        activeFile: string | null;
    }
}

export declare namespace iActions {
    type uploadFile = File;
    type _uploadFileSuccess = {
        file: File | RcFile;
        data: iAnonimize.oAnonimize
    }
    type _uploadFileError = File | RcFile;
    type setActiveFile = string | null;
    type changeScale = {
        type: 'increase' | 'decrease'
        id: string;
    }
    type changeSettings = {
        id: string;
        settings: Partial<iState.Settings>
    }
}