export type userId = number;
export type userName = string;
export type userLoginPayload = UserLoginResponse;
export const supportedLang = ['auto', 'en', 'zh'];

export interface UserInfo {
    userName: userName,
    userId: userId,
}

export interface State {
    isLogin: boolean,
    userInfo: UserInfo,
    lang: string
}

const state: State = {
    isLogin: false,
    userInfo: {
        userName: '',
        userId: 0
    } as UserInfo,
    lang: 'auto'
};

const mutations = {
    loginSet(state: State, payload: UserLoginResponse) {
        state.userInfo = payload;
        state.isLogin = true
    },

    loginOut(state: State) {
        state.isLogin = false
    },

    langChange(state: State, payload: string) {
        if (supportedLang.includes(payload)) {
            state.lang = payload
        }
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
