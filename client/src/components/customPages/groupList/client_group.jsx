import React from 'react'

import Panel from 'react-bootstrap/lib/Panel'
import Table from 'react-bootstrap/lib/Table'
import Modal from 'react-bootstrap/lib/Modal'
import Button from 'react-bootstrap/lib/Button'
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar'
import SplitButton from 'react-bootstrap/lib/SplitButton'
import MenuItem from 'react-bootstrap/lib/MenuItem'
import {Link} from 'react-router'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import DropdownButton from 'react-bootstrap/lib/DropdownButton'
import InputGroup from 'react-bootstrap/lib/InputGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import Col from 'react-bootstrap/lib/Col'
import ListGroup from 'react-bootstrap/lib/ListGroup'
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem'
import Badge from 'react-bootstrap/lib/Badge'
import Label from 'react-bootstrap/lib/Label'
import Tabs from 'react-bootstrap/lib/Tabs'
import Tab from 'react-bootstrap/lib/Tab'


import {isURL} from 'util'
import {DEVICE_RESOLUTION_MODES, PRESET_URL_LIST} from './const'

const _ = require('lodash')
const naturalSort = require('javascript-natural-sort')

import MyModal from './modal'
import MyViewModal from './modalView'

const FILTER_NAME = {
  "IP":         "IP地址",
  "RESOLUTION": "分辨率",
  "URL":        "Active Url",
  "VERSION":    "版本(C/A)"
}
const CHECK_DOM = (
  <span style={{color:"green", marginLeft:10}} className="glyphicon glyphicon-ok"></span>
)

