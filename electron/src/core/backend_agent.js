const events = require("events")

const uuid = require('node-uuid')
const path = require('path')
const fs = require('fs')
const http = require('follow-redirects').http

const os = require('os')

class BackendAgent extends events.EventEmitter {
  static EVT_CONNECTED = 'EVT_CONNECTED'
  static EVT_DISCONNECTED = 'EVT_DISCONNECTED'
  static EVT_MSG = 'EVT_MSG'
  static EVT_CONNECTING = 'EVT_CONNECTING'

  constructor(server, opts) {
    super()
    this.server = server
    this.group = opts.group;
    this.name = opts.name ? opts.name : 'guest'
    this.reConnectAttempCnt = 0

    if (opts.autoConnect) {
      this.connect(server);
    }
  }

  connect (_server) {
    this.resetSocket()

    this.server = _server ? _server : this.server
    this.socket = io(this.server);

    console.log('[BackendAgent] try connect:', this.server)

    this.emit(BackendAgent.EVT_CONNECTING)

    this.socket.on('connect',
      () => {
        console.log(`[BackendAgent] receive connect`);
        this.socket.emit('registerCmd', this.group, this.name);
        this.emit(BackendAgent.EVT_CONNECTED)
      });

    this.socket.on('reconnect_attempt', () => {
        console.log(`[BackendAgent] reconnect_attempt`);
        this.reConnectAttempCnt++
        if (this.reConnectAttempCnt > 1) {
          this.emit(BackendAgent.EVT_DISCONNECTED)
        }
      });

    this.socket.on('msg', (msg) => {
      // body...
      console.log(`[BackendAgent] receive cmd: ${msg.to}  ${msg.cmd}`);
      this.emit(BackendAgent.EVT_MSG, msg)
    });
  }

  connectToGroup (_group) {
    if (this.group === _group) {
      return
    }

    this.group = _group
    this.connect(this.server)
  }

  updateAppInfo (appInfo) {
    this.socket.emit('core/appInfo', appInfo);
  }
  updateDeviceInfo (deviceInfo) {
    this.socket.emit('core/deviceInfo', deviceInfo);
  }
  updateCoreInfo (coreInfo) {
    this.socket.emit('core/coreInfo', coreInfo);
  }

  fetchZipFiles (app, version, callback) {
    console.log('fetchZipFiles:', app, version)
    var tmpDir = os.tmpdir()

    const tmpFile = path.join(tmpDir, (uuid.v1()+'.zip'))
    const fileUrl = version ? `${this.server}/webapps/?app=${app}&version=${version}`
          :`${this.server}/webapps/?app=${app}`


    var wstream = fs.createWriteStream(tmpFile);
    wstream.on('open', function(fd){
      http.get(fileUrl, function (res) {
        res.on('data', function (_buffer) {
          wstream.write(_buffer)
        }).on('end', function(){
          wstream.on('finish', function() {
            wstream.close(callback.bind(null,tmpFile));
          });
          wstream.end()
        })
      }).on('error', function (err) {
        console.error(err);
        fs.unlink(tmpFile);//Delete the file
        callback(null)
      });
    })

    console.log('tmpFile:', fileUrl, tmpFile)
  }

  fetchCoreFiles (callback) {
    console.log('fetchCoreFiles')
    var tmpDir = os.tmpdir()

    const tmpFile = path.join(tmpDir, (uuid.v1()+'.js'))
    const fileUrl = `${this.server}/webapps/static/core.js`

    var wstream = fs.createWriteStream(tmpFile);
    wstream.on('open', function(fd){
      http.get(fileUrl, function (res) {
        res.on('data', function (_buffer) {
          wstream.write(_buffer)
        }).on('end', function(){
          wstream.on('finish', function() {
            wstream.close(callback.bind(null,tmpFile));
          });
          wstream.end()
        })
      }).on('error', function (err) {
        console.error(err);
        fs.unlink(tmpFile);//Delete the file
        callback(null)
      });
    })

    console.log('tmpFile:', fileUrl, tmpFile)
  }

  resetSocket () {
    console.log('[BackendAgent] reset socket')
    if (this.socket) {
      this.socket.removeAllListeners()
      this.socket.io.disconnect()
      this.socket = null
      this.reConnectAttempCnt = 0
    }
  }
}

export default BackendAgent
