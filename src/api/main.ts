import axios from 'axios'
import {getCookie} from '@/utils/utils';

export const BASE = process.env.VUE_APP_BASE_URL;
export const instance = axios.create();
instance.defaults.headers.common['Token'] = getCookie('token');
instance.defaults.headers.common['User-Name'] = getCookie('user_name');
instance.defaults.timeout = 50000;
instance.defaults.baseURL = BASE;
