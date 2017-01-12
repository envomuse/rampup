import { combineReducers } from 'redux'
import chatGroups from './chatGroups'
// import webapps from './webapps'

const dataReducer = combineReducers({
  chatGroups
})

export default dataReducer