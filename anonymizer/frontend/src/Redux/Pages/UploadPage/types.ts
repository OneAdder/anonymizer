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
    type verificationNode = {
        x: number,
        y: number,
        width: number,
        height: number,
        verificated: boolean;
        key: string;
        pageIndex: number;
    }
    type AnonimizeData = iAnonimize.oAnonimize & {
        pages: null | number;
    }
    type Value = {
        files: {
            [key:string]: 
                RequestFullState<AnonimizeData> & 
                {
                    file: iFiles.Item | null;    
                    settings: Settings;
                    verificationNodes: verificationNode[]
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
    type setPagesNumber = {
        id: string;
        num: number;
    }
    type addVerificationNode = {
        node: Omit<iState.verificationNode, 'key' | 'verificated'>;
        id: string;
    }
    type endVerification = {
        id: string
    }
    type deleteVerificationNode = {
        fileId: string;
        nodeId: string;
    }
}