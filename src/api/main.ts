import axios from 'axios'
import { getCookie } from '@/utils/utils';

export const BASE = process.env.VUE_APP_BASE_URL;

export const baseService = axios.create({
  headers: {
    'Token': getCookie('token'),
    'User-Name': getCookie('user_name')
  },
  timeout: 50000
});