export default class ClientGroup extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editIndex: -1,
      editActiveUrl: '',
      editIndexForResolution: -1, //for resolution: which item is editing, -1 means not editing
      eidtResolution: '0x0',  //for resolution: user select the index from resolution list

      modes: [],
      curMode: null,

      showModal: false,
      showViewModal: false,
      showConfirmModal: false,
      confirmTitle:'',
      confirmMsg:'',
      confirmHandler:null,
      showPresetUrlsModal:false,

      modeNameToChange:null,
      modeNameToView:null,

      showOnlyCurMode:true,
      showOnlyRunning:false,

      filterKey: "IP",
      filterValue: '',

      activeTab: 'easy'
    }

    this.imgViewerWindows = []
    this._modes = []
    this._curMode = null //object like this: {name:'', config:[{ip:'', activeUrl:'', resolution:''}]}
    this._parse()

    this.resetStateForActiveUrl = () => {
      this.setState({
        editIndex: -1,
        editActiveUrl: ''
      })
    }

    this.resetStateForResolution = () => {
      this.setState({
        editIndexForResolution: -1,
        eidtResolution: '0x0'
      })
    }

    this.handleShowOnlyCurModeChanged = (e) => {
      this.setState({
        showOnlyCurMode: e.target.checked
      })
    }

    this.handleShowOnlyRunningChanged = (e) => {
      this.setState({
        showOnlyRunning: e.target.checked
      })
    }

    //handler for edit active url
    this.onEditActiveUrl = (index, _url) => {
      this.setState({
        editIndex: index,
        editActiveUrl: _url
      })
      this.resetStateForResolution()
    }

    this.handleEditActiveUrlChange = (e) => {
      this.setState({
        editActiveUrl: e.target.value
      })
    }

    this.handlerSelectPresetUrl = (_url) => {
      this.setState({
        editActiveUrl: _url,
        showPresetUrlsModal:false
      })
    }

    this.onCancelModify = () => {
      this.resetStateForActiveUrl()
    }

    this.onModifyActiveUrl = (_sockid) => {

      const _activeUrl = this.state.editActiveUrl

      if (!isURL(_activeUrl)) {
        alert('请输入合法的URL')
        return
      }

      this.sendCmdToSingleApp(_sockid, 'setActiveUrl', {activeUrl:_activeUrl})
      this.resetStateForActiveUrl()
    }

    //handler for edit resolution
    this.onEditResolution = (index, _socket) => {
      let _curResolution = this.getResolutionStr(_socket.device.resolution)

      this.setState({
        editIndexForResolution: index,
        eidtResolution: _curResolution
      })

      this.resetStateForActiveUrl()
    }

    this.onCancelModifyResolution = () => {
      this.resetStateForResolution()
    }

    this.onModifyResolution = (_sockid) => {
      const resolution = this.getResolutionObj(this.state.eidtResolution)
      this.sendCmdToSingleApp(_sockid, 'setResolution', {resolution:resolution})
      this.resetStateForResolution()
    }

    this.handlerEditResolutionChange = (e) => {
      this.setState({
        eidtResolution: e.target.value
      })
    }

    this.getResolutionStr = (_resolution) => {
      return _resolution.width + 'x' + _resolution.height
    }

    this.getResolutionObj = (_str) => {
      const ary = _str.split('x')
      return {
        width: parseInt(ary[0]),
        height: parseInt(ary[1])
      }
    }


    //handler for pre modes event
    this.closeModal = () => {
      this.setState({
        showModal: false
      })
    }

    this.onCreateOrEditMode = (modeName) => {
      this.setState({
        showModal: true,
        modeNameToChange: modeName
      })
    }

    this.onApplyMode = (modeName) => {
      this.showViewModal(modeName)
    }

    this.setMode = (modeName) => {
      const existMode = _.find(this.modes, (obj) => {
        return (obj.name === modeName)
      })
      if (existMode) {
        this.curMode = existMode
        const modeSocketsInfo = this.getSomeModeSocketsInfo(modeName)
        _.each(modeSocketsInfo, (socketInfo) => {
          const {socket, resolution, activeUrl} = socketInfo
          const resolutionObj = this.getResolutionObj(resolution)
          if (socket) {
            const sockId = socket.id
            this.sendCmdToSingleApp(sockId, 'setActiveUrl', {activeUrl: activeUrl})
            this.sendCmdToSingleApp(sockId, 'setResolution', {resolution: resolutionObj})
          }
        })
      }
    }

    this.onDeleteMode = (modeName, e) => {
      if (!modeName) {
        return
      }

      this.closeViewModal()

      this.showConfirmModal(`确认删除模式：${modeName}？`, () => {

        let _modes = this.modes.concat()
        _.remove(_modes, function(_mode) {
          return _mode.name === modeName
        });
        this.modes = _modes
        if (this.curMode && this.curMode.name === modeName) {
          this.curMode = null
        }

        this.hideConfirmModal()
      })


    }

    this._formModeInfo = (_newResolutionObj, _newUrlObj, _newModeName) => {
      const info = {
        name: _newModeName,
        config: []
      }

      _.forEach(_newResolutionObj, function(value, key) {
        info.config.push({
          ip: key,
          activeUrl: _newUrlObj[key],
          resolution: value
        })
      });

      return info
    }

    this.onConfirmMode = (_newResolutionObj, _newUrlObj, _newModeName) => {
      //process result
      const {modeNameToChange} = this.state

      const newInfo = this._formModeInfo(_newResolutionObj, _newUrlObj, _newModeName)
      const _modes = this.modes.concat()
      const existMode = _.find(this.modes, (obj) => {
        return (obj.name === _newModeName)
      })
      if (existMode) {
        _.remove(_modes, (obj) => {
          return obj.name === _newModeName
        })
      }

      _modes.push(newInfo)
      this.modes = _modes

      this.closeModal()

      if (this.curMode && this.curMode.name == _newModeName) {
        this.setMode(_newModeName)
      }else{
        setTimeout(() => {
          this.showConfirmModal(`已成功保存到模式：${_newModeName}，是否立即应用该模式？`, () => {
            this.setMode(_newModeName)

            this.hideConfirmModal()
          })
        }, 500)
      }
    }

    //for view modal
    this.closeViewModal = () => {
      this.setState({
        showViewModal: false
      })
    }

    this.showViewModal = (modeName) => {
      this.setState({
        showViewModal: true,
        modeNameToView: modeName
      })
    }

    this.onConfirmApplyMode = (_modeToApply) => {
      this.closeViewModal()
      this.setMode(_modeToApply)
    }

    // for confirm modal
    this.hideConfirmModal = () => {
      this.setState({
        showConfirmModal: false
      })
    }

    this.showConfirmModal = (msg, hanlder, title = "提醒") => {
      this.setState({
        showConfirmModal: true,
        confirmTitle: title,
        confirmMsg:msg,
        confirmHandler:hanlder
      })
    }

    // for preset urls modal
    this.hidePresetUrlsModal = () => {
      this.setState({
        showPresetUrlsModal: false
      })
    }

    this.showPresetUrlsModal = () => {
      this.setState({
        showPresetUrlsModal: true
      })
    }

    this.onClickScreenShot = () => {
      window.open("/static/imgViewer.html", '_blank')
    }

    //handler for filter
    this.handlerFilterKeyChanged = (_filterKey) => {
      this.setState({
        filterKey: _filterKey
      })
    }

    this.handlerFilterValueChanged = (e) => {
      this.setState({
        filterValue: e.target.value.trim() //去除收尾空格
      })
    }

    this.onViewModesOfThisPc = (ip) => {
      const _modes = this.getModesThatContainIp(ip)
      const modesDom = (
        <span>
        {
          _modes.map((_mode, i) => {
            return (
              <span key={i}>
                <Label bsStyle="info" style={{fontSize:'16px'}}>{_mode.name}</Label>
                <br />
                <br />
              </span>
            )
          })
        }
        </span>
      )
      this.showConfirmModal(modesDom, () => {
        this.hideConfirmModal()
      }, "当前PC被如下模式引用")
    }

    this.handleSelectTab = (eventKey) => {
      this.setState({
        activeTab: eventKey,
        showOnlyCurMode: true,
        showOnlyRunning: false
      })
    }

    this.capturePage = (uuid) => {
      let ioPackageInst = window.ioPackage ? window.ioPackage.getInstance() : null
      if (!ioPackageInst) {
        alert("与服务器连接异常!")
        return
      }

      const sockets = []
      _.each(this.curVisibleSocketsInfo, (socketInfo) => {
        if (socketInfo.socket) {
          sockets.push(socketInfo.socket)
        }
      })

      if (sockets.length === 0) {
        alert("当前没有可供截屏的PC!")
        return
      }

      const foundWinObj = _.find(this.imgViewerWindows, (windowItem) => {
        return windowItem.uuid === uuid
      })
      if (!foundWinObj) {
        alert("截屏窗口打开异常!")
        return
      }
      _.each(sockets, (socket) => {
        ioPackageInst.capturePage(socket.id, (err, data) => {
          console.log('after capture page', data)
          foundWinObj.win.postMessage({cmd: "sic3shell_img_viewer_sockets", uuid: uuid,
                            captureData: data, showOnlySage: true, dataLen: sockets.length}, '*');
        });
      })
    }

    this.capturePageRecvMsg = (event) => {
      const msgs = ["sic3shell_img_viewer_ready", "sic3shell_img_viewer_finished"]
      if(!event.data.cmd) return;
      if(msgs.indexOf(event.data.cmd) < 0) return;
      if(event.data.cmd === "sic3shell_img_viewer_ready") {
        this.imgViewerWindows.push({
          uuid: event.data.uuid,
          win: event.source
        })
        this.capturePage(event.data.uuid)
      }

      if(event.data.cmd === "sic3shell_img_viewer_finished") {
        _.remove(this.imgViewerWindows, (windowItem) => {
          return windowItem.uuid === event.data.uuid
        })
      }
    }


    const adminIOCmdSocketMsg = this.props.actions.adminIOCmdSocketMsg

    this.sendCmdToSingleApp = (sockid, cmd, opts) => {
      console.log('socket onCmdToApp:', cmd, opts)
      adminIOCmdSocketMsg(sockid, {
        to: 'app',
        cmd,
        opts
      });
    }

    this.onCmdToApp = (cmd, opts) => {
      console.log('onCmdToApp:', cmd, opts)
      const {group, pageAction} = this.props;
      pageAction.adminIOCmdGroupMsg(group.id, {
        to: 'app',
        cmd,
        opts
      });
    }

    this.onCmdToCore = (cmd, opts) => {
      console.log('onCmdToCore:', cmd, opts)
      const {group, pageAction} = this.props;
      pageAction.adminIOCmdGroupMsg(group.id, {
        to: 'core',
        cmd,
        opts
      });
    }

    this.onCmdToCurrentVisibleApps = (target, cmd, opts) => {
      _.each(this.curVisibleSocketsInfo, (socketInfo) => {
        const {socket} = socketInfo
        if (socket) {
          adminIOCmdSocketMsg(socket.id, {
            to: target,
            cmd,
            opts
          });
        }
      })
    }

    //changed to send cmd to only visible client, not include filtered client
    this.appCmdReloadAll = this.onCmdToCurrentVisibleApps.bind(this, 'app', 'reload', null);
    this.appCmdRefreshAll = this.onCmdToCurrentVisibleApps.bind(this, 'app', 'refresh', null);
    this.appCmdHardRefreshAll = this.onCmdToCurrentVisibleApps.bind(this, 'app', 'hardRefresh', null);
    this.appCmdMaximizeAll = this.onCmdToCurrentVisibleApps.bind(this, 'app', 'enterFullscreen', null);
    this.appCmdMinimizeAll = this.onCmdToCurrentVisibleApps.bind(this, 'app', 'leaveFullscreen', null);
    this.appCmdClearLocalstorageAll = this.onCmdToCurrentVisibleApps.bind(this, 'app', 'clearLocalstorage', null);

    this.coreCmdUpdateApp = this.onCmdToCurrentVisibleApps.bind(this, 'core', 'upgradeApp', null);
    this.coreCmdOpenApp = this.onCmdToCurrentVisibleApps.bind(this, 'core', 'openApp', null);
    this.coreCmdCloseApp = this.onCmdToCurrentVisibleApps.bind(this, 'core', 'closeApp', null);
    this.coreCmdUpgradeCore = () => {
      const prom = prompt("敏感操作，请输入密码！")
      if (prom === 'wing') {
        this.onCmdToCurrentVisibleApps('core', 'upgradeCore', null)
        alert('升级Core命令已发送!')
      } else {
        alert('密码错误!')
      }
    }
