export interface ComponentSize {
  width: number | string,
  height: number | string,
  [propName: string]: number | string
}

interface LeftCard extends ComponentSize {
  width: number
}

interface BottomBar extends ComponentSize {
  height: number
}

export interface ToolBar extends ComponentSize{
  height: number
}

export interface State {
  screenX: number,
  screenY: number,
  toolBar: ToolBar,
  leftCard: LeftCard,
  bottomBar: BottomBar
}

const state: State = {
  toolBar: {
    width: '100%',
    height: 48
  },
  leftCard: {
    width: 420,
    height: '100%'
  },
  bottomBar: {
    width: '100%',
    height: 48
  },
  screenX: document.documentElement.clientWidth,
  screenY: document.documentElement.clientHeight
};

const mutations = {
  resetScreen: (state: State) => {
    state.screenX = document.documentElement.clientWidth;
    state.screenY = document.documentElement.clientHeight;
  }
};
const actions = {};
const getters = {
  viewBox: (state: State) => {
    return <ComponentSize>{
      width: state.screenX - state.leftCard.width,
      height: state.screenY - state.bottomBar.height
    }
  }
};

export default {
  state,
  mutations,
  actions,
  getters
}
