import {FragmentInfoPart, NoteSettingPart} from "@/class/graphItem";
import {ActionContext} from "vuex";
import {RootState} from '@/store';
import Vue from 'vue';
import {userConcernQuery} from "@/api/user/queryInfo";
import {commitUserConcernAdd, commitUserPropDescription} from "@/store/modules/_mutations";
import {userConcernTemplate} from "@/utils/template";
import {PropDescription, PropDescriptionDict} from "@/utils/fieldResolve";

declare global {
    interface UserSetting {
        userPropResolve: PropDescriptionDict // 用户对key的解释
        pLabelExtraProps: Record<string, string[]> // 用户对某个属性的额外属性
        fragmentCollect: any // 碎片采集设置
    }
    interface UserDataManagerState {
        userConcernDict: Record<GraphItemType, Record<id, UserConcern>>, // 基础的数据仓库
        userConcernLoadingList: ConcernKey[], // 正在加载的List
        fragments: Array<FragmentInfoPart>, // user收集的碎片
        userNoteBook: NoteBook[], // 笔记本
        userNoteInDoc: NoteSettingPart[], // 当前专题下的笔记
        timerForConcern?: number, // 计时器
        userSetting: UserSetting,
    }

    interface ConcernKey {
        id: id,
        isRemote: boolean
    }

    interface ConcernPayload {
        id: id,
        type: GraphItemType,
        userConcern: UserConcern,
        strict?: boolean
    }

    interface PropDescriptionPayload {
        prop: string,
        resolve: PropDescription,
        strict?: boolean
    }
}

interface NoteBookState extends BaseState {
    isEditing: boolean
}

export interface NoteBook extends BaseCtrl {
    Name: string,
    Text: string,
    Svg: any,
    _id: id,
    State: NoteBookState
}

const state: UserDataManagerState = {
    userConcernDict: {
        node: {},
        link: {},
        media: {},
        document: {},
        text: {}
    },
    userConcernLoadingList: [],
    timerForConcern: undefined,
    fragments: [],
    userSetting: {
        fragmentCollect: {},
        pLabelExtraProps: {},
        userPropResolve: {}
    },
    userNoteBook: [],
    userNoteInDoc: [],
};

const mutations = {
    //todo 改写成为queue list
    userConcernAdd(state: UserDataManagerState, payload: ConcernPayload) {
        let {id, type, userConcern, strict} = payload;
        strict === undefined && (strict = false);
        (strict || state.userConcernDict[type][id] === undefined) && Vue.set(state.userConcernDict[type], id, userConcern)
    },

    noteBookAdd(state: UserDataManagerState, payload: { note: NoteBook }) {
        let {note} = payload;
        state.userNoteBook.push(note)
    },

    noteBookRemove(state: UserDataManagerState, payload: { note: NoteBook }) {
        let {note} = payload;
        let index = state.userNoteBook.indexOf(note);
        state.userNoteBook.splice(index, 1);
    },

    noteInDocAdd(state: UserDataManagerState, payload: { note: NoteSettingPart }) {
        let {note} = payload;
        state.userNoteInDoc.push(note)
    },

    addUserPropResolve(state: UserDataManagerState, payload: PropDescriptionPayload) {
        let {prop, resolve, strict} = payload;
        strict === undefined && (strict = false);
        (strict || !state.userPropResolve[prop]) && Vue.set(state.userPropResolve, prop, resolve);
    },
};

const actions = {
    fragmentAdd(context: ActionContext<UserDataManagerState, RootState>, payload: FragmentInfoPart) {
        state.fragments.push(payload)
        // todo
    },

    userConcernQuery(context: ActionContext<UserDataManagerState, RootState>, payload: InfoPartInDataManager) {
        let state = context.state;
        let userConcern = state.userConcernDict[payload._type][payload._id];
        // 远端请求
        if (payload.isRemote) {
            if (userConcern && userConcern.isRemote) {
                // 加载完毕
            } else {
                // 未加载
                context.dispatch('addUserConcernQuery', [{
                    id: payload._id,
                    type: payload._type,
                    isRemote: false
                }]).then();
            }
        } else {
            commitUserConcernAdd({id: payload._id, type: payload._type, userConcern: userConcernTemplate()})
        }
    },

    addUserConcernQuery(context: ActionContext<UserDataManagerState, RootState>, payload: ConcernKey[]) {
        let keyList: ConcernKey[] = context.getters.userConcernKeyList.filter((key: ConcernKey) => !key.isRemote);
        let state = context.state;
        // 添加那些没有在列表中的key
        let addKeyList = payload.filter(key => !keyList.includes(key));
        let queryList = state.userConcernLoadingList;
        if (addKeyList.length > 0) {
            queryList = queryList.concat(addKeyList);
            state.timerForConcern && clearTimeout(state.timerForConcern);
            state.timerForConcern = setTimeout(() => {
                userConcernQuery(queryList).then(res => {
                    let concernList = res.data;
                    concernList.map(concern => {
                        if (concern.userConcern) {
                            concern.userConcern.isRemote = true;
                            concern.strict = true;
                            commitUserConcernAdd(concern);
                        } else {
                            let {id, type} = concern;
                            let userConcern = userConcernTemplate();
                            userConcern.isRemote = true;
                            commitUserConcernAdd({id, type, userConcern, strict: true})
                        }
                        let {id, type} = concern;
                        let index = state.userConcernLoadingList.indexOf({id, isRemote: false});
                        state.userConcernLoadingList.splice(index, 1)
                    })
                })
            }, 5000)
        } else {

        }
    },

    changeUserPropResolve(context: ActionContext<UserDataManagerState, RootState>, payload: PropDescriptionPayload) {
        commitUserPropDescription(payload)
    },

};

const getters = {
    fragmentSourceIdList(state: UserDataManagerState) {
        return state.fragments.map(fragment => fragment.Ctrl.SourceId)
    },

    userConcernKeyList(state: UserDataManagerState) {
        let result: ConcernKey[] = [];
        Object.entries(state.userConcernDict).map(([key, value]) => {
                Object.entries(value).map(([id, userConcern]) => {
                    result.push({id: id, type: key, isRemote: userConcern.isRemote} as ConcernKey)
                })
            }
        );
        return result
    }
};

export default {
    state,
    mutations,
    actions,
    getters
};
