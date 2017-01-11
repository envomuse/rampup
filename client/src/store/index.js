import { createStore, applyMiddleware } from 'redux'
import rootReducer from '../reducers'
import middlewares from '../middlewares'

import {fromJS} from 'immutable'
import {remoteStateChange} from '../actions'

function createAppStore() {
  let initState = {};
  if (window.__INITIAL_STATE__) {
    initState['user'] = fromJS(window.__INITIAL_STATE__.user);
    initState['data'] = {
      'chatGroups': fromJS({
        groups: [],
        adminSockets: [],
        sockets: []
      }),
      // 'webapps': fromJS(window.__INITIAL_STATE__.webapps)
    }
    console.log('__INITIAL_STATE__:', __INITIAL_STATE__);

    setTimeout(()=> {
      store.dispatch(remoteStateChange(window.__INITIAL_STATE__.state));
    }, 0)
  }

  const createStoreWithMiddleware = applyMiddleware (
      ...middlewares
  )(createStore);

  const store = createStoreWithMiddleware(rootReducer, initState);

  store.subscribe(function() {
    console.log('[STORE change]: ', store.getState())
  })
  return store;
}

const store = createAppStore();

export default store;