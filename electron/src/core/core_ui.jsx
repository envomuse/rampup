'use strict';

import React from 'react'
import ReactDOM from 'react-dom'
import {remote} from 'electron'
import {EVTS as APP_MGR_EVTS} from './app_evts'
import BackendAgent from './backend_agent'
import {EVT_DEVICE_CHANGE} from './device'
import {EVT_CONFIG_CHANGE} from './config'

const fs = require('fs-extra')
const path = require('path')

export default class CoreUI extends React.Component {
  constructor(props) {
    super(props);

    this.appMgr = this.props.appMgr
    this.device = this.props.device
    this.backendAgent = this.props.backendAgent
    this.config = this.appMgr.config

    this.state = {
      appShellReady: false,

      server: this.backendAgent.server,
      connectStatus: 'DISCONNECTED', // enum {DISCONNECTED, CONNECTING, CONNECTED}
      activeUrl: ''
    }

    // login form
    this.handleServerNameChange = (e) => {
      this.setState({
        server: e.target.value
      })
    }
    this.connectServer = () => {
      this.backendAgent.connect(this.state.server)
    }

    //
    this.onDisconnect = () => {
      this.backendAgent.resetSocket()
      this.setState({
        connectStatus: 'DISCONNECTED'
      })
    }

    this.onFocusInput = () => {
      window.disableTest = true
    }

    this.onBlurInput = () => {
      window.disableTest = false
    }

    this.handleShortcuts = () => {}

    this.app = null
  }

  componentDidMount() {
    console.log('[CoreUI]: componentDidMount')
    this.setupBackendAgentEvent()
    this.setupAppMgrEvent ()
    this.setupDeviceEvent ()
    this.setupConfigEvent ()

    this.backendAgent.connect ()
    // this.appMgr.startApp()
  }
  componentWillUnmount() {
    console.log('[CoreUI]: componentWillUnmount.')
    this.backendAgent.resetSocket()

    // remove all events
    this.backendAgent.removeAllListeners()
    this.device.removeAllListeners()
    this.appMgr.removeAllListeners()
    this.config.removeAllListeners()
  }

  setupConfigEvent () {
    this.config.on(EVT_CONFIG_CHANGE, (fields) => {
      if (fields.indexOf('group') >= 0) {
        // group change: reset ws connection
        this.backendAgent.connectToGroup(this.config.group)
        return
      }

      this.reportCoreInfo()
    })
  }

  setupDeviceEvent () {
    this.device.on(EVT_DEVICE_CHANGE, () => {
      this.reportDeviceInfo()
    })
  }

  setupBackendAgentEvent () {
    this.backendAgent
    .on(BackendAgent.EVT_CONNECTED,
      ()=> {
        // store this server address to config.json
        this.config.server = this.state.server

        this.doStatistic()

        this.setState({
          connectStatus: 'CONNECTED'
        })
      })
    .on(BackendAgent.EVT_CONNECTING,
      ()=> {
        this.setState({
          connectStatus: 'CONNECTING'
        })
      })
    .on(BackendAgent.EVT_DISCONNECTED,
      ()=> {
        this.setState({
          connectStatus: 'DISCONNECTED'
        })
      })
    .on(BackendAgent.EVT_MSG,
      (msg)=> {
        if (msg.to === 'core') {
          if (msg.cmd === 'upgradeApp') {
            const newApp = (msg.opts && msg.opts.app) ? msg.opts.app : 'default'
            const newVer = (msg.opts && msg.opts.version) ? msg.opts.version : null
            this.appMgr.upgradeApp(newApp, newVer)
          }
          if (msg.cmd === 'openApp') {
            this.appMgr.startApp ()
          }
          if (msg.cmd === 'toggleAppDebugPanel') {
            this.appMgr.toggleAppDebugPanel()
          }
          if (msg.cmd === 'closeApp') {
            this.appMgr.closeApp ()
          }
          if (msg.cmd === 'stat') {
            this.doStatistic()
          }
          if (msg.cmd === 'changeGroup') {
            this.config.group = msg.opts.group
          }
          if (msg.cmd === 'upgradeCore') {
            this.upgradeCore ()
          }
        }
        if (msg.to === 'app') {
          // transport msg to app
          this.appMgr.sendCmdToApp(msg.cmd, msg.opts)
        }

      })

  }

