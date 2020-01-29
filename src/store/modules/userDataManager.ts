import {FragmentInfoPart} from "@/utils/userConcern";
import {Commit} from "vuex";
import Vue from 'vue';

declare global {
    interface UserDataManagerState {
        userConcernDict: Record<BaseType, Record<id, UserConcern>>,
        fragments: Array<FragmentInfoPart>,
        userSetting: Record<string, Record<string, any>>
    }
}

const state: UserDataManagerState = {
    userConcernDict: {
        node: {},
        link: {},
        media: {},
        document: {},
        note: {},
        fragment: {} // 不使用
    },
    fragments: [],
    userSetting: {
        fragmentCollect: {}
    }
};

const mutations = {
    userConcernAdd(state: UserDataManagerState, payload: { _id: id, _type: BaseType, userConcern: UserConcern }) {
        let {_id, _type, userConcern} = payload;
        Vue.set(state.userConcernDict[_type], _id, userConcern)
    }
};

const actions = {
    fragmentAdd(context: { commit: Commit, state: UserDataManagerState }, payload: FragmentInfoPart) {
        state.fragments.push(payload)
        // todo
    }
};

const getters = {
    fragmentSourceIdList(state: UserDataManagerState) {
        return state.fragments.map(fragment => fragment.Ctrl.SourceId)
    }
};

export default {
    state,
    mutations,
    actions,
    getters
};
