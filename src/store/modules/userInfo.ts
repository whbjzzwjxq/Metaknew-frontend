import {loginCookie, UserLoginResponse} from '@/api/user'
import {setCookie} from '@/utils/utils'
import {Commit, Dispatch} from "vuex";
import {commitFileToken, commitUserLogin} from "@/store/modules/_mutations";

export type userId = number;
export type userName = string;
export type userLoginPayload = UserLoginResponse;

export interface UserInfo {
    userName: userName,
    userId: userId,
}

export interface State {
    isLogin: boolean,
    userInfo: UserInfo,
    fileToken: FileToken
}

const state: State = {
    isLogin: false,
    userInfo: {
        userName: '',
        userId: 0
    } as UserInfo,
    fileToken: <FileToken>{
        AccessKeySecret: '',
        AccessKeyId: '',
        Expiration: 1571219891,
        SecurityToken: ''
    }
};

const mutations = {
    loginSuccess(state: State, payload: UserLoginResponse) {
        state.userInfo = payload;
        state.isLogin = true
    },

    loginOut(state: State) {
        state.isLogin = false
    },

    updateFileToken(state: State, payload: FileToken) {
        state.fileToken = payload
    }
};

const actions = {
    loginCookie: (context: { commit: Commit, state: State, dispatch: Dispatch }) => {
        loginCookie().then((res) => {
            const {data} = res;
            setCookie('user_name', data.userName, 7);
            setCookie('token', data.token, 7);
            commitUserLogin(data);
            commitFileToken(data.fileToken)
        })
    }
};

const getters = {};

export default {
    state,
    mutations,
    actions,
    getters
}
