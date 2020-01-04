import Vue from 'vue'
import {AreaRect, RectByPoint} from "@/utils/geoMetric";
import {commitViewBoxResize} from "@/store/modules/_mutations";

export interface ComponentSize {
    width: number | string,
    height: number | string,

    [propName: string]: number | string
}

interface LeftCard extends ComponentSize {
    width: number
}

interface BottomBar extends ComponentSize {
    height: number,
    width: string
}

export interface ToolBar extends ComponentSize {
    height: number
}

export interface StyleManagerState {
    screenX: number,
    screenY: number,
    viewBox: RectByPoint,
    toolBar: ToolBar,
    leftCard: LeftCard,
    bottomBar: BottomBar
}

const state: StyleManagerState = {
    toolBar: {
        width: '100%',
        height: 48
    },
    leftCard: {
        width: 360,
        height: '100%'
    },
    bottomBar: {
        width: '100%',
        height: 90
    },
    screenX: document.documentElement.clientWidth,
    screenY: document.documentElement.clientHeight,
    viewBox: new RectByPoint({x: 0, y: 0}, {x: 0, y: 0}, 2)
};

const mutations = {
    resetScreen: (state: StyleManagerState) => {
        state.screenX = document.documentElement.clientWidth;
        state.screenY = document.documentElement.clientHeight;
        commitViewBoxResize();
    },

    resetLeftCard: (state: StyleManagerState, payload: number) => {
        Vue.set(state.leftCard, 'width', payload);
        commitViewBoxResize();
    },

    resetBottomBar: (state: StyleManagerState, payload: number) => {
        Vue.set(state.bottomBar, 'height', payload);
    },
    getViewBox: (state: StyleManagerState) => {
        state.viewBox.start = {x: state.leftCard.width, y: state.toolBar.height};
        state.viewBox.end = {x: state.screenX, y: state.screenY}
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
