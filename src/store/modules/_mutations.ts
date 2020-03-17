import {userLoginPayload} from "@/store/modules/userInfo";
import store from '../index';
import {DocumentSelfPart, GraphSelfPart, LinkInfoPart, NodeInfoPart, NoteSettingPart} from "@/class/graphItem";

export const commitUserLogin = (payload: userLoginPayload) => {
    return store.commit('loginSuccess', payload)
};

export const commitLoginOut = () => {
    return store.commit('loginOut')
};

export const commitFileToken = (payload: FileToken) => {
    return store.commit('updateFileToken', payload)
};

export const commitSnackbarOn = (payload: SnackBarStatePayload) => {
    return store.commit('snackBarOn', payload)
};

export const commitSnackbarOff = () => {
    return store.commit('snackBarOff')
};

export const commitNewLabel = (payload: Array<string>) => {
    return store.commit('addLabelColor', payload)
};

export const commitScreenResize = () => {
    return store.commit('resetScreen')
};

export const commitViewBoxResize = () => {
    return store.commit('getViewBox')
};

export const commitBottomDynamicBarResize = (payload?: number) => {
    return store.commit('getBottomDynamicBar', payload)
};

export const commitItemChange = (payload: NodeInfoPart | LinkInfoPart) => {
    return store.commit('currentItemChange', payload)
};

export const commitGraphChange = (payload: { graph: GraphSelfPart }) => {
    return store.commit('currentGraphChange', payload)
};

export const commitRootGraph = (payload: { graph: GraphSelfPart }) => {
    return store.commit('rootGraphChange', payload)
};

export const commitInfoAdd = (payload: { item: InfoPartInDataManager, strict?: boolean }) => {
    return store.commit('infoAdd', payload)
};

export const commitInfoRemove = (payload: { _id: id, _type: string }) => {
    return store.commit('infoRemove', payload)
};

export const commitInfoChangeId = (payload: { _type: string, idMap: IdMap }) => {
    return store.commit('infoChangeId', payload)
};

export const commitDocumentAdd = (payload: { document: GraphSelfPart | DocumentSelfPart, strict?: boolean }) => {
    return store.commit('documentAdd', payload)
};

export const commitDocumentRemove = (payload: id) => {
    return store.commit('documentRemove', payload)
};

export const commitDocumentChangeId = (payload: { oldId: id, newId: id }) => {
    return store.commit('documentChangeId', payload)
};

export const commitChangeRootTab = (payload: RootTabName | number) => {
    return store.commit('changeRootTab', payload)
};

export const commitChangeSubTab = (payload: SubTabName) => {
    return store.commit('changeSubTab', payload)
};

export const commitGlobalIndexPlus = (payload: number) => {
    return store.commit('userIndexPlus', payload)
};

export const commitLoginDialogChange = (payload: boolean) => {
    return store.commit('loginDialogChange', payload)
};

export const commitLoginDialogOn = (payload: 0 | 1) => {
    // 0 是登录 1是注册
    return store.commit('loginDialogTab', payload)
};

export const commitEditModeChange = (payload: boolean) => {
    return store.commit('changeEditMode', payload)
};

export const commitUserConcernAdd = (payload: UserConcernPayload) => {
    return store.commit('userConcernAdd', payload)
};

export const commitNoteInDocAdd = (payload: { note: NoteSettingPart }) => {
    return store.commit('noteInDocAdd', payload)
};
