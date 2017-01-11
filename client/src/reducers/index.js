import { combineReducers } from 'redux'
import {routeReducer } from 'redux-simple-router'
import data from './data'
import pageStores from './pages'
import userReducer from './user'
import {fromJS} from 'immutable'

const rootReducer = combineReducers({
  data,
  pageStores,
  routing: routeReducer,
  user: userReducer
})

export default rootReducer