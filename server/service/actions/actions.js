import * as action from '../constants/actionTypes'


// Admin Command
export function dismissBoss(groupId) {
  console.log('[REDUX ACTION] dismissBoss:', groupId);
  return { type: action.CLIENT_ADM_FORCE_REL_GRP_CONTROL, groupId }
}

// Client Socket Command
export function clientConnected(socket, role, username) {
  const socketId = socket.id;
  // const clientIp = socket.request.connection.remoteAddress;
  // const userAgent = socket.request.headers['user-agent'];
  // const device = userAgent.indexOf('iPhone') >= 0
  //  ? action.DEVICE_IPHONE :
  //   (userAgent.indexOf('iPad') >= 0
  //     ? action.DEVICE_IPAD
  //     : action.DEVICE_BROWSER);

  console.log('[REDUX ACTION] clientConnected:', socketId, role, username);
  return { type: action.CLIENT_CONNECTTED, socketId, role, username
    , rawSocket: socket}
}

export function clientDisconnected(socket) {
  const socketId = socket.id;

  console.log('[REDUX ACTION] clientDisconnected:', socketId);

  return { rawSocket:socket, type: action.CLIENT_DISCONNECTTED, socketId }
}

export function clientJoin(socket, groupId, nickName='') {
  const socketId = socket.id;
  console.log('[REDUX ACTION] clientJoin:', socketId, groupId);
  return { rawSocket: socket, type: action.CLIENT_JOIN, socketId, groupId, nickName}
}

export function clientLeft(socketId) {
  console.log('[REDUX ACTION] clientLeft:', socketId);
  return { type: action.CLIENT_LEFT, socketId }
}

export function adminCmd2Group(socket, toGroup, msg) {
  console.log('[REDUX ACTION] adminCmd2Group:', toGroup, msg);
  return { type: action.CLIENT_ADM_CMD_TO_GROUP_MSG, rawSocket:socket, groupId:toGroup, msg }
}
export function adminCmd2Socket(toSocket, msg) {
  console.log('[REDUX ACTION] adminCmd2Socket:', toSocket, msg);
  return { type: action.CLIENT_ADM_CMD_TO_SOCKET_MSG, toSocket, msg }
}

// For sic3: update desktop shell application state
export function clientUpdateAppInfo(socket, appInfo) {
  const socketId = socket.id;
  console.log('[REDUX ACTION] clientUpdateAppInfo:', appInfo);
  return { type: action.CLIENT_APPINFO_UPDATE, socketId, appInfo }
}
export function clientUpdateDeviceInfo(socket, deviceInfo) {
  const socketId = socket.id;
  console.log('[REDUX ACTION] clientUpdateDeviceInfo:', deviceInfo);
  return { type: action.CLIENT_DEVICEINFO_UPDATE, socketId, deviceInfo }
}
export function clientUpdateCoreInfo(socket, coreInfo) {
  const socketId = socket.id;
  console.log('[REDUX ACTION] clientUpdateCoreInfo:', coreInfo);
  return { type: action.CLIENT_COREINFO_UPDATE, socketId, coreInfo }
}