/*
    this.appCmdRefreshAll = this.onCmdToApp.bind(this, 'reload', null);
    this.appCmdMaximizeAll = this.onCmdToApp.bind(this, 'enterFullscreen', null);
    this.appCmdMinimizeAll = this.onCmdToApp.bind(this, 'leaveFullscreen', null);

    this.coreCmdStatistic = this.onCmdToCore.bind(this, 'stat', null);
    this.coreCmdUpdateApp = this.onCmdToCore.bind(this, 'upgradeApp', null);
    this.coreCmdOpenApp = this.onCmdToCore.bind(this, 'openApp', null);
    this.coreCmdCloseApp = this.onCmdToCore.bind(this, 'closeApp', null);
    this.coreCmdToggleAppDebugPanel = this.onCmdToCore.bind(this, 'toggleAppDebugPanel', null);
*/
  }

  //获取某台PC被哪些模式引用, 根据ip查找
  getModesThatContainIp (ip) {
    const _modes = _.filter(this.modes, (mode) => {
      const info = _.find(mode.config, (item) => {
        return item.ip === ip
      })
      return !!info
    })
    return _modes
  }

  //check item is not in filter
  checkItemNotInFilter (text, filterValue) {
    if (typeof text != "string") {
      text = ''
    }
    return text.indexOf(filterValue) < 0
  }

  get modes () {
    return this._modes
  }

  set modes (_newModes) {
    this._modes = _newModes
    this.setState({
      modes: _newModes
    })

    const {group} = this.props
    const user = this.props.user.toJS()
    let preference = user.preference ? user.preference : {}
    const modePreference = preference.modePreference ? preference.modePreference : []

    const info = _.remove(modePreference, (obj) => {
      return obj.group === group.name
    })
    const currentGroupInfo = (info.length > 0 ? info[0] : {group : group.name})
    currentGroupInfo.modes = _newModes

    modePreference.push(currentGroupInfo)

    this.props.actions.updatePreferenceAsync('modePreference', modePreference, false)
  }

  get curMode () {
    return this._curMode
  }

  //获取某个指定mode的sockets信息和模式的activeurl和resolution等信息
  getSomeModeSocketsInfo (modeName) {
    if (!modeName){
      return []
    }
    const mode = _.find(this.modes, (obj) => {
        return obj.name === modeName
    })
    if (!mode) {
      return []
    }
    const modeSockets = []
    const {sockets} = this.props;
    _.each(mode.config, (item) => {
      const modeSock = _.cloneDeep(item)
      const sock = _.find(sockets, (_socket) => {
        return _socket.device.ip === item.ip
      })
      modeSock.socket = null
      if (sock) {
        modeSock.socket = sock
      }
      modeSockets.push(modeSock)
    })
    return modeSockets
  }

  //获取所有sockets个数，包括所有连接sockets及所有modes中没有连接的PC
  get allSocketsCount () {
    const {group, sockets} = this.props;
    const filterSockets = _.filter(sockets,
      _socket => {
        return group.sockets.indexOf(_socket.id) >= 0
    })
    const ipArray = []
    _.each(filterSockets, (_socket) => {
      ipArray.push(_socket.device.ip)
    })

    _.each(this.modes, (_mode) => {
      _.each(_mode.config, (obj) => {
        const findInfo = _.find(ipArray, (f) => {
          return f === obj.ip
        })
        if (!findInfo) {
          ipArray.push(obj.ip)
        }
      })
    })

    return ipArray.length
  }

  //根据filter给文本加上红色标记
  getFilteredTextDom (text, filterValue) {
    if (typeof text != "string") {
      text = ''
    }
    const ary = text.split(filterValue)
    return ary.map((item, i) => {
      return (i == (ary.length - 1) ? (
        <span key={i}>{item}</span>
      ) : (
        <span key={i}>
          <span>{item}</span>
          <span style={{background:'yellow', fontWeight:'bold'}}>{filterValue}</span>
        </span>
      ))
    })
  }

  //获取当前显示列表可见的sockets
  get curVisibleSocketsInfo () {
    const {group, sockets} = this.props;
    const {showOnlyCurMode, showOnlyRunning} =  this.state;

    const filterSockets = _.filter(sockets,
      _socket => {
        return group.sockets.indexOf(_socket.id) >= 0
    })

    const visibleSocketsInfo = []

    _.each(filterSockets, (socket) => {
      const info = {
        ip: socket.device.ip,
        resolution: this.getResolutionStr(socket.device.resolution),
        activeUrl: socket.app.activeUrl,
        version: `${socket.core.version}/${socket.core.appVersion}`,
        changeStaleForItem: {},
        changeStyleForActiveUrl: {},
        changeStyleForResolution: {},
        socket: socket
      }
      let qualified = true
      if (this.curMode) {
        //check active url whether different from curMode config
        const infoFromCurMode = _.find(this.curMode.config, (obj) => {
          return obj.ip === socket.device.ip
        })
        if (infoFromCurMode) {
          info.changeStaleForItem = {background:'#dff0d8'} //改变item背景颜色：绿色表示当前模式, 无颜色代表不在当前模式的item
          info.changeStyleForActiveUrl = (infoFromCurMode.activeUrl === socket.app.activeUrl ? {} : {color:'#d43f3a'})
          info.changeStyleForResolution = (infoFromCurMode.resolution === info.resolution ? {} : {color:'#d43f3a'})
        }else {
          if (showOnlyCurMode) {
            qualified = false
          }
        }
      }

      const appShellRuning = socket.core.appShellRuning
      if (!appShellRuning && showOnlyRunning) {
        qualified = false
      }

      if (qualified) {
        visibleSocketsInfo.push(info)
      }
    })

    //遍历所有modes的配置，添加那些没有连接上来的PC
    if (!showOnlyRunning) {
      let scanModes = this.modes.concat()
      if (this.curMode && showOnlyCurMode) {
        scanModes = [this.curMode]
      }
      _.each(scanModes, (_mode) => {
        _.each(_mode.config, (obj) => {
          const findInfo = _.find(visibleSocketsInfo, (f) => {
            return f.ip === obj.ip
          })
          if (!findInfo) {
            visibleSocketsInfo.push({
              ip: obj.ip,
              resolution: obj.resolution,
              activeUrl: obj.activeUrl,
              version: "无",
              changeStaleForItem: ((this.curMode && this.curMode.name === _mode.name) ? {background:'#dff0d8'} : {}),
              changeStyleForActiveUrl: {},
              changeStyleForResolution: {},
              socket: null
            })
          }
        })
      })
    }

    //filter，关键字搜索过滤
    _.remove(visibleSocketsInfo, (vsinfo) => {
      let shouldRemove = false
      let ipStr = vsinfo.ip,
          resolutionStr = vsinfo.resolution,
          urlStr = vsinfo.activeUrl,
          versionStr = vsinfo.version

      const {filterValue, filterKey} = this.state
      if (filterValue != '') {
        switch (filterKey) {
          case "IP":
            if (this.checkItemNotInFilter(ipStr, filterValue)) {
              shouldRemove = true
            }
            break;
          case "RESOLUTION":
            if (this.checkItemNotInFilter(resolutionStr, filterValue)) {
              shouldRemove = true
            }
            break;
          case "URL":
            if (this.checkItemNotInFilter(urlStr, filterValue)) {
              shouldRemove = true
            }
            break;
          case "VERSION":
            if (this.checkItemNotInFilter(versionStr, filterValue)) {
              shouldRemove = true
            }
            break;
        }
      }
      return shouldRemove
    })

    //根据ip进行排序, 自然排序
    const sortedVisibleSocketsInfo = []
    let ipArray = []
    _.each(visibleSocketsInfo, (visInfo) => {
      ipArray.push(visInfo.ip)
    })
    ipArray = ipArray.sort(naturalSort)
    let index = 0
    _.each(ipArray, (_ip) => {
      const finded = _.find(visibleSocketsInfo, (visInfo) => {
        return visInfo.ip === _ip
      })
      if (finded) {
        index++
        sortedVisibleSocketsInfo.push(_.merge(finded, {index: index}))
      }
    })

    return sortedVisibleSocketsInfo
  }

  set curMode (_newCurMode) {
    this._curMode = _newCurMode
    this.setState({
      curMode: _newCurMode
    })

    const {group} = this.props
    const user = this.props.user.toJS()
    let preference = user.preference ? user.preference : {}
    const modePreference = preference.modePreference ? preference.modePreference : []

    const info = _.remove(modePreference, (obj) => {
      return obj.group === group.name
    })
    const currentGroupInfo = (info.length > 0 ? info[0] : {group : group.name})
    currentGroupInfo.curMode = (_newCurMode ? _newCurMode.name : null)

    modePreference.push(currentGroupInfo)

    this.props.actions.updatePreferenceAsync('modePreference', modePreference, false)
  }

  _parse () {
    const {group} = this.props
    const user = this.props.user.toJS()
    const preference = user.preference ? user.preference : {}
    const modePreference = preference.modePreference ? preference.modePreference : []

    const currentGroupPreference = _.find(modePreference, (obj) => {
      return obj.group === group.name
    })

    let _modes = []
    let _curMode = null
    if (currentGroupPreference) {
      _modes = currentGroupPreference.modes ? currentGroupPreference.modes : []
      _curMode = currentGroupPreference.curMode ? currentGroupPreference.curMode : null
    }

    if (_curMode) {
      const info = _.find(_modes, (obj) => {
          return obj.name === _curMode
      })
      _curMode = info
    }

    this._modes = _modes
    this._curMode = _curMode

    this.state.modes = this._modes
    this.state.curMode = this._curMode
  }

  renderShellAppOps () {
    return (<Panel header={'Shell功能'} bsStyle='info'>
              <div style={{position: 'relative'}}>
                <Button bsStyle="link" bsSize="large" onClick = {this.coreCmdOpenApp}  >
                    打开APP
                </Button>
                <Button bsStyle="link" bsSize="large" onClick = {this.coreCmdCloseApp}  >
                    关闭APP
                </Button>
                <Button bsStyle="link" bsSize="large" onClick = {this.coreCmdUpdateApp}  >
                    升级APP
                </Button>
                <Button bsStyle="link" bsSize="xsmall"
                  style={{position: 'absolute',
                          top: 0, right: 0,
                          opacity: '0.4'}}
                  onClick = {this.coreCmdUpgradeCore }  >
                    升级Core
                </Button>
              </div>
            </Panel>)

  }

  renderAppOps () {
    return (<Panel header={'APP功能'} bsStyle='info'>
          <Button bsStyle="link" bsSize="large" onClick = {this.appCmdReloadAll} >
              重新打开页面
          </Button>
          <Button bsStyle="link" bsSize="large" onClick = {this.appCmdRefreshAll} >
              刷新(F5)
          </Button>
          <Button bsStyle="link" bsSize="large" onClick = {this.appCmdHardRefreshAll} >
              强制刷新(Ctrl+F5)
          </Button>
          <Button bsStyle="link" bsSize="large" onClick = {this.appCmdMaximizeAll} >
              全屏
          </Button>
          <Button bsStyle="link" bsSize="large" onClick = {this.appCmdMinimizeAll} >
              退出全屏
          </Button>
          <Button bsStyle="link" bsSize="large" onClick = {this.appCmdClearLocalstorageAll} >
              清除App存储信息
          </Button>
          <Button bsStyle="link" bsSize="large" onClick = {this.onClickScreenShot}>
              截屏
          </Button>
        </Panel>)
  }

  renderPresetMode () {
    const {showOnlyCurMode, showOnlyRunning, filterValue, filterKey, activeTab} = this.state
    let modes = this.modes
    const curMode = this.curMode
    const self = this

    const checkDom = (
      <span style={{color:"green", marginLeft:10}} className="glyphicon glyphicon-ok"></span>
    )

    modes = _.sortBy(modes, [(_item) => {
      return _item.name
    }])

    return (
      <Panel header={'预设模式'} bsStyle='info'>
        <Tabs activeKey={activeTab} onSelect={this.handleSelectTab} id="client_group_active_tabs">
          <Tab eventKey="easy" title="简易">
            <Col style={{paddingLeft:0, marginTop:15}} xs={9}>
              <ButtonToolbar>
                {
                  modes.length > 0 ? (
                    <DropdownButton
                        bsStyle='default'
                        bsSize="small"
                        title={curMode ? (<span><span>{curMode.name}</span>{checkDom}</span>): '请选择模式'}
                        style={{minWidth:80, marginRight:20}}
                        id="split-button-basic-default">
                        {
                          modes.map((mode, i) => {
                            const isEqual = (curMode && mode.name === curMode.name)
                            return (
                              <MenuItem key={i} style={{minWidth:150}}
                                onClick={self.onApplyMode.bind(self, mode.name)}>
                                  {mode.name}
                                  {isEqual ? checkDom : null}
                              </MenuItem>
                            )
                          })
                        }
                    </DropdownButton>
                  ) : null
                }
                <span style={{marginLeft:5}}>
                  <span>当前: <Badge style={{background:"#5bc0de"}}>{this.curVisibleSocketsInfo.length}</Badge> </span>
                </span>
              </ButtonToolbar>
            </Col>
          </Tab>
          <Tab eventKey="hard" title="高级">
            <Col style={{paddingLeft:0, marginTop:15}} xs={9}>
              <ButtonToolbar>
                {
                  modes.length > 0 ? (
                    <DropdownButton
                        bsStyle='default'
                        bsSize="small"
                        title={curMode ? (<span><span>{curMode.name}</span>{checkDom}</span>): '请选择模式'}
                        style={{minWidth:80}}
                        id="split-button-basic-default">
                        {
                          modes.map((mode, i) => {
                            const isEqual = (curMode && mode.name === curMode.name)
                            return (
                              <MenuItem key={i} style={{minWidth:150}}
                                onClick={self.onApplyMode.bind(self, mode.name)}>
                                  {mode.name}
                                  {isEqual ? checkDom : null}
                              </MenuItem>
                            )
                          })
                        }
                    </DropdownButton>
                  ) : null
                }
                <Button bsStyle="default"
                  bsSize="small"
                  style={modes.length > 0 ? {marginLeft:20} : null}
                  onClick = {this.onCreateOrEditMode.bind(this, curMode ? curMode.name : null)} >
                保存模式
                </Button>

                {curMode ? (<span>
                    <input type="checkbox"
                      style={{marginLeft:15, marginTop:9}}
                      checked={showOnlyCurMode}
                      onChange={this.handleShowOnlyCurModeChanged}>
                    </input>
                    <span style={{marginLeft:5}}>只显示当前模式</span>
                  </span>) : null
                }

                <input type="checkbox"
                  style={{marginLeft:15, marginTop:9}}
                  checked={showOnlyRunning}
                  onChange={this.handleShowOnlyRunningChanged}>
                </input>
                <span style={{marginLeft:5}}>只显示运行中</span>

                <span style={{marginLeft:20}}>
                  <span>总数: <Badge style={{background:"#337ab7"}}>{this.allSocketsCount}</Badge> </span>
                  <span>当前: <Badge style={{background:"#5bc0de"}}>{this.curVisibleSocketsInfo.length}</Badge> </span>
                </span>
              </ButtonToolbar>
            </Col>
            <Col xs={3} style={{marginTop:15}}>
              <InputGroup>
                <DropdownButton
                  componentClass={InputGroup.Button}
                  id="client-group-filter-dropdown"
                  title={FILTER_NAME[filterKey]}>
                  {
                    ["IP", "RESOLUTION", "URL", "VERSION"].map((key, i) => {
                      return (
                        <MenuItem key={i}
                          onClick={this.handlerFilterKeyChanged.bind(this, key)}>
                          {FILTER_NAME[key]}
                          {filterKey == key ? CHECK_DOM : null}
                        </MenuItem>
                      )
                    })
                  }
                </DropdownButton>
                <FormControl type="text" value={filterValue}
                  onChange={this.handlerFilterValueChanged} />
                <InputGroup.Addon>
                  <Glyphicon glyph="filter" />
                </InputGroup.Addon>
              </InputGroup>
            </Col>
          </Tab>
        </Tabs>
      </Panel>
    )
  }

  renderList () {
    const {editIndex, editIndexForResolution, eidtResolution,
            editActiveUrl, filterKey, filterValue, activeTab} =  this.state;
    const self = this
    const canEdit = (activeTab === 'hard')
    let num = 0
    return (
      <Table responsive style={{marginBottom:400}}>
        <thead>
          <tr>
            <th width="60">编号 </th>
            <th width="120">IP地址</th>
            <th width="100">App连接</th>
            <th width="100">Shell状态</th>
            <th width="120">分辨率</th>
            <th width="450">Active URL</th>
            <th width="70">URLS</th>
            <th width="100">所属模式 </th>
            <th width="100">版本(C/A)</th>
            <th width="100">操作 </th>
          </tr>
        </thead>
        <tbody>
          {
            this.curVisibleSocketsInfo.map((socketInfo, i) => {
              const {socket, ip, resolution, activeUrl, version,
                      changeStaleForItem,
                      changeStyleForActiveUrl,
                      changeStyleForResolution} = socketInfo

              let activeUrlDom = activeUrl,
                  resolutionDom = resolution

              if (socket) {
                //for edit active url
                if (socket.core.appShellRuning) {
                  if (editIndex == i) {
                    activeUrlDom = (
                      <div style={changeStyleForActiveUrl}>
                        <input style={{width:400}} type="text"
                              value={editActiveUrl}
                              onChange={this.handleEditActiveUrlChange}/>
                        <br />
                        <div style={{marginTop:5}}>
                          <Col xs={2}>
                            <DropdownButton
                              noCaret
                              style={{float:'left'}}
                              bsSize='xsmall'
                              componentClass={InputGroup.Button}
                              id={"client-activeurl-dropdown"+socket.id}
                              title={"选择URL"}>
                              {socket.app.urls.length > 0 ? <MenuItem header>已打开URL:</MenuItem> : null}
                              {
                                socket.app.urls.map((_presetUrl, j) => {
                                  return (
                                    <MenuItem key={j}
                                      onClick={this.handlerSelectPresetUrl.bind(this, _presetUrl)}>
                                      {_presetUrl}
                                    </MenuItem>
                                  )
                                })
                              }
                              {socket.app.urls.length > 0 ? <MenuItem divider/> : null}
                              <MenuItem header>预设URL:</MenuItem>
                              <MenuItem onClick={this.showPresetUrlsModal}>点击查看URL...</MenuItem>
                            </DropdownButton>
                          </Col>
                          <Col xs={10}>
                            <Button onClick={this.onModifyActiveUrl.bind(this, socket.id)}
                                style={{marginRight:5}}
                                bsStyle="primary" bsSize="xsmall">确定</Button>
                            <Button onClick={this.onCancelModify} bsSize="xsmall">取消</Button>
                          </Col>
                        </div>
                      </div>
                    )
                  }else {
                    activeUrlDom = (
                      <div style={changeStyleForActiveUrl}
                          onClick={canEdit ? this.onEditActiveUrl.bind(this, i, socket.app.activeUrl) : null}>
                          {socket.app.activeUrl ?
                            (filterKey === 'URL' ? this.getFilteredTextDom(socket.app.activeUrl, filterValue) :
                              socket.app.activeUrl) : (canEdit ? "点击添加" : "暂无")}
                      </div>
                    )
                  }
                }

                const curResolution = this.getResolutionStr(socket.device.resolution)
                //for edit resolution list
                if (socket.core.appShellRuning && curResolution) {
                  if (editIndexForResolution == i) {
                    resolutionDom = (
                      <div style={changeStyleForResolution}>
                        <select value={eidtResolution} onChange={this.handlerEditResolutionChange}>
                          {
                            DEVICE_RESOLUTION_MODES.map((item, j) => {
                              return (
                                <option key={j} value={item}>{item}</option>
                              )
                            })
                          }
                        </select>
                        <br />
                        <Button onClick={this.onModifyResolution.bind(this, socket.id)}
                            style={{marginTop:5,marginLeft:5}}
                            bsStyle="primary" bsSize="xsmall">确定</Button>
                        <Button onClick={this.onCancelModifyResolution}
                            style={{marginTop:5,marginLeft:5}} bsSize="xsmall">取消</Button>
                      </div>
                    )
                  }else {
                    resolutionDom = (
                      <div style={changeStyleForResolution}
                            onClick={canEdit ? this.onEditResolution.bind(this, i, socket) : null}>
                          {filterKey === 'RESOLUTION' ? this.getFilteredTextDom(curResolution, filterValue) : curResolution}
                      </div>
                    )
                  }
                }
              }

              return (
                <tr key = {num} style={changeStaleForItem}>
                  <td> {++num} </td>
                  <td> {filterKey === 'IP' ? this.getFilteredTextDom(ip, filterValue) : ip} </td>
                  <td>
                    {socket ?
                      (<span style={{background:'#2fc15c',
                                    padding:5,
                                    color:'white',
                                    borderRadius:'5px',
                                    fontSize:'0.9em'}}>已连接</span>) :
                      (<span style={{background:'#ec6a66',
                                    padding:5,
                                    color:'white',
                                    borderRadius:'5px',
                                    fontSize:'0.9em'}}>未连接</span>)
                     }
                  </td>
                  <td>
                    {socket && socket.core.appShellRuning ?
                      (<span style={{background:'#2fc15c',
                                    padding:5,
                                    color:'white',
                                    borderRadius:'5px',
                                    fontSize:'0.9em'}}>运行中</span>) :
                      (<span style={{background:'#ec6a66',
                                    padding:5,
                                    color:'white',
                                    borderRadius:'5px',
                                    fontSize:'0.9em'}}>未运行</span>)
                     }
                  </td>
                  <td> {resolutionDom} </td>
                  <td> {activeUrlDom ? activeUrlDom : '暂无, 启动shell后添加'}</td>
                  <td> {socket ? socket.app.urls.length : '无'} </td>
                  <td>
                    {this.getModesThatContainIp(ip).length}个
                    <Button bsStyle="link"
                      onClick={this.onViewModesOfThisPc.bind(this, ip)}
                      bsSize="small">
                      查看
                    </Button>
                  </td>
                  <td>{filterKey === 'VERSION' ?
                       this.getFilteredTextDom(version, filterValue) : 
                       version}</td>
                  <td>
                    {socket ? (
                      <Button bsStyle="link" bsSize="small">
                        <Link to={`/socket_detail/${socket.device.mac}`}>
                          <Glyphicon glyph="arrow-right" /> 查看详细
                        </Link>
                      </Button>
                    ) : '无'}
                  </td>
                </tr>
              );
          })
        }
        </tbody>
      </Table>
    )
  }

  renderModal () {
    const {modeNameToChange} = this.state
    return (
      <MyModal show={this.state.showModal}
              onHide={this.closeModal}
              sockets={this.curVisibleSocketsInfo}
              modeNameToChange={modeNameToChange}
              onConfirmMode={this.onConfirmMode}/>
    )
  }

  renderViewModal () {
    const {group, sockets} = this.props;
    const {modeNameToView} = this.state
    const modeSocketsInfo = this.getSomeModeSocketsInfo(modeNameToView)
    return (
      <MyViewModal show={this.state.showViewModal}
              onHide={this.closeViewModal}
              modeNameToView={modeNameToView}
              modeSocketsInfo={modeSocketsInfo}
              onDeleteMode={this.onDeleteMode}
              onConfirmApplyMode={this.onConfirmApplyMode}/>
    )
  }

  renderConfirmModal () {
    const {showConfirmModal, confirmTitle, confirmMsg, confirmHandler} = this.state

    return (
      <Modal bsSize="large" aria-labelledby="contained-modal-title-lg" show={showConfirmModal} backdrop={'static'}>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">{confirmTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p style={{textAlign:'center'}}>{confirmMsg}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.hideConfirmModal}>取消</Button>
          <Button bsStyle="primary" onClick={confirmHandler}>确认</Button>
        </Modal.Footer>
      </Modal>
    )
  }

  renderPresetUrlsModal () {
    const {showPresetUrlsModal} = this.state

    return (
      <Modal bsSize="large" aria-labelledby="contained-modal-title-lg" show={showPresetUrlsModal} backdrop={'static'}>
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-lg">选择预设URLS</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>URLS ({PRESET_URL_LIST.length})</div>
          <div style={{marginTop:15,height:500,overflow:'scroll',border:'dotted 2px #999'}}>
            <ListGroup>
              {
                PRESET_URL_LIST.map((_presetUrl, i) => {
                  return (
                    <ListGroupItem key={i}
                       onClick={this.handlerSelectPresetUrl.bind(this, _presetUrl)}>
                      {`${i+1}. ${_presetUrl}`}
                    </ListGroupItem>
                  )
                })
              }
            </ListGroup>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle='primary' onClick={this.hidePresetUrlsModal}>关闭</Button>
        </Modal.Footer>
      </Modal>
    )
  }

  render() {
    const {group} = this.props;
    if (group.sockets.length === 0) {
      return <div> 目前分组为空 </div>
    }

    return (
      <div>
        {this.renderShellAppOps()}
        {this.renderAppOps()}
        {this.renderPresetMode()}
        {this.renderList()}
        {this.renderModal()}
        {this.renderViewModal()}
        {this.renderConfirmModal()}
        {this.renderPresetUrlsModal()}
      </div>
    );
  }

  componentDidMount() {
    window.addEventListener('message', this.capturePageRecvMsg)
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.capturePageRecvMsg)
  }
}