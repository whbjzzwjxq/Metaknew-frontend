import {FragmentInfoPart, NoteSettingPart} from "@/class/graphItem";
import {ActionContext} from "vuex";
import {RootState} from '@/store';
import Vue from 'vue';
import {userConcernQuery} from "@/api/user/queryInfo";
import {userConcernTemplate} from "@/utils/template";
import {PropDescription, PropDescriptionDict} from "@/utils/fieldResolve";
import {
    fragmentAdd,
    fragmentDelete,
    fragmentUpdate,
    userPLabelPropsUpdate,
    userPropResolveUpdate
} from "@/api/user/dataApi";
import {
    commitNoteBookAdd,
    commitNoteInDocAdd,
    commitSnackbarOn,
    commitUserConcernAdd, commitUserLabelPropsChange,
    commitUserPropResolveAdd
} from "@/store/modules/_mutations";

declare global {
    interface UserSetting {
        FragmentCollect: {
            ByGood: boolean, // 点赞是否收集
            ByShare: boolean, // 分享是否收集
            AutoCollect: boolean // 是否自动收集
        }
        HelperOn: boolean // 是否打开提示
    }

    interface UserEditData {
        UserPropResolve: PropDescriptionDict // 用户对key的解释
        PLabelExtraProps: LabelProps // 用户对某个标签的额外属性
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
        userEditData: UserEditData,
        userEditDataLoad: boolean
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

    type LabelProps = Record<string, string[]> //label下的属性
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
        FragmentCollect: {
            AutoCollect: true,
            ByGood: true,
            ByShare: true
        },
        HelperOn: false
    },
    userEditData: {
        PLabelExtraProps: {},
        UserPropResolve: {},
    },
    userEditDataLoad: false,
    userNoteBook: [],
    userNoteInDoc: [],
};

const mutations = {
    // todo 改写成为queue list 已经列入文档
    userConcernAdd(state: UserDataManagerState, payload: UserConcernPayload) {
        let {id, type, userConcern, strict} = payload;
        strict === undefined && (strict = false);
        //Vue.set检查过
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
        //Vue.set检查过
        (strict || !state.userEditData.UserPropResolve[prop]) && Vue.set(state.userEditData.UserPropResolve, prop, resolve);
    },

    userLabelPropsChange(state: UserDataManagerState, payload: LabelProps) {
        Object.entries(payload).map(([label, props]) => {
            state.userEditData.PLabelExtraProps[label] = props
        })
    },

    userEditDataChange(state: UserDataManagerState, payload: UserEditData) {
        state.userEditData = payload;
        state.userEditDataLoad = true
    }
};

const actions = {
    fragmentPush(context: ActionContext<UserDataManagerState, RootState>, payload: FragmentInfoPart) {
        context.state.fragments.push(payload);
        fragmentAdd().then(() => {
            let payload = {
                actionName: 'fragmentAdd',
                content: '为您收集了碎片',
                color: 'success',
                once: false
            } as SnackBarStatePayload;
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

    userConcernUpdate(context: ActionContext<UserDataManagerState, RootState>, payload: { prop: any, value: any }) {

    },

    userConcernQuery(context: ActionContext<UserDataManagerState, RootState>, payload: id[]) {
        // 获取已有userConcern的idList
        let idList: id[] = context.getters.userConcernKeyList.map((key: UserConcernKey) => key.id);
        let state = context.state;
        let loadingList = state.userConcernLoadingList;
        // 添加那些没有在已有列表或加载列表中的key
        let newQueryList = payload.filter(id => !idList.includes(id) && !loadingList.includes(id));
        if (newQueryList.length > 0) {
            loadingList.push(...newQueryList);
            return userConcernQuery(state.userConcernLoadingList).then(res => {
                let concernList = res.data;
                concernList.map(concern => {
                    if (concern.userConcern) {
                        concern.userConcern.isModeled = true;
                        concern.userConcern.isConfirm = true;
                        concern.strict = true;
                        commitUserConcernAdd(concern);
                    } else {
                        let {id, type} = concern;
                        let userConcern = userConcernTemplate();
                        userConcern.isConfirm = true;
                        commitUserConcernAdd({id, type, userConcern, strict: true})
                    }
                })
            }).finally(() => {
                // 从loadingList 去除已经加载完成的内容
                context.getters.userConcernKeyList.map((key: UserConcernKey) => {
                    let concern = state.userConcernDict[key.type][key.id];
                    if (concern) {
                        let index = loadingList.indexOf(key.id);
                        index >= 0 && loadingList.splice(index, 1)
                    }
                });
            });
        } else {
            return true
        }
    },

    userPropResolvePush(context: ActionContext<UserDataManagerState, RootState>, payload: PropDescriptionPayload) {
        commitUserPropResolveAdd(payload);
        return userPropResolveUpdate([payload])
    },

    userLabelPropsPush(context: ActionContext<UserDataManagerState, RootState>, payload: LabelProps) {
        let unDuplicate: LabelProps = {};
        let propDict = context.state.userEditData.PLabelExtraProps;
        Object.entries(payload).map(([label, props]) => {
            if (propDict[label] !== props && (props !== [] && propDict[label] !== undefined)) {
                unDuplicate[label] = props.filter(prop => !/\$_*/.test(prop))
            }
        });
        if (Object.keys(unDuplicate).length > 0) {
            commitUserLabelPropsChange(unDuplicate);
            return userPLabelPropsUpdate(unDuplicate)
        } else {
            return true
        }
    },

    noteInDocPush(context: ActionContext<UserDataManagerState, RootState>, payload: { note: NoteSettingPart }) {
        commitNoteInDocAdd(payload)
    },

    noteInDocDelete() {

    },

    noteBookPush(context: ActionContext<UserDataManagerState, RootState>, payload: {note: NoteBook}) {
        commitNoteBookAdd(payload)
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
