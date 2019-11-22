const state = {
  toolBarHeight: 48,
  leftBarWidth: 60,
  leftBarFullWidth: 300,
  leftBarFullHeight: document.documentElement.clientHeight * 0.90,
  screenX: document.documentElement.clientWidth,
  screenY: document.documentElement.clientHeight,
  totalCardWidth: 420,
  bottomBarHeight: 48
};

const mutations = {
  resetMainWindow: (state) => {
    state.screenX = document.documentElement.clientWidth;
    state.screenY = document.documentElement.clientHeight;
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
