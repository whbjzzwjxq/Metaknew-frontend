export interface snackBarStatePayload {
  color: string,
  content: string,
  buttonText: string,
  action?: Function,
  actionObject?: Object,
  actionName: string,
  once: boolean,
  timeout?: number,
}

export interface State {
  on: boolean,
  oncePool: Record<string, boolean>,
  payload: snackBarStatePayload
}

const state: State = {
  on: false,
  oncePool: {},
  payload: {
    color: "success",
    content: "",
    buttonText: "",
    action: undefined,
    actionObject: undefined,
    actionName: '',
    once: false,
    timeout: 2000
  }
};

const mutations = {
  snackBarOn(state: State, payload: snackBarStatePayload) {
    let name = payload.actionName;
    if (!payload.once || !state.oncePool[name]) {
      state.on = true;
      state.oncePool[name] = true;
      state.payload = payload;
      Object.prototype.hasOwnProperty.call(payload, 'timeout')
        ? (state.payload.timeout = payload.timeout)
        : (state.payload.timeout = 2000);
    }
  },

  snackBarOff(state: State) {
    state.on = false;
  }
};

const actions = {};

const getters = {};

export default {
  state,
  mutations,
  actions,
  getters
}
