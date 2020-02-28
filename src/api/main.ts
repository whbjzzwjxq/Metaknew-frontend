import axios from 'axios'
import {getCookie, setLoginIn, setLoginOut} from '@/utils/utils';

export const BASE = process.env.VUE_APP_BASE_URL;
export const instance = axios.create();
instance.defaults.timeout = 50000;
instance.defaults.baseURL = BASE;
instance.interceptors.request.use(function (request) {
    request.headers['Token'] = getCookie('token');
    request.headers['User-Name'] = getCookie('user_name');
    return request
});

export const instanceLogin = axios.create();
instanceLogin.defaults.timeout = 50000;
instanceLogin.defaults.baseURL = BASE;
instanceLogin.interceptors.response.use(function (response) {
    setLoginIn(response, true);
    return response
}, function (error) {
    return Promise.reject(error)
});
