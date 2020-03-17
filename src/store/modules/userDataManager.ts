import {FragmentInfoPart, NoteSettingPart} from "@/class/graphItem";
import {ActionContext} from "vuex";
import {RootState} from '@/store';
import Vue from 'vue';
import {userConcernQuery} from "@/api/user/queryInfo";
import {userConcernTemplate} from "@/utils/template";
import {PropDescription, PropDescriptionDict} from "@/utils/fieldResolve";
import {fragmentAdd, fragmentDelete, fragmentUpdate} from "@/api/user/dataApi";
import {commitNoteInDocAdd, commitSnackbarOn, commitUserConcernAdd} from "@/store/modules/_mutations";
import {dispatchUserConcernQuery} from "@/store/modules/_dispatch";

declare global {
    interface UserSetting {
        userPropResolve: PropDescriptionDict // 用户对key的解释
        pLabelExtraProps: Record<string, string[]> // 用户对某个属性的额外属性
        fragmentCollect: any // 碎片采集设置
    }

    interface UserDataManagerState {
        // userConcern 部分
        userConcernDict: Record<GraphItemType, Record<id, UserConcern>>, // 基础的数据仓库
        userConcernLoadingList: id[], // 正在加载的List
        timerForConcern?: number, // 计时器

        fragments: Array<FragmentInfoPart>, // user收集的碎片
        userNoteBook: NoteBook[], // 笔记本
        userNoteInDoc: NoteSettingPart[], // 所有专题的笔记， 通过father判断
        userSetting: UserSetting,
    }

    interface UserConcernKey {
        id: id,
        type: GraphItemType,
        isModeled: boolean
    }

    interface UserConcernPayload {
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
    // //todo 改写成为queue list
    userConcernAdd(state: UserDataManagerState, payload: UserConcernPayload) {
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

    noteInDocRemove(state: UserDataManagerState, payload: { note: NoteSettingPart }) {

    },

    userPropResolveAdd(state: UserDataManagerState, payload: PropDescriptionPayload) {
        let {prop, resolve, strict} = payload;
        strict === undefined && (strict = false);
        (strict || !state.userSetting.userPropResolve[prop]) && Vue.set(state.userSetting.userPropResolve, prop, resolve);
    },
};

const actions = {
    fragmentPush(context: ActionContext<UserDataManagerState, RootState>, payload: FragmentInfoPart) {
        context.state.fragments.push(payload);
        fragmentAdd().then(() => {
            let payload = {actionName: 'fragmentAdd', content: '为您收集了碎片', color: 'success', once: false} as SnackBarStatePayload;
            commitSnackbarOn(payload)
        })
    },

    fragmentDelete(context: ActionContext<UserDataManagerState, RootState>, payload: id) {
        let index = context.getters.fragmentSourceIdList.indexOf(payload);
        context.state.fragments.splice(index, 1);
        fragmentDelete().then(() => {

        })
    },

    fragmentUpdate(context: ActionContext<UserDataManagerState, RootState>, payload: id) {
        fragmentUpdate().then(() => {

        })
    },

    userConcernUpdate(context: ActionContext<UserDataManagerState, RootState>, payload: {prop: any, value: any}) {

    },

    userConcernGet(context: ActionContext<UserDataManagerState, RootState>, payload: InfoPartInDataManager) {
        let state = context.state;
        let userConcern = state.userConcernDict[payload._type][payload._id];
        // 远端请求
        if (payload.isRemote) {
            if (userConcern) {
                // 加载完毕
                return true
            } else {
                // 未加载 尝试加载
                return dispatchUserConcernQuery([payload._id])
            }
        } else {
            //error
        }
    },

    userConcernQuery(context: ActionContext<UserDataManagerState, RootState>, payload: id[]) {
        // 获取已有userConcern的id, 不管它是否是
        let idList: id[] = context.getters.userConcernKeyList.map((key: UserConcernKey) => key.id);
        let state = context.state;
        // 添加那些没有在列表中的key
        let newQueryList = payload.filter(key => !idList.includes(key));
        let currentQueryList = state.userConcernLoadingList;
        if (newQueryList.length > 0) {
            currentQueryList = currentQueryList.concat(newQueryList);
            state.timerForConcern && clearTimeout(state.timerForConcern);
            state.timerForConcern = setTimeout(() => {
                userConcernQuery(currentQueryList).then(res => {
                    let concernList = res.data;
                    concernList.map(concern => {
                        if (concern.userConcern) {
                            concern.userConcern.isModeled = true;
                            concern.strict = true;
                            commitUserConcernAdd(concern);
                        } else {
                            let {id, type} = concern;
                            let userConcern = userConcernTemplate();
                            userConcern.isModeled = false;
                            commitUserConcernAdd({id, type, userConcern, strict: true})
                        }
                        let {id} = concern;
                        let index = state.userConcernLoadingList.indexOf(id);
                        state.userConcernLoadingList.splice(index, 1)
                    })
                })
            }, 5000)
        } else {
            // 没有新的需要请求的userConcern了
        }
    },

    userPropResolveUpdate(context: ActionContext<UserDataManagerState, RootState>, payload: PropDescriptionPayload) {
        //todo
    },

    noteInDocPush(context: ActionContext<UserDataManagerState, RootState>, payload: {note: NoteSettingPart}) {
        commitNoteInDocAdd(payload)
    },

    noteInDocDelete() {

    }

};

const getters = {
    fragmentSourceIdList(state: UserDataManagerState) {
        return state.fragments.map(fragment => fragment.Ctrl.SourceId)
    },

    userConcernKeyList(state: UserDataManagerState) {
        let result: UserConcernKey[] = [];
        Object.entries(state.userConcernDict).map(([key, value]) => {
                Object.entries(value).map(([id, userConcern]) => {
                    result.push({id: id, type: key, isModeled: userConcern.isModeled} as UserConcernKey)
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
