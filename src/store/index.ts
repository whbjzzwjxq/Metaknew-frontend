import Vue from 'vue'
import Vuex from 'vuex'
import userInfo from "@/store/modules/userInfo";
import componentSnackBar from "@/store/modules/componentSnackBar";
import dataTextResolveCache from "@/store/modules/dataTextResolveCache";
import styleLabelColor from "@/store/modules/styleLabelColor";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  getters: {},
  actions: {},
  modules: {
    userInfo: userInfo,
    componentSnackBar: componentSnackBar,
    dataTextResolveCache: dataTextResolveCache,
    styleLabelColor: styleLabelColor
  }
})
