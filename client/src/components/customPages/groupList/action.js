import * as GAT from 'constants/actionTypes'
import * as AT from './const'

export function adminIOCmdGroupMsg(groupId, cmd) {
  return {type: GAT.GLOBAL_ADM_CMD_GROUP_MSG, groupId, cmd}
}