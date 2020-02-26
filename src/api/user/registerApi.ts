import {instance} from "@/api/main";
import {FastRegisterData, RegisterData} from "@/interface/interfaceInComponent";
import {LoginDataByPhoneCode} from "@/api/user/loginApi";

export const registerApi = (data: RegisterData) =>
    instance.request<UserLoginResponse>({
        method: 'post',
        url: '/user/register/normal',
        data: {
            Info: data,
            Addition: {}
        },
        headers: {'Content-Type': 'application/json'}
    });

export const registerFast = (data: FastRegisterData) =>
    instance.request<UserLoginResponse>({
        method: 'post',
        url: '/user/register/fast',
        data: {
            Info: data
        }
    });

export const sendCode = (phone: number | string) =>
    instance.request({
        method: 'get',
        url: '/user/register/send_code',
        params: {
            Phone: phone
        }
    });
