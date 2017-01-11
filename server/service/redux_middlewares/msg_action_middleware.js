import {CLIENT_JOIN, CLIENT_CONNECTTED, CLIENT_DISCONNECTTED,
CLIENT_ADM_CMD_TO_SOCKET_MSG, CLIENT_ADM_CMD_TO_GROUP_MSG} from '../constants/actionTypes'
import {ROLE_ADMIN, IO_GROUP_ADMIN} from '../../const'

var merge = require('merge')

let registedIORoute = {
  // groupId: {
  //  routeFn,
  //  meta
  // }
  //
};

export default app => store => next => action => {
  console.log('[MsgActionMiddleware]:', action.type);

  const ns = app.io.of('');
  let {rawSocket, socketId, groupId, username} = action;

  if (action.type === CLIENT_JOIN) {
    if (IO_GROUP_ADMIN === groupId) {
      // NOT ALLOW TO JOIN IO_GROUP_ADMIN
      return;
    }
    // Add groupId to app.io if not exist
    if (!(groupId in registedIORoute)) {
      let groupMsgRouteFn = function* (next, info) {
        console.log(`[MsgActionMiddleware MSG] [${groupId}]`, info);
        let {type, data, deltaMeta, extraInfo} = info;
        if (type === 'msg') {
          // Check group type to decide whether the msg is from the boss
          this.to(groupId).emit('msg', data);
        }
        if (type === 'meta') {
          // Update group meta
          let original = registedIORoute[groupId].meta
          let updatedMeta = deltaMeta === null ? null : merge.recursive(true, original, deltaMeta)
          registedIORoute[groupId].meta = updatedMeta
          // Broadcast updated meta info inside group
          this.to(groupId).emit('meta', {
            updatedMeta,
            extraInfo
          });
        }
      }

      app.io.route(groupId, groupMsgRouteFn);
      registedIORoute[groupId] = {
        routeFn:groupMsgRouteFn,
        meta: {}
      };
    }

    // Leverage ns.room feature to broadcast msg inner a group
    // the benefit is we don't need to manage leaving socket,
    // and delegate the function to socket.io's ns and room
    rawSocket.join(groupId, () => {
      process.nextTick(()=> {
        // Send back group Info to this rawSocket
        let groupInfo = store.getState().get('groups').find(group => group.get('id') === groupId);

        // Find other sockets info
        let storeSockets = store.getState().get('sockets');
        // console.log('storeSockets:', storeSockets);
        if (groupInfo) {
          let socketsInfo = groupInfo.get('sockets').map(_socket =>
            storeSockets.find(socketInStore => socketInStore.get('id') === _socket))

          // add group meta info
          let meta = registedIORoute[groupId].meta
          rawSocket.emit('groupInfo', {groupInfo, socketsInfo, meta});
        } else {
          rawSocket.emit('groupInfo', null);
        }

        // Notify group member that somebody is join in
        let socketInfo = storeSockets.find(_socket => _socket.get('id') === socketId);
        rawSocket.to(groupId).emit('join', socketInfo);

      });

    });



  }

  if (action.type === CLIENT_DISCONNECTTED) {
    // broadcast to current group that somebody is left
    const state = store.getState();
    let socketInfo = state.get('sockets').find(socket => socket.get('id') === socketId);
    if (socketInfo) {
      groupId = socketInfo.get('groupId');
      if (groupId) {
        console.log(`[MsgActionMiddleware Member Left] [${groupId}] ${socketInfo.get('name')}`);
        rawSocket.to(groupId).emit('left', {socketId});
      }

    }

  }

  if (action.type === CLIENT_CONNECTTED) {
    // add ADMIN USER to IO_GROUP_ADMIN
    let {role} = action;
    console.log('[MsgActionMiddleware] add ADMIN USER to IO_GROUP_ADMIN role', role);
    if (role === ROLE_ADMIN) {
      // console.log('[MsgActionMiddleware] ns.connected:', ns.connected)
      //workAround: we need to pass rawSocket here,
      // as socket have not been added to ns.connected yet
      rawSocket.join(IO_GROUP_ADMIN);

      process.nextTick(()=> rawSocket.emit('state', store.getState()) );

    }
  }

  if (action.type === CLIENT_ADM_CMD_TO_GROUP_MSG) {
    // send msg to group
    console.log('[MsgActionMiddleware] send msg to group', groupId);
    app.io.to(groupId).emit('msg', action.msg);
  }
  if (action.type === CLIENT_ADM_CMD_TO_SOCKET_MSG) {
    // send msg to socket
    const toSocket = action.toSocket
    console.log('[MsgActionMiddleware] send msg to toSocket', toSocket, action.msg);
    // TBC: get some method to find toSocket
    app.io.to(toSocket).emit('msg', action.msg);
  }

  return next(action);
}
