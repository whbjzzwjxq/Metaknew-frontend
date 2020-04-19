import {userLoginPayload} from "@/store/modules/userInfo";
import store from '../index';
import {GraphSelfPart} from "@/class/settingGraph";
import {NoteBook} from "@/store/modules/userDataManager";
import {PaperSelfPart} from "@/class/settingPaper";
import {LinkInfoPart, NodeInfoPart} from "@/class/info";
import {DocumentSelfPart, NoteSettingPart} from "@/class/settingBase";

export const commitLoginIn = (payload: userLoginPayload) => {
    return store.commit('loginSet', payload)
};

export const commitLoginOut = () => {
    return store.commit('loginOut')
};

export const commitFileTokenRefresh = (payload: FileToken) => {
    return store.commit('fileTokenRefresh', payload)
};

export const commitSnackbarOn = (payload: SnackBarStatePayload) => {
    return store.commit('snackBarOn', payload)
};

export const commitSnackbarOff = () => {
    return store.commit('snackBarOff')
};

export const commitLabelColorAdd = (payload: Array<string>) => {
    return store.commit('labelColorAdd', payload)
};

export const commitScreenRefresh = () => {
    return store.commit('screenRefresh')
};

export const commitViewBoxResize = () => {
    return store.commit('viewBoxRefresh')
};

export const commitBottomBarCollapse = (payload: number) => {
    return store.commit('bottomBarReset', payload)
};

export const commitBottomDynamicBarResize = (payload?: number) => {
    return store.commit('bottomDynamicBarReset', payload)
};

export const commitItemChange = (payload: NodeInfoPart | LinkInfoPart) => {
    return store.commit('currentItemChange', payload)
};

export const commitGraphChange = (payload: { graph: GraphSelfPart }) => {
    return store.commit('currentGraphChange', payload)
};

export const commitRootDocPush = (payload: { document: DocumentSelfPartAny }) => {
    return store.commit('rootDocumentPush', payload)
};

export const commitInfoAdd = (payload: { item: InfoPartInDataManager, strict?: boolean }) => {
    return store.commit('infoAdd', payload)
};

export const commitInfoRemove = (payload: { _id: id, _type: string }) => {
    return store.commit('infoRemove', payload)
};

export const commitInfoIdChange = (payload: { _type: string, idMap: IdMap }) => {
    return store.commit('infoIdChange', payload)
};

export const commitDocumentAdd = (payload: { document: GraphSelfPart | DocumentSelfPartAny, strict?: boolean }) => {
    return store.commit('documentAdd', payload)
};

export const commitDocumentRemove = (payload: id) => {
    return store.commit('documentRemove', payload)
};

export const commitDocumentIdChange = (payload: { oldId: id, newId: id }) => {
    return store.commit('documentIdChange', payload)
};

export const commitRootTabChange = (payload: RootTabName | number) => {
    return store.commit('rootTabChange', payload)
};

export const commitSubTabChange = (payload: SubTabName) => {
    return store.commit('subTabChange', payload)
};

export const commitGlobalIndexPlus = (payload: number) => {
    return store.commit('userIndexPlus', payload)
};

export const commitLoginDialogChange = (payload: boolean) => {
    return store.commit('loginDialogChange', payload)
};

export const commitLoginDialogOn = (payload: 0 | 1) => {
    // 0 是登录 1是注册
    return store.commit('loginDialogTabOn', payload)
};

export const commitUserConcernAdd = (payload: UserConcernPayload) => {
    return store.commit('userConcernAdd', payload)
};

export const commitNoteInDocAdd = (payload: { note: NoteSettingPartAny }) => {
    return store.commit('noteInDocAdd', payload)
};

export const commitUserPropResolveAdd = (payload: PropDescriptionPayload) => {
    return store.commit('userPropResolveAdd', payload)
};

export const commitUserLabelPropsChange = (payload: LabelProps) => {
    return store.commit('userLabelPropsChange', payload)
};

export const commitUserEditDataLoadDone = (payload: UserEditData) => {
    return store.commit('userEditDataChange', payload)
};

export const commitNoteBookAdd = (payload: {note: NoteBook}) => {
    return store.commit('noteBookAdd', payload)
};

export const commitBottomDynamicBarChange = (payload: {on?: boolean, type?: BottomDynamicBarType}) => {
    return store.commit('bottomDynamicBarChange', payload)
};

export const commitLangChange = (payload: string) => {
    return store.commit('langChange', payload)
};

export const commitPaperChange = (payload: {paper: PaperSelfPart}) => {
    return store.commit('currentPaperChange', payload)
}
