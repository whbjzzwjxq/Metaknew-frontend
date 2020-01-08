import {instance} from './main'

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

declare global {
    interface FileToken {
        'AccessKeySecret': string,
        'AccessKeyId': string,
        'Expiration': number,
        'SecurityToken': string
    }
}

export interface UserLoginResponse {
    token: string,
    userName: string,
    userId: number,
    fileToken: FileToken
}

export const login = (data: loginData) =>
    instance.request<UserLoginResponse>({
        method: 'post',
        url: '/user/login_normal',
        data: data,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    });

export const loginCookie = () => instance.request<UserLoginResponse>({
    method: 'get',
    url: '/user/login_cookie',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
});

export const getFileToken = () => instance.request<UserLoginResponse>({
    method: 'get',
    url: '/user/query_other_token',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
});

export const register = (data: registerData) => instance.request({
    method: 'post',
    url: '/user/register',
    data: {
        info: data,
        concern: {},
        status: false
    },
    headers: {'Content-Type': 'application/json'}
});

export const sendMessage = (phone: number | string) => instance.request({
    method: 'get',
    url: '/user/send_message',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    params: {
        phone: phone
    }
});
