import Axios, {AxiosRequestConfig} from 'axios';
import Qs from 'qs';

const localAxios = Axios.create({
    baseURL: '/api',
    paramsSerializer: (params) => Qs.stringify(params, {arrayFormat: 'repeat'})
});

export default {
    post: <T>(url: string, data?: any) => {
        return localAxios
            .post<T>(url, data);
    },
    get: <T>(url: string, params?: any, config?: AxiosRequestConfig) => {
        return localAxios
            .get<T>(
                url, 
                {
                    params,
                    ...config
                }
            );
    },
    put: <T>(url: string, params?: any, config?: AxiosRequestConfig) => {
        return localAxios
            .put<T>(
                url, 
                {
                    params,
                    ...config
                }
            );
    }
};