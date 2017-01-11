import {REMOTE_STATE_CHANGE} from 'constants/actionTypes'

import * as GAT from 'constants/actionTypes'

import * as groupList from 'groupList/action'
import * as socket_detail from 'socket_detail/action'

export function remoteStateChange(newState) {
  console.log('[ACTIONS] remoteStateChange:', newState);
  return { type: REMOTE_STATE_CHANGE, newState }
}

export function adminIOCmdSocketMsg(socketId, cmd) {
  return {type: GAT.GLOBAL_ADM_CMD_SOCKET_MSG, socketId, cmd}
}

export function updatePreferenceAsync (field, value, merge = true) {
  return (dispatch) => {
    return fetch('/api/setPreference', {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        field,
        value,
        merge
      })
    }).then(() => {
      dispatch({
        type: GAT.GLOBAL_USER_SET_PREFERENCE,
        field,
        value,
        merge
      })
    })
  }
}

export const pageActions = {
  groupList,
  socket_detail
}