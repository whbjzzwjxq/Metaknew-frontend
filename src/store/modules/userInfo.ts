import {loginCookie} from '@/api/user/loginApi'
import {setLoginIn} from '@/utils/utils'
import {Commit, Dispatch} from "vuex";

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
}

const state: State = {
    isLogin: false,
    userInfo: {
        userName: '',
        userId: 0
    } as UserInfo,
};

const mutations = {
    loginSuccess(state: State, payload: UserLoginResponse) {
        state.userInfo = payload;
        state.isLogin = true
    },

    loginOut(state: State) {
        state.isLogin = false
    }
};

const actions = {};

const getters = {};

export default {
    state,
    mutations,
    actions,
    getters
}
