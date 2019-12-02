import {BASE, baseService} from './main';

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

export function login(data: loginData) {
  return baseService({
    method: 'post',
    url: BASE + '/user/login_normal',
    data: data,
    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
  })
}

export function loginCookie() {
  return baseService({
    method: 'get',
    url: BASE + '/user/login_cookie',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
  })
}

export function getFileToken() {
  return baseService({
    method: 'get',
    url: BASE + '/user/query_other_token',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
  })
}

export function register(data: registerData) {
  return baseService.post(BASE + '/user/register',
    {
      info: data,
      concern: {},
      status: false
    },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    })
}

export function sendMessage(phone: number | string) {
  return baseService.post(BASE + '/user/send_message', {}, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    params: {
      phone: phone
    }
  })
}
