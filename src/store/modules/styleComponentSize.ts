import Vue from 'vue'
import {RectByPoint} from "@/class/geometric";
import {commitBottomDynamicBarResize, commitViewBoxResize} from "@/store/modules/_mutations";
export const leftCardPadding = 4;
export const bottomDynamicBarHeight = 360;
declare global {
    interface StyleManagerState {
        screenX: number,
        screenY: number,
        toolBar: ToolBar,
        leftCard: LeftCard,
        bottomBar: BottomBar,
        noteBook: NoteBook
        bottomDynamicBar: RectByPoint,
        viewBox: RectByPoint,
    }

    interface ComponentSize {
        width: number | string,
        height: number | string,

        [propName: string]: number | string
    }
}

interface LeftCard extends ComponentSize {
    width: number
    height: number
}

interface BottomBar extends ComponentSize {
    width: string
    height: number,
}

export interface ToolBar extends ComponentSize {
    width: string
    height: number,
}

interface NoteBook extends ComponentSize {
    width: number,
    height: number
}

const state: StyleManagerState = {
    toolBar: {
        width: '100%',
        height: 48
    },
    leftCard: {
        width: 400 + leftCardPadding, // 4px的边距
        height: document.documentElement.clientHeight - 48
    },
    bottomBar: {
        width: '100%',
        height: 108
    },
    noteBook: {
        width: 520,
        height: 720,
    },
    bottomDynamicBar: new RectByPoint({x: 0, y: document.documentElement.clientHeight - bottomDynamicBarHeight}, {x: 0, y: 0}, 0),
    screenX: document.documentElement.clientWidth,
    screenY: document.documentElement.clientHeight,
    viewBox: new RectByPoint({x: 0, y: 0}, {x: 0, y: 0}, 2),
};

const mutations = {
    resetScreen: (state: StyleManagerState) => {
        state.screenX = document.documentElement.clientWidth;
        state.screenY = document.documentElement.clientHeight;
        state.leftCard.height = document.documentElement.clientHeight - 48;
        commitViewBoxResize();
        commitBottomDynamicBarResize();
    },

    resetLeftCard: (state: StyleManagerState, payload: number) => {
        Vue.set(state.leftCard, 'width', payload);
    },

    resetBottomBar: (state: StyleManagerState, payload: number) => {
        Vue.set(state.bottomBar, 'height', payload);
    },

    getViewBox: (state: StyleManagerState) => {
        // 计算ViewBox
        state.viewBox.start.update({x: state.leftCard.width, y: state.toolBar.height});
        state.viewBox.end.update({x: state.screenX, y: state.screenY - state.bottomBar.height})
    },

    getBottomDynamicBar: (state: StyleManagerState, payload?: number) => {
        if (payload) {
            payload <= (state.toolBar.height + 4) && (payload = state.toolBar.height + 4); // 最高
            payload >= state.screenY - bottomDynamicBarHeight && (payload = state.screenY - bottomDynamicBarHeight); // 最矮
        } else {
            (payload = state.screenY - bottomDynamicBarHeight) // doNothing
        }
        state.bottomDynamicBar.start.update({x: state.leftCard.width, y: payload});
        state.bottomDynamicBar.end.update({x: state.screenX, y: state.screenY})
    }

};
const actions = {};
const getters = {
    noteBookMarkDown: function (state: StyleManagerState): AreaRect {
        return {
            x: state.leftCard.width + 64 + state.noteBook.width,
            y: state.screenY - state.bottomBar.height - state.noteBook.height,
            width: state.noteBook.width,
            height: state.noteBook.height
        }
    }
};

export default {
    state,
    mutations,
    actions,
    getters
}
