import {userLoginPayload} from "@/store/modules/userInfo";
import store from '../index';
import {FileToken} from "@/api/user";
import {snackBarStatePayload} from "@/store/modules/componentSnackBar";

export const commitUserLogin = (payload: userLoginPayload) => {
  return store.commit('loginSuccess', payload)
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

export const addLabel = (payload: Array<string>) => {
  return store.commit('addLabelColor', payload)
};
