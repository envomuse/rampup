import { combineReducers } from 'redux'
import socket_detail from 'socket_detail/reducer'
import groupList from 'groupList/reducer'

const pagesReducer = combineReducers({
  socket_detail,
  groupList
})

export default pagesReducer