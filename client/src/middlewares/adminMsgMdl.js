import * as GAT from '../constants/actionTypes'

export default store => next => action => {
  if (action.type === GAT.GLOBAL_ADM_CMD_GROUP_MSG) {
    let {groupId, cmd} = action;
    // send msg to group
    console.log('[AdminMsgMiddleware] send msg to group', groupId, cmd);
    let ioPackageInst = window.ioPackage ? window.ioPackage.getInstance() : null
    if (ioPackageInst) {
      ioPackageInst.ioCmdToGroup(groupId, cmd);
    }
  }
  if (action.type === GAT.GLOBAL_ADM_CMD_SOCKET_MSG) {
    let {socketId, cmd} = action;
    console.log('[AdminMsgMiddleware] send msg to socket', socketId, cmd);
    let ioPackageInst = window.ioPackage ? window.ioPackage.getInstance() : null
    if (ioPackageInst) {
      ioPackageInst.ioCmdToSocket(socketId, cmd);
    }
  }

  return next(action);
}
