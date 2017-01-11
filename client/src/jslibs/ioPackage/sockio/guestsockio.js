import io from 'socket.io-client';
import HOST from './host';

class GuestSockIO {
  constructor(cmd, nickName, groupInfoCB) {
    this.cmd = cmd;
    this.nickName = nickName;
    this.cmdListenQueen = [];
    this.socket = null;
    this.groupInfo = {sockets: []};
    this.groupMeta = {}
    this.socketsInfo = [];
    this.groupInfoCB = groupInfoCB;

    this._init();
  }

  _init () {
    this.socket = io(HOST);

    this.socket.on('connect',
      () => {
        console.log(`[GuestSockIO] receive connect`);
        this.socket.emit('registerCmd', this.cmd, this.nickName);
        this.cmdListenQueen.forEach(cb => cb({type: 'connect'}));
      });

    this.socket.on('disconnect',
      () => {
        console.log(`[GuestSockIO] disconnect`);
        this.cmdListenQueen.forEach(cb => cb({type: 'disconnect'}));
      });

    this.socket.on('reconnect',
      (attempNum) => {
        console.log(`[GuestSockIO] reconnect success`);
      });

    // self defined msg
    this.socket.on('msg', (data) => {
      // body...
      console.log(`[GuestSockIO] receive cmd: ${data}`);

      this.cmdListenQueen.forEach(cb => cb({type: 'msg', data: data}));
    });

    // group meta updated
    this.socket.on('meta', (data) => {
      // body...
      console.log(`[GuestSockIO] receive meta update:`, data);
      const {updatedMeta, extraInfo} = data
      this.groupMeta = updatedMeta

      this.cmdListenQueen.forEach(cb => cb({type: 'meta', updatedMeta, extraInfo}));
    });

    this.socket.on('join', (socketInfo) => {
      // body...
      console.log(`[GuestSockIO] receive join:  ${socketInfo.id} ${socketInfo.name}`);
      // TO BE Continue: update groupInfo and socketsInfo
      this.socketsInfo.push(socketInfo);
      this.groupInfo.sockets.push(socketInfo.id);

      this.cmdListenQueen.forEach(cb => cb({type: 'join', data: socketInfo}));
    });

    this.socket.on('left', (data) => {
      // body...
      console.log(`[GuestSockIO] receive left: ${data.socketId}`);
      // TO BE Continue: update groupInfo and socketsInfo
      const {socketId} = data;
      this.groupInfo.sockets = this.groupInfo.sockets
        .filter(_socketId => _socketId !== socketId);
      this.socketsInfo = this.socketsInfo
        .filter(socketInfo => socketInfo.id !== socketId);

      this.cmdListenQueen.forEach(cb => cb({type: 'left', data: data}));
    });

    this.socket.on('groupInfo', (data) => {
      // body...
      if (data === null) {
        console.log(`[GuestSockIO] receive groupInfo: this is no other member in current group`);
      } else {
        let {groupInfo, socketsInfo, meta} = data;
        this.groupInfo = groupInfo;
        this.socketsInfo = socketsInfo;
        this.groupMeta = meta;

        console.log(`[GuestSockIO] receive groupInfo: ${groupInfo.type}, ${groupInfo.sockets}`);
      }

      if (this.groupInfoCB) {
        var groupInfo = this.getGroupInfo();
        this.groupInfoCB(groupInfo);
      }
    });
  }

  ioRegister (callback) {
    console.log('[GuestSockIO] ioRegister');
    this.cmdListenQueen.push(callback);
  }

  ioUnregister (callback) {
    console.log('[GuestSockIO] ioUnregister');
    var index = this.cmdListenQueen.indexOf(callback);
    if (index >= 0) {
      this.cmdListenQueen.splice(index, 1);
    }
  }

  ioCmd (data) {
    console.log('[GuestSockIO] ioCmd', data);
    const info = {
      type: 'msg',
      data
    }
    this.socket.emit(this.cmd, info);
  }

  // // // // // // // // // // // // // // //
  // For sic3
  // appInfo:
  // {
  //  app: { /* optional */
  //   windowId: null,
  //   url: '',
  //   windowSize: 'maxmize' // ['maxmize', 'minimum', 'normal']
  //  },
  //  device: { /* optional */
  //   ip: '10.12.3.15',
  //   code: 11,
  //   resolution: {
  //     width: 1400,
  //     height: 1050
  //   }
  // }
  updateAppInfo (appInfo) {
    this.socket.emit(this.cmd, appInfo);
  }

  updateGroupMeta (deltaMeta, extraInfo) {
    console.log('[GuestSockIO] updateMeta', deltaMeta, extraInfo);
    const info = {
      type: 'meta',
      deltaMeta,
      extraInfo
    }
    this.socket.emit('updateAppInfo', info);
  }

  getGroupInfo () {
    var socketsDict = {};
    this.socketsInfo.forEach(_socketInfo => socketsDict[_socketInfo.id] = _socketInfo);
    var memberInfo = this.groupInfo.sockets.map(_socketId => socketsDict[_socketId]);

    return {
      id: this.groupInfo.id,
      memberInfo: memberInfo,
      meta: this.groupMeta
    };
  }

}

export default GuestSockIO