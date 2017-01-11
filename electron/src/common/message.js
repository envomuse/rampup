import {APP2CORE_EVTS} from 'common/const'

import {remote, ipcRenderer} from 'electron'

const events = require("events")

export const EVTS = {
  MSG_TO_CORE : 'EVT_MSG_TO_CORE',
  MSG_TO_APP: 'EVT_MSG_TO_APP',
}


// AppBroker is used by core
export class AppBroker extends events.EventEmitter {
  constructor (appMgr) {
    super()

    this.appMgr = appMgr

    this._setup()
  }

  // this should be called by core only
  cmd2app (msg, opts) {
    if (!this.appMgr.appBrowserWindow) {
      return
    }

    console.log('cmd2app:', msg, opts)
    this.appMgr.appBrowserWindow.webContents.send(EVTS.MSG_TO_APP, {msg, opts})
  }

  _setup () {
    console.log('remote.ipcMain:', remote.ipcMain)
    ipcRenderer.on(EVTS.MSG_TO_CORE, (event, message) => {
      console.log('MSG_TO_CORE')
      // TBD: proxy this message to CORE
      const {msg, opts} = message
      console.log('[recv msg from app]:', msg, opts)

      try {
        this.emit(EVTS.MSG_TO_CORE, msg, opts)
      } catch (e) {
        console.error('error when emit EVT_TO_CORE', e);
      }
    })
  }
}



// CoreBroker is injected into app shell
export class CoreBroker extends events.EventEmitter {
  constructor () {
    super()
    this._msgEvtCb = null

    this._setup()
  }

  get coreBrowserWindow () {
    console.log('get coreBrowserWindow')
    const coreWinID = remote.getGlobal('coreWinID')
    return remote.BrowserWindow.fromId(coreWinID)

    // return remote.getCurrentWindow().getParentWindow()
  }

  msg2core (info) {
    const coreWin = this.coreBrowserWindow
    console.log('msg2core:', coreWin)

    coreWin.webContents.send(EVTS.MSG_TO_CORE, {
      msg: APP2CORE_EVTS.CORE,
      opts: info
    })
  }

  msg2backend (info) {
    // nw.global.appBroker.onMsg (APP2CORE_EVTS.BACKEND, msg)
    const coreWin = this.coreBrowserWindow
    console.log('msg2backend:', coreWin)

    coreWin.webContents.send(EVTS.MSG_TO_CORE, {
      msg: APP2CORE_EVTS.BACKEND,
      opts: info
    })
  }

  onMsgEvt(_callback) {
    this._msgEvtCb = _callback
  }

  _setup () {
    console.log('[CoreBroker] _setup')
    ipcRenderer.on(EVTS.MSG_TO_APP, (event, message) => {
      const {msg, opts} = message
      console.log('[recv msg from core]:', msg, opts)

      try {
        this.emit(EVTS.EVT_MSG_FROM_CORE, msg, opts)

        this._msgEvtCb && this._msgEvtCb(msg, opts)
      } catch (e) {
        console.error('error when emit EVT_MSG_FROM_CORE', e);
      }
    })
  }
}
