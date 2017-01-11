import io from 'socket.io-client';
import HOST from './host';

const uuid = require('uuid');

class AdminSockIO {
  constructor(stateListener) {
    this.socket = null;
    this.stateListener = stateListener;
    this.tokenPairs = {}

    this._init();
  }

  _init () {
    this.socket = io(HOST);
    this.socket.on('connect',
      data => {
        console.log(`[AdminSockIO]: receive connect`);
      });
    this.socket.on('disconnect',
      () => {
        console.log(`[AdminSockIO]: disconnect`);
      });
    this.socket.on('state',
      (state) => {
        console.log(`[AdminSockIO]: new state:`, state);
        if (this.stateListener) {
          this.stateListener(state);
        }
      });
    this.socket.on('capturePageAck',
      (data) => {
        console.log(`[AdminSockIO]: capturePageAck,`, data);
        const tokenPair = this.tokenPairs[data.token]
        if (tokenPair) {
          delete this.tokenPairs[data.token]
          delete data['token']
          tokenPair.callback(null, data)
        }

      });
  }

  ioCmdToGroup (toGroup, data) {
    console.log(`[AdminSockIO] ioCmd to group ${toGroup}: `, data);
    this.socket.emit('admin/ioCmdToGroup', {toGroup, data});
  }
  ioCmdToSocket (toSocket, data) {
    console.log(`[AdminSockIO] ioCmd to socket ${toSocket}: `, data);
    this.socket.emit('admin/ioCmdToSocket', {toSocket, data});
  }
  capturePage (toSocket, callback) {
    console.log(`[AdminSockIO] capturePage `, toSocket);
    const token = uuid.v1()
    this.tokenPairs[token] = {toSocket, callback}
    this.socket.emit('admin/capturePage', {toSocket, token});
  }
}

export default AdminSockIO