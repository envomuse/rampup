import {fromJS, Map} from 'immutable'

import * as atConst from '../constants/actionTypes'

const initialState = fromJS({
  groups : [
    // {
    //   id: 0,
    //   name: 'Dec1',
    //   sockets: [1]
    // }
    ],

  sockets: [
    // object: see clientConnected for detail properties
  ]
});

function clientConnected (state, action) {
  console.log('[REDUCER]: clientConnected');
  const {socketId, role, username} = action;
  let socketInfo = {
    id: socketId,
    name: username,
    groupId: null,
    role,

    app: {
      urls: [],
      activeUrl: null,
      running: false
    },
    device: {
      ip: null,
      mac: null,
      resolution: {
        width: 1400,
        height: 1050
      }
    },
    core: {
      appShellRuning: false,
      version: '',
      appId: '',
      appVersion: '',
    }
  }

  return state.updateIn(['sockets'], sockets => sockets.push(Map(socketInfo)));
}

function clientDisconnected (state, action) {
  const {socketId} = action;
  console.log('[REDUCER]: clientDisconnected', action.socketId);

  let tgtIdx = state.get('sockets').findIndex(socket => socket.get('id') === socketId);
  let groupId = state.getIn(['sockets', tgtIdx, 'groupId']);
  if (groupId) {
    console.log('[REDUCER]: remove from group', state);
    // remove from group.sockets
    let tgtGrpIdx = state.get('groups').findIndex(group => group.get('id') === groupId);
    let socketIdxInGroup = state.getIn(['groups', tgtGrpIdx, 'sockets']).findIndex(_socketId => _socketId === socketId);
    state = state.updateIn(['groups', tgtGrpIdx, 'sockets'], sockets => sockets.delete(socketIdxInGroup));
  };

  return state.updateIn(['sockets'], sockets =>  sockets.delete(tgtIdx));
}

function clientJoined (state, action) {
  console.log('[REDUCER]: clientJoined', action.socketId, action.nickName);
  const {socketId, groupId, nickName} = action;
  let tgtSocketIdx = state.get('sockets').findIndex(socket => socket.get('id') === socketId);
  state = state.updateIn(['sockets', tgtSocketIdx, 'groupId'], () => groupId);
  if (nickName) {
    let tgtIdx = state.get('sockets').findIndex(socket => socket.get('id') === socketId);
    state = state.updateIn(['sockets', tgtIdx, 'name'], () => nickName);
  }
  let tgtGrpIdx = state.get('groups').findIndex(group => group.get('id') === groupId);
  if (tgtGrpIdx < 0) {
    // Create new group
    let newGroup = fromJS({
      id: groupId,
      type: groupId.indexOf('dev') < 0 ? atConst.GROUP_TYPE_ONEBOSS: atConst.GROUP_TYPE_CHATANY,
      name: groupId,
      boss: null,
      sockets: [socketId]
    });
    console.log('[REDUCER]: clientJoined add new group');
    return state.updateIn(['groups'], groups => groups.push(newGroup));
  } else {
    console.log('[REDUCER]: clientJoined update group.sockets');
    return state.updateIn(['groups', tgtGrpIdx, 'sockets'], sockets => sockets.push(socketId));
  }
}

function clientUpdateAppInfo(state, action) {
  console.log('[REDUCER]:  clientUpdateAppInfo', action)
  const {socketId, appInfo} = action;
  let tgtSocketIdx = state.get('sockets').findIndex(socket => socket.get('id') === socketId);
  return state.updateIn(['sockets', tgtSocketIdx, 'app'], () => appInfo)
}
function clientUpdateDeviceInfo(state, action) {
  console.log('[REDUCER]:  clientUpdateDeviceInfo', action)
  const {socketId, deviceInfo} = action;
  let tgtSocketIdx = state.get('sockets').findIndex(socket => socket.get('id') === socketId);
  return state.updateIn(['sockets', tgtSocketIdx, 'device'], () => deviceInfo)
}
function clientUpdateCoreInfo(state, action) {
  console.log('[REDUCER]:  clientUpdateCoreInfo', action)
  const {socketId, coreInfo} = action;
  let tgtSocketIdx = state.get('sockets').findIndex(socket => socket.get('id') === socketId);
  return state.updateIn(['sockets', tgtSocketIdx, 'core'], () => coreInfo)
}

function rootReducer(state = initialState, action) {
  console.log('[REDUCER]: rootReducer action type', action.type);
  switch (action.type) {
  case atConst.CLIENT_CONNECTTED:
    return clientConnected(state, action);

  case atConst.CLIENT_DISCONNECTTED:
    return clientDisconnected(state, action);

  case atConst.CLIENT_JOIN:
    return clientJoined(state, action);

  case atConst.CLIENT_APPINFO_UPDATE:
    return clientUpdateAppInfo(state, action);
  case atConst.CLIENT_DEVICEINFO_UPDATE:
    return clientUpdateDeviceInfo(state, action);
  case atConst.CLIENT_COREINFO_UPDATE:
    return clientUpdateCoreInfo(state, action);

  default:
    return state
  }
}

export default rootReducer
