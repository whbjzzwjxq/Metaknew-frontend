import {instanceLogin} from "@/api/main";
import {getCookie} from "@/utils/utils";

declare global {
    interface FileToken {
        'AccessKeySecret': string,
        'AccessKeyId': string,
        'Expiration': number,
        'SecurityToken': string
    }

    interface UserLoginResponse {
        token: string,
        userName: string,
        userId: number,
        fileToken: FileToken,
        personalId: number
    }
}

export interface LoginDataByPhoneCode {
    Phone: string,
    Code: string
}

export interface LoginDataByUserName {
    Name: string,
    Password: string,
    IsEmail: boolean
}

export const loginUserName = (data: LoginDataByUserName) =>
    instanceLogin.request<UserLoginResponse>({
        method: 'post',
        url: '/user/login/user_name',
        data: data,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    });

export const loginPhoneCode = (data: LoginDataByPhoneCode) =>
    instanceLogin.request<UserLoginResponse>({
        method: 'get',
        url: '/user/login/phone_code',
        params: {
            Phone: data.Phone,
            Code: data.Code
        },
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    });

export const loginCookie = () =>
    instanceLogin.request<UserLoginResponse>({
        method: 'get',
        url: '/user/login/cookie',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Name': getCookie('user_name'),
            'Token': getCookie('token')
        },
    });
