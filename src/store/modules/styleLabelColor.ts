import {darkColorScaleSet, randomIntegerInRange} from '@/utils/utils'
import Vue from 'vue'

export type labelColorState = Record<string, string>

const state: labelColorState = {
    "todo": "todo",
    "review": "success",
    "draft": "secondary",
    "important": "#ea75a7"
};

const mutations = {
    addLabelColor(state: labelColorState, labels: Array<string>) {
        labels.filter(label => !state[label]).map(label => {
            let newColor = darkColorScaleSet[randomIntegerInRange(0, 8)];
            Vue.set(state, label, newColor);
        });
    }
};

const getters = {
    currentLabels: (state: labelColorState) => {
        return Object.keys(state)
    }
};

const actions = {};

export default {
    state,
    mutations,
    getters,
    actions
}
