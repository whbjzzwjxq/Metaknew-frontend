import {FragmentInfoPart} from "@/utils/userConcern";
import {Commit} from "vuex";
import Vue from 'vue';

declare global {
    interface UserDataManagerState {
        UserConcernDict: Record<BaseType, Record<id, UserConcern>>,
        Fragments: Array<FragmentInfoPart>,
        UserSetting: Record<string, Record<string, any>>
    }
}

const state: UserDataManagerState = {
    UserConcernDict: {
        node: {},
        link: {},
        media: {},
        document: {},
        note: {},
        fragment: {} // 不使用
    },
    Fragments: [],
    UserSetting: {
        fragmentCollect: {}
    }
};

const mutations = {
    userConcernAdd(state: UserDataManagerState, payload: {_id: id, _type: BaseType, userConcern: UserConcern}) {
        let {_id, _type, userConcern} = payload;
        Vue.set(state.UserConcernDict[_type], _id, userConcern)
    }
};

const actions = {
    fragmentAdd(context: { commit: Commit, state: UserDataManagerState }, payload: FragmentInfoPart) {
        state.Fragments.push(payload)
        // todo
    }
};

const getters = {};

export default {
    state,
    mutations,
    actions,
    getters
};
