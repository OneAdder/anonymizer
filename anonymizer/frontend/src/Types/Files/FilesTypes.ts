

export declare namespace iFiles {
    type Item = {
        name: string;
        date: string;
        size: number;
        status: Status;
        uid: string;
    }
    type Status = 'loading' | 'success' | 'error'
}