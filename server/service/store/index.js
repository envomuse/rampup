import { createStore, applyMiddleware } from 'redux'
import rootReducer from '../reducers'
import msgActionMdl from '../redux_middlewares/msg_action_middleware'

function createAppStore(app) {
  const createStoreWithMiddleware = applyMiddleware (
    msgActionMdl(app)
  )(createStore);

  const store = createStoreWithMiddleware(rootReducer);
  app.store = store;

  return store;
}

module.exports = createAppStore;