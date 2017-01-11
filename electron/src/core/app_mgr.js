import {DEV_MODE, APP2CORE_EVTS} from 'common/const'

import {AppBroker, EVTS as AppBrokerEvts} from 'common/message'

import {mix} from 'mixwith'

const events = require("events")

const _ = require('lodash');

import {remote} from 'electron'

import {AppVersionMixin} from './app_version_mixin'

// App Event
import {EVTS} from './app_evts'
// App Status
import {ST_STOPPED, ST_STARTING, ST_RUNNING, ST_STOPPING} from './app_evts'

export default class AppMgr extends mix(events.EventEmitter)
  .with(AppVersionMixin) {

  static EVT_APP_CLOSED = 'EVT_APP_CLOSED'

  constructor (config, backendAgent) {
    super()

    this.config = config
    this.backendAgent = backendAgent

    console.log('[AppMgr] constructor')

    // currently we manage only one active app
    // this.activeAppId = null

    // reference to app BrowserWindow
    this.appStatus = ST_STOPPED
    this.appBrowserWindow = null

    this._bindEvt()
    this._setupAppBroker()
  }

  // electron related API
  get browserWindow () {
    return remote.getCurrentWindow()
  }

  get runingAppMeta () {
    if (this.appRuning) {
      return this.appBrowserWindow.appId
    }
    return null
  }

  // app runing status
  get appRuning () {
    return (this.appStatus === ST_RUNNING)
  }

  get appStartingOrStopping () {
    return (this.appStatus === ST_STARTING || this.appStatus === ST_STOPPING)
  }

  startApp (appId) {
    if (this.appStatus !== ST_STOPPED) {
      // stop app before start!
      return
    }

    if (!appId) {
      // start default app: read app from config file
      appId = this.config.appId
    }

    // find this appId
    const appMeta = this._findAppMetaById(appId)
    if (appMeta) {
      console.log('[AppMgr] starting App', appMeta, appId)
      this._changeAppStatus(ST_STARTING)

      this._openAppByUrl(appMeta.url, appMeta.windowOpts
        , (win) => {
          console.log('[AppMgr]  start app successfully', win)

          win.on('closed', () => {
            this._changeAppStatus(ST_STOPPED)
          })

          this._changeAppStatus(ST_RUNNING, win, appId)

        })
    }
  }

  closeApp () {
    if (this.appRuning) {
      this._changeAppStatus(ST_STOPPING)
      return
    }
  }

  // maybe called when receive cmd from remote-server
  sendCmdToApp (msg, opts) {
    console.log('[AppMgr] sendCmdToApp')
    if (this.appRuning) {
      this.appBroker.cmd2app(msg, opts)
    }
  }

  // util api
  toggleAppDebugPanel () {
    if (this.appRuning) {
      if (this.appBrowserWindow.isVisible()) {
        this.appBrowserWindow.hide ()
        this.appBrowserWindow.webContents.closeDevTools()
      } else {
        this.appBrowserWindow.show ()
        this.appBrowserWindow.webContents.openDevTools()
      }
    }
  }

  _bindEvt () {
    window.onbeforeunload = (event) => {
      console.log('[AppMgr] onbeforeunload evt')
      this.closeApp()
    }
  }

  _setupAppBroker () {
    const self = this
    this.appBroker = new AppBroker(this)
    this.appBroker.on(AppBrokerEvts.MSG_TO_CORE,
      (msg, opts) => {
        console.log('[AppMgr] EVT_MSG_FROM_APP: ', msg, opts)
        if (msg === APP2CORE_EVTS.BACKEND) {
          // report app info to backendAgent
          const appInfo = opts
          this.backendAgent.updateAppInfo(appInfo)
        }
        if (msg === APP2CORE_EVTS.CORE) {
          // report app info to backendAgent
          const appInfo = opts
          this.emit(EVTS.APP_ACTIVEURL_CHANGED, appInfo)
        }

      })
  }

  _openAppByUrl (url, options, callback) {
    console.log('[AppMgr] _penAppByUrl:', url)

    options.show = DEV_MODE

    const win = new remote.BrowserWindow(options)
    win.loadURL(url)
    win.webContents
    .once('dom-ready', () => {

    })
    .once('did-fail-load', (evt, errorCode, errorDescription, validatedURL) => {
      console.log('win did-fail-load:', errorCode, errorDescription, errorDescription, validatedURL)
      if (win.isDestroyed()) {
        return
      }
      let errorMsg = `data:text/html,<p>Failed to load ${_url}! error: ${errorDescription} </p>`
      win.loadURL(errorMsg)
    })

    callback(win)
  }

  _changeAppStatus(newStatus, win, appId) {
    if (this.appStatus === newStatus) {
      return
    }
    if (ST_RUNNING === newStatus) {
      this.appBrowserWindow = win
      win.appId = appId
    }
    if (ST_STOPPED === newStatus) {
      this.appBrowserWindow = null
    }
    if (ST_STOPPING === newStatus) {
      this.appBrowserWindow.close()
    }

    console.log(`[AppMgr] appStatus change ${this.appStatus} --> ${newStatus}`)
    this.appStatus = newStatus
    this.emit(EVTS.APP_STATUS_CHANGED, this.appStatus)
  }
}
