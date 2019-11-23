interface componentSize {
  width: number | string,
  height: number | string,
  [propName: string]: number | string
}

interface LeftCard extends componentSize {
  width: number
}

interface BottomBar extends componentSize {
  height: number
}

interface State {
  screenX: number,
  screenY: number,
  toolBar: componentSize,
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
    return <componentSize>{
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
