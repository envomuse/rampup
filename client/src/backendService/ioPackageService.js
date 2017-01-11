import store from '../store'
import {remoteStateChange} from '../actions'

const user = store.getState().user;
if (window.ioPackage && user) {
  ioPackage.login(newState =>
    store.dispatch(remoteStateChange(newState)));
}