  setupAppMgrEvent () {
    this.appMgr.on(APP_MGR_EVTS.APP_STATUS_CHANGED, (appStatus) => {
      console.log('[CoreUI] app status change')
      this.setState({
        appShellReady: this.appMgr.appRuning
      })

      this.reportCoreInfo()
      if (this.appMgr.appRuning) {
        this.requestAppInfo()
      }
    })

    this.appMgr.on(APP_MGR_EVTS.APP_ACTIVEURL_CHANGED, (appInfo) => {
      console.log('[CoreUI] app active url changed')
      this.setState({
        activeUrl: appInfo.activeUrl
      })
    })

    this.appMgr.on(APP_MGR_EVTS.APP_UPGRADE_FINISHED, () => {
      console.log('[CoreUI] app active url changed')
      this.forceUpdate ()
    })
  }

  doStatistic () {
    console.log('[CoreUI] doStatistic')
    this.reportDeviceInfo()
    this.reportCoreInfo()
    this.requestAppInfo()
  }

  requestAppInfo () {
    console.log('[CoreUI] requestAppInfo')
    // collect device info and report to server
    this.appMgr.sendCmdToApp('stat')
  }

  reportDeviceInfo () {
    console.log('[CoreUI] reportDeviceInfo')
    // collect device info and report to server
    const deviceInfo = this.device.getDeviceInfo()
    this.backendAgent.updateDeviceInfo(deviceInfo)
  }

  reportCoreInfo () {
    // collect core info and report to server
    const coreInfo = {
      appShellRuning: this.appMgr.appRuning,
      version: this.config.version,
      group: this.config.group,
      appId: this.config.appId,
      appVersion: this.appMgr.defaultAppVersion,
    }
    this.backendAgent.updateCoreInfo(coreInfo)
  }

  upgradeCore () {
    this.backendAgent.fetchCoreFiles( (tmpFile) => {
      if(tmpFile){
        console.log('[AppMgr] upgradeCore fetchCoreFiles got:', tmpFile)
        const BASE_APP_PATH = remote.app.getAppPath()
        const coreJSPath = path.join(BASE_APP_PATH, 'core.js')

        //remove tmpZipFile async
        fs.move(tmpFile, coreJSPath, {clobber: true}
          , (err) => {
            if (err) return console.error(err)
            console.log('[AppMgr] upgradeCore: success update core.js, will reload core')
            // then reload
            remote.getCurrentWindow().webContents.reloadIgnoringCache()
          })

      } else {
        console.log('[AppMgr] upgradeCore: failed to download upgrade file')
      }
    })
  }


  render () {

    return (
      <div className="core">
        {this.renderConnectInfo()}
        {this.renderCoreInfo()}
        {this.renderAppMeta()}
      </div>
    )
  }

  renderConnectInfo () {
    const connectStatus = this.state.connectStatus
    if (connectStatus === 'CONNECTED') {
      return <div> 成功连接服务器: {this.backendAgent.server}
        <button onClick={this.onDisconnect}>断开连接</button>
      </div>
    }
    if (connectStatus === 'CONNECTING') {
      return <div>
            正在连接服务器: {this.backendAgent.server} ...
            <div onClick = {this.onDisconnect}> 断开连接 </div>
       </div>
    }
    if (connectStatus === 'DISCONNECTED') {
      return (<div>
                无法连接服务器:
                <input type="text" label="服务器地址"
                  value={this.state.server}
                  onFocus={this.onFocusInput}
                  onBlur={this.onBlurInput}
                  onChange={this.handleServerNameChange} />
                <button onClick = {this.connectServer}>连接</button>
              </div>)
    }
  }

  renderAppMeta () {
    const appMeta = this.appMgr.appsMeta[0]
    return (<div>
              <div>---------------------------</div>
              <div> app版本: {this.appMgr.defaultAppVersion} </div>
              <div> app最后升级时间: {this.config.lastUpgradeTime ? this.config.lastUpgradeTime : '无'} </div>
              <div> appId: {appMeta.id} </div>
              <div> app url: {appMeta.url} </div>
              <div> app 状态: {this.state.appShellReady ? '运行中' : '已关闭'} </div>
              <div> app当前打开url: {this.state.activeUrl}</div>
            </div>)
  }

  renderCoreInfo () {
    const deviceInfo = this.device.getDeviceInfo()
    return (
      <div>
        <div>---------------------------</div>
        <div>本机IP: {deviceInfo.ip}</div>
        <div>Core版本: {this.config.version}</div>
        <div>所属Group: {this.config.group}</div>
      </div>
    )
  }
}
