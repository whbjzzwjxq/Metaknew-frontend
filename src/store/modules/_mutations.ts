import {userLoginPayload} from "@/store/modules/userInfo";
import store from '../index';
import {FileToken} from "@/api/user";
import {snackBarStatePayload} from "@/store/modules/componentSnackBar";
import {GraphSelfPart, id, LinkSettingPart, MediaSettingPart, NodeSettingPart} from "@/utils/graphClass";
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

export const commitSnackbarOn = (payload: snackBarStatePayload) => {
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

export const commitItemChange = (payload: InfoPart) => {
  return store.commit('currentItemChange', payload)
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

export const commitSettingPush = (payload: Array<NodeSettingPart | LinkSettingPart | MediaSettingPart>) => {
  if (payload.length > 0) {
    payload[0] instanceof NodeSettingPart
      ? store.commit('nodeSettingPush', payload)
      : payload[0] instanceof LinkSettingPart
      ? store.commit('linkSettingPush', payload)
      : store.commit('mediaSettingPush', payload)
  } else {
    //
  }
};
