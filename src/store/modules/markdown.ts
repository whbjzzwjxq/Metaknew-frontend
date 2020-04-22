import {MarkdownInputState} from "@/components/markdown/_markdownInterface";

interface MarkdownState {
    currentMarkdown: MarkdownInputState
}

const state = {
    currentMarkdown: {} as MarkdownInputState
} as MarkdownState;

const mutations = {
    markdownUpdate(state: MarkdownState, payload: MarkdownInputState) {
        state.currentMarkdown = payload
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
