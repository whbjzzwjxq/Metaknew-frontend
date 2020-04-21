import Vue from 'vue'
import {RectByPoint} from "@/class/geometric";
import {commitBottomDynamicBarResize, commitViewBoxResize} from "@/store/modules/_mutations";
export const leftCardPadding = 4;
export const leftCardWidth = 360;
export const bottomDynamicBarHeight = 360;
declare global {
    interface StyleManagerState {
        screenX: number,
        screenY: number,
        toolBar: ToolBar,
        leftCard: LeftCard,
        bottomBar: BottomBar,
        noteBook: NoteBookSize
        bottomDynamicBar: RectByPoint,
        viewBox: RectByPoint, // 指的是全部的ViewBox 也就是去除左边card的内容
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

interface NoteBookSize extends ComponentSize {
    width: number,
    height: number
}

const state: StyleManagerState = {
    toolBar: {
        width: '100%',
        height: 48
    },
    leftCard: {
        width: leftCardWidth + leftCardPadding, // 4px的边距
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
    bottomDynamicBar: new RectByPoint({x: 0, y: document.documentElement.clientHeight - bottomDynamicBarHeight}, {x: 0, y: 0}),
    screenX: document.documentElement.clientWidth,
    screenY: document.documentElement.clientHeight,
    viewBox: new RectByPoint({x: 0, y: 0}, {x: 0, y: 0}),
};

const mutations = {
    screenRefresh: (state: StyleManagerState) => {
        state.screenX = document.documentElement.clientWidth;
        state.screenY = document.documentElement.clientHeight;
        state.leftCard.height = document.documentElement.clientHeight - state.toolBar.height;
        commitViewBoxResize();
        commitBottomDynamicBarResize();
    },

    bottomBarReset: (state: StyleManagerState, payload: number) => {
        state.bottomBar.height = payload
    },

    viewBoxRefresh: (state: StyleManagerState) => {
        // 计算ViewBox
        state.viewBox.start.update({x: state.leftCard.width, y: state.toolBar.height});
        state.viewBox.end.update({x: state.screenX, y: state.screenY})
    },

    bottomDynamicBarReset: (state: StyleManagerState, payload?: number) => {
        // 改变底部动态Bar的高度
        if (payload !== undefined) {
            payload <= (state.toolBar.height + 4) && (payload = state.toolBar.height + 4); // 最高
            payload >= state.screenY - bottomDynamicBarHeight && (payload = state.screenY - bottomDynamicBarHeight); // 最矮
        } else {
            (payload = state.screenY - bottomDynamicBarHeight as number) // doNothing
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
