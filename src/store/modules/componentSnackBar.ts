declare global {
    interface SnackBarStatePayload {
        color: string,
        content: string,
        buttonText?: string,
        action?: Function,
        actionObject?: Object,
        actionName: string,
        once: boolean,
        timeout?: number,
    }

    interface SnackBarState {
        on: boolean,
        oncePool: Record<string, boolean>,
        payload: SnackBarStatePayload
    }
}

const state: SnackBarState = {
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
    snackBarOn(state: SnackBarState, payload: SnackBarStatePayload) {
        let name = payload.actionName;
        if (!payload.once || !state.oncePool[name]) {
            state.on = true;
            state.oncePool[name] = true;
            payload.timeout || (payload.timeout = 2000);
            payload.buttonText || (payload.buttonText = '');
            state.payload = payload;
        }
    },

    snackBarOff(state: SnackBarState) {
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
