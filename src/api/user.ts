import axios from 'axios'

export interface TagRecommendation {
    [propName: string]: string[],
}

export interface loginData {
    phone: number | string,
    password: string,
    name: string,
    email: string
}

export interface registerData extends loginData {
    code: number | string
}

export interface FileToken {
    'AccessKeySecret': string,
    'AccessKeyId': string,
    'Expiration': number,
    'SecurityToken': string
}

export interface UserLoginResponse {
    token: string,
    userName: string,
    userId: number,
    fileToken: FileToken
}

export const login = (data: loginData) =>
    axios.request<UserLoginResponse>({
    method: 'post',
    url: '/user/login_normal',
    data: data,
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
});

export const loginCookie = () => axios.request<UserLoginResponse>({
    method: 'get',
    url: '/user/login_cookie',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
});

export const getFileToken = () => axios.request<UserLoginResponse>({
    method: 'get',
    url: '/user/query_other_token',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
});

export const register = (data: registerData) => axios.request({
    method: 'post',
    url: '/user/register',
    data: {
        info: data,
        concern: {},
        status: false
    },
    headers: {'Content-Type': 'application/json'}
});

export const sendMessage = (phone: number | string) => axios.request({
    method: 'get',
    url: '/user/send_message',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    params: {
        phone: phone
    }
});
