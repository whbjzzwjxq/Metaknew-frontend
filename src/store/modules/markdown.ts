import {MarkdownInputState} from "@/components/markdown/_markdownInterface";

interface MarkdownState {
    currentMarkdown: MarkdownInputState
}

const state = {
    currentMarkdown: {} as MarkdownInputState
} as MarkdownState;

const mutations = {
    updateMarkdownState(state: MarkdownState, payload: MarkdownInputState) {
        state.currentMarkdown = payload
    },

    clearMarkdownState(state: MarkdownState) {
        state.currentMarkdown = {
            dom: undefined,
            editMode: false
        }
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
