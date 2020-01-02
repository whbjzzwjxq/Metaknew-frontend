import axios from 'axios'
import {getCookie} from '@/utils/utils';

export const BASE = process.env.VUE_APP_BASE_URL;

axios.defaults.headers.common['Token'] = getCookie('token');
axios.defaults.headers.common['User-Name'] = getCookie('user_name');
axios.defaults.timeout = 50000;
axios.defaults.baseURL = BASE;
