import {userLoginPayload} from "@/store/modules/userInfo";
import store from '../index';
import {FileToken} from "@/api/user";
import {SnackBarStatePayload} from "@/store/modules/componentSnackBar";
import {GraphSelfPart, id} from "@/utils/graphClass";
import {InfoPart, idMap} from "@/store/modules/dataManager";

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

export const commitItemChange = (payload: InfoPart) => {
    return store.commit('currentItemChange', payload)
};

export const commitGraphChange = (payload: { graph: GraphSelfPart}) => {
    return store.commit('currentGraphChange', payload)
};

export const commitInfoAdd = (payload: { item: InfoPart, strict?: boolean }) => {
    return store.commit('infoAdd', payload)
};

export const commitInfoRemove = (payload: { _id: id, _type: string }) => {
    return store.commit('infoRemove', payload)
};

export const commitInfoChangeId = (payload: { _type: string, idMap: idMap }) => {
    return store.commit('infoChangeId', payload)
};

export const commitGraphAdd = (payload: { graph: GraphSelfPart, strict?: boolean }) => {
    return store.commit('graphAdd', payload)
};

export const commitGraphRemove = (payload: id) => {
    return store.commit('graphRemove', payload)
};

export const commitGraphChangeId = (payload: idMap) => {
    return store.commit('graphChangeId', payload)
};
