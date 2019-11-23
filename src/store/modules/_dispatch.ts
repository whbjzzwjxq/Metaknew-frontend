import store from '../index';

export const dispatchNodeQuery = (payload) => {
  return store.dispatch('nodeQuery', payload)
};
