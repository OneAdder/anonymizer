import Axios from '../Axios';
import {iAnonimize} from './types';


export default  {
    anonimize: (params: iAnonimize.iAnonimize) => {
        const formData = new FormData();
        formData.append('file',params);
        return Axios.post<iAnonimize.oAnonimize>('/anonymize', formData)
    },
    list: () => Axios.get('/list_pdf'),
    download: (params: iAnonimize.iDownload) => {
        const result = new URLSearchParams()
        result.append('name', params.name);
        if (params.raw) result.append('raw', '123')
        if (params.hidden) result.append('hidden', '1')
        return `/api/load_pdf?${result.toString()}`
    }
}