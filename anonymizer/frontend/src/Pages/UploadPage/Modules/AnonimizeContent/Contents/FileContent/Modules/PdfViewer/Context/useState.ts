import { iState } from '@root/Redux/Pages/UploadPage/types';
import React from 'react';


export type iStateContext = {
    data: null | any;
    fetching: boolean;
    error: boolean;
}


export const StateContext = React.createContext<iStateContext>({
    data: null,
    error: false,
    fetching: false,
});

export const useStateContext = () => React.useContext(StateContext);  