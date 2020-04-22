import Vue from 'vue'
import Vuex from 'vuex'
import userInfo from "@/store/modules/userInfo";
import componentSnackBar from "@/store/modules/componentSnackBar";
import dataTextResolveCache from "@/store/modules/dataTextResolveCache";
import styleLabelColor from "@/store/modules/styleLabelColor";
import dataManager from "@/store/modules/dataManager";
import styleComponentSize from "@/store/modules/styleComponentSize";
import userDataManager from "@/store/modules/userDataManager";
import componentState from "@/store/modules/componentState";
import markdown from "@/store/modules/markdown";

Vue.use(Vuex);

export interface RootState {
    state: any,
    mutations: any,
    getters: any,
    actions: any,
    modules: any
}

export default new Vuex.Store({
    state: {},
    mutations: {
    },
    getters: {},
    actions: {},
    modules: {
        userBaseModule: userInfo,
        componentSnackBar: componentSnackBar,
        dataTextResolveCache: dataTextResolveCache,
        dataManager: dataManager,
        styleLabelColor: styleLabelColor,
        styleComponentSize: styleComponentSize,
        userDataManager: userDataManager,
        componentState: componentState,
        markdown: markdown
    }
} as RootState)
