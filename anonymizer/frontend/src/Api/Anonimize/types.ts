
export declare namespace iAnonimize {
    export type iAnonimize = File;
    export type oAnonimize = {
        filename: string;
        input: string;
        not_sure: boolean;
    }
    export type iDownload = {
        name: string;
        raw?: string;
        hidden?: boolean;
    }
}