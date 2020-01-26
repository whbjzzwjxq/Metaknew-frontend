import Vue from 'vue'
import {RectByPoint} from "@/utils/geoMetric";
import {commitBottomDynamicBarResize, commitViewBoxResize} from "@/store/modules/_mutations";

declare global {
    interface StyleManagerState {
        screenX: number,
        screenY: number,
        viewBox: RectByPoint,
        toolBar: ToolBar,
        leftCard: LeftCard,
        bottomBar: BottomBar,
        bottomDynamicBar: RectByPoint
    }

    interface ComponentSize {
        width: number | string,
        height: number | string,

        [propName: string]: number | string
    }
}

interface LeftCard extends ComponentSize {
    width: number
    height: string
}

interface BottomBar extends ComponentSize {
    width: string
    height: number,
}

interface ToolBar extends ComponentSize {
    width: string
    height: number,
}

const state: StyleManagerState = {
    toolBar: {
        width: '100%',
        height: 48
    },
    leftCard: {
        width: 400,
        height: '100%'
    },
    bottomBar: {
        width: '100%',
        height: 108
    },
    bottomDynamicBar: new RectByPoint({x: 0, y: document.documentElement.clientHeight - 240}, {x: 0, y: 0}, 0),
    screenX: document.documentElement.clientWidth,
    screenY: document.documentElement.clientHeight,
    viewBox: new RectByPoint({x: 0, y: 0}, {x: 0, y: 0}, 2)
};

const mutations = {
    resetScreen: (state: StyleManagerState) => {
        state.screenX = document.documentElement.clientWidth;
        state.screenY = document.documentElement.clientHeight;
        commitViewBoxResize();
        commitBottomDynamicBarResize();
    },

    resetLeftCard: (state: StyleManagerState, payload: number) => {
        Vue.set(state.leftCard, 'width', payload);
        commitViewBoxResize();
        commitBottomDynamicBarResize();
    },

    resetBottomBar: (state: StyleManagerState, payload: number) => {
        Vue.set(state.bottomBar, 'height', payload);
    },

    getViewBox: (state: StyleManagerState) => {
        state.viewBox.start.update({x: state.leftCard.width, y: state.toolBar.height});
        state.viewBox.end.update({x: state.screenX, y: state.screenY})
    },

    getBottomDynamicBar: (state: StyleManagerState, payload?: number) => {
        if (payload) {
            payload <= state.toolBar.height && (payload = state.toolBar.height); // 最高
            payload >= state.screenY - 240 && (payload = state.screenY - 240); // 最矮
        } else {
            (payload = state.screenY - 240) // doNothing
        }
        state.bottomDynamicBar.start.update({x: state.leftCard.width, y: payload});
        state.bottomDynamicBar.end.update({x: state.screenX, y: state.screenY})
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
