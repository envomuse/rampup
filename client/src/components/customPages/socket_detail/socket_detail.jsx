import React from 'react';

import ListGroup from 'react-bootstrap/lib/ListGroup'
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem'
import Panel from 'react-bootstrap/lib/Panel'
import Table from 'react-bootstrap/lib/Table'
import Glyphicon from 'react-bootstrap/lib/Glyphicon';

import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import Button from 'react-bootstrap/lib/Button';
import DropdownButton from 'react-bootstrap/lib/DropdownButton'
import MenuItem from 'react-bootstrap/lib/MenuItem'
import {Link} from 'react-router'

import {isURL} from 'util'
import {DEVICE_RESOLUTION_MODES} from '../groupList/const'

const _ = require('lodash')
const cronParse = require('cron-parser')
const MSGS = ["sic3shell_img_viewer_ready", "sic3shell_img_viewer_finished"]

const REFRESH_TYPE_TITLE = {
  'none': "关闭",
  'minute': '每间隔分钟',
  'hour': '每间隔小时',
  'day': '每天定时'
}

const APP_MODES = {
  'easy': '简易',
  'advance': '高级'
}

const CHECK_DOM = (
  <span style={{color:"green", marginLeft:10}} className="glyphicon glyphicon-ok"></span>
)

export default class SocketDetail extends React.Component {
  constructor(props) {
    super(props);

    const adminIOCmdSocketMsg = this.props.actions.adminIOCmdSocketMsg

    this.imgViewerWindows = []

    this.onCmdToApp = (cmd, opts) => {
      const socketId = this.socket.id
      console.log('socket onCmdToApp:', cmd, opts)
      adminIOCmdSocketMsg(socketId, {
        to: 'app',
        cmd,
        opts
      });
    }

    this.onCmdToCore = (cmd, opts) => {
      const socketId = this.socket.id
      console.log('socket onCmdToCore:', cmd, opts)
      adminIOCmdSocketMsg(socketId, {
        to: 'core',
        cmd,
        opts
      });
    }

    this.appCmdReload = this.onCmdToApp.bind(this, 'reload', null);
    this.appCmdRefresh = this.onCmdToApp.bind(this, 'refresh', null);
    this.appCmdHardRefresh = this.onCmdToApp.bind(this, 'hardRefresh', null);
    this.appCmdEnterFullscreen = this.onCmdToApp.bind(this, 'enterFullscreen', null);
    this.appCmdLeaveFullscreen = this.onCmdToApp.bind(this, 'leaveFullscreen', null);
    this.appCmdClearLocalstorage = this.onCmdToApp.bind(this, 'clearLocalstorage', null);
    this.appCmdKillWins = this.onCmdToApp.bind(this, 'killWins', null);

    this.capturePage = (uuid) => {
      let ioPackageInst = window.ioPackage ? window.ioPackage.getInstance() : null
      if (!ioPackageInst) {
        alert("与服务器连接异常!")
        return
      }

      const foundWinObj = _.find(this.imgViewerWindows, (windowItem) => {
        return windowItem.uuid === uuid
      })
      if (!foundWinObj) {
        alert("截屏窗口打开异常!")
        return
      }

      const socketId = this.socket.id
      ioPackageInst.capturePage(socketId, (err, data) => {
        console.log('after capture page', data)
        foundWinObj.win.postMessage({cmd: "sic3shell_img_viewer_sockets", uuid: uuid,
                          captureData: data, showOnlySage: false, dataLen: 1}, '*');
      })
    }

    this.capturePageRecvMsg = (event) => {
      if(!event.data.cmd) return;
      if(MSGS.indexOf(event.data.cmd) < 0) return;
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

    this.coreCmdStatistic = this.onCmdToCore.bind(this, 'stat', null);
    this.coreCmdUpdateApp = this.onCmdToCore.bind(this, 'upgradeApp', null);
    this.coreCmdOpenApp = this.onCmdToCore.bind(this, 'openApp', null);
    this.coreCmdCloseApp = this.onCmdToCore.bind(this, 'closeApp', null);
    this.coreCmdToggleAppDebugPanel = this.onCmdToCore.bind(this, 'toggleAppDebugPanel', null);
    this.coreCmdChangeGroup = (group) => {
      this.onCmdToCore ('changeGroup', {
        group: group
      })
    };
    this.coreCmdUpgradeCore = () => {
      const prom = prompt("敏感操作，请输入密码！")
      if (prom === 'wing') {
        this.onCmdToCore ('upgradeCore', null)
        alert('升级Core命令已发送!')
      } else {
        alert('密码错误!')
      }
    };

    this.state = {
      edit: false,
      url: '',
      cacheUrls: [], //编辑时的url数组，保存后统一发送
      cacheActiveUrlIndex: 0,
      editActiveUrl: '',
      editRefresh: false, //编辑定时刷新设置
      editRefreshType: 'none', //编辑refresh定时方式, 'none', 'minute', 'hour', 'day'
      editRefreshVal: {}, //编辑refresh值
      mode: 'easy',
      isEditResolution: false,
      editResolution: ''
    }

    this.onOpenAppPages = () => {
      if (!this.socket) {
        return
      }
      const {app} = this.socket
      if(app.urls.length == 0) {
        alert('当前没有要打开网页，请点击下方编辑添加！')
        return
      }
      this.onCmdToApp('start', null)
    }

    this.onEdit = () => {
      let cacheUrls = []
      let cacheActiveUrlIndex = 0
      if(this.socket){
        const {app} = this.socket
        cacheUrls = app.urls.concat()
        const _index = _.indexOf(cacheUrls, app.activeUrl)
        cacheActiveUrlIndex = _index >= 0 ? _index : 0
      }

      this.setState({
        edit: true,
        cacheUrls: cacheUrls,
        cacheActiveUrlIndex: cacheActiveUrlIndex
      })
    }

    this.onEditActiveUrl = () => {
      this.setState({
        edit: true,
        editActiveUrl: (this.socket && this.socket.app.activeUrl ? this.socket.app.activeUrl : '')
      })
    }

    this.onSave = () => {
      const {cacheUrls, cacheActiveUrlIndex} = this.state
      if (cacheUrls.length === 0) {
        alert("请至少输入一个URL!")
        return
      }

      const socketId = this.socket.id
      adminIOCmdSocketMsg(socketId, {
        to: 'app',
        cmd: 'setUrls',
        opts: {
          urls: cacheUrls,
          activeUrl: cacheUrls[cacheActiveUrlIndex] ? cacheUrls[cacheActiveUrlIndex] : null
        }
      });

      this.setState({
        edit: false,
        cacheUrls: []
      })
    }

    this.onSaveActiveUrl = () => {
      const {editActiveUrl} = this.state
      if (!isURL(editActiveUrl)) {
        alert('请输入合法的URL')
        return
      }

      const {id, app} = this.socket
      adminIOCmdSocketMsg(id, {
        to: 'app',
        cmd: 'setActiveUrl',
        opts: {
          activeUrl: editActiveUrl
        }
      });

      this.setState({
        edit: false,
        editActiveUrl: ''
      })
    }

    this.onCancelEdit = () => {
      this.setState({
        edit: false,
        cacheUrls: []
      })
    }

    this.onDeleteAll = () => {
      this.setState({
        cacheUrls: [],
        cacheActiveUrlIndex: 0
      })
    }

    this.onSetDefault = (index) => {
      this.setState({
        cacheActiveUrlIndex: index
      })
    }

    this.handleUrlChange = (e) => {
      this.setState({url: e.target.value})
    }

    this.handleActiveUrlChange = (e) => {
      this.setState({editActiveUrl: e.target.value})
    }

    this.onDelete = (index) => {
      let cacheUrls = this.state.cacheUrls.concat()
      const cacheActiveUrlIndex = this.state.cacheActiveUrlIndex
      _.remove(cacheUrls, (item, _i) => {
        return _i === index
      })
      this.setState({
        cacheUrls: cacheUrls
      })

      //已设为默认的url被删除，则重置
      if(cacheActiveUrlIndex == index){
        this.setState({
          cacheActiveUrlIndex: 0
        })
      }
    }

    this.onAddUrl = () => {
      if (!isURL(this.state.url)) {
        alert('请输入合法的URL')
        return
      }

      if (_.indexOf(this.state.cacheUrls, this.state.url) >= 0) {
        alert('当前url已经在列表中，不要重复添加')
        return
      }

      let cacheUrls = this.state.cacheUrls.concat()
      cacheUrls.push(this.state.url)
      this.setState({
        cacheUrls: cacheUrls
      })
    }


    this.onSetActiveUrlRightNow = (_activeUrl) => {
      const socketId = this.socket.id
      //如果未全屏，先设为全屏，再显示activeUrl，反向操作不行
      adminIOCmdSocketMsg(socketId, {
        to: 'app',
        cmd: 'enterFullscreen',
        opts: null
      });

      adminIOCmdSocketMsg(socketId, {
        to: 'app',
        cmd: 'setActiveUrl',
        opts: {
          activeUrl: _activeUrl ? _activeUrl : null
        }
      });
    }

    this.onModifyRefresh = (curRefreshVal) => {
      let stateVal = {
        editRefresh: true,
        editRefreshType: 'none',
        editRefreshVal: {}
      }
      if (curRefreshVal) {
        stateVal.editRefreshType = curRefreshVal.type
        stateVal.editRefreshVal = curRefreshVal.val
      }
      this.setState(stateVal)
    }

    this.handleRefreshTypeChanged = (_type) => {
      this.setState({
        editRefreshType: _type
      })
    }

    this.onConfirmEditRefresh = () => {
      const {editRefreshType, editRefreshVal} = this.state
      let refreshSetting = null
      if (editRefreshType === 'none') {
        refreshSetting = {name:'refresh'}
      }else if (editRefreshType === 'minute') {
        const min = parseInt(editRefreshVal.minute)
        if (!(min > 0 && min < 60)) {
          alert('设定间隔分钟范围为1～59之间')
          return
        }
        refreshSetting = {name:'refresh', value:{cron: '*/'+min+' * * * *'}}
      }else if (editRefreshType === 'hour') {
        const hour = parseInt(editRefreshVal.hour)
        if (!(hour > 0 && hour < 24)) {
          alert('设定间隔小时范围为1～23之间')
          return
        }
        refreshSetting = {name:'refresh', value:{cron:'0 */'+hour+' * * *'}}
      }else {
        const min = parseInt(editRefreshVal.minute)
        if (!(min >= 0 && min < 60)) {
          alert('设定间隔分钟范围为0～59之间')
          return
        }
        const hour = parseInt(editRefreshVal.hour)
        if (!(hour >= 0 && hour < 24)) {
          alert('设定间隔小时范围为0～23之间')
          return
        }
        refreshSetting = {name:'refresh', value:{cron:min+' '+hour+' * * *'}}
      }
      this.onCmdToApp('scheduleJob', refreshSetting)
      this.resetEditRefreshState()
    }

    this.onCancelEditRefresh = () => {
      this.resetEditRefreshState()
    }

    this.resetEditRefreshState = () => {
      this.setState({
        editRefresh: false,
        editRefreshType: 'none',
        editRefreshVal: {}
      })
    }

    this.handleEditTimeChanged = (_type, e) => {
      const {editRefreshVal} = this.state
      editRefreshVal[_type] = e.target.value
      this.setState({
        editRefreshVal: editRefreshVal
      })
    }

    this.onChangeAppMode = (mode) => {
      this.setState({mode})
    }

    this.onToggleDebugPanelForOpenWin = () => {
      this.onCmdToApp('toggleDebugPanelForOpenWin')
    }

    this.onClickScreenShot = () => {
      window.open("/static/imgViewer.html", '_blank')
    }

    this.onEditResolution = (resolution) => {
      this.setState({
        isEditResolution: true,
        editResolution: `${resolution.width}x${resolution.height}`
      })
    }

    this.handlerEditResolutionChange = (e) => {
      this.setState({
        editResolution: e.target.value
      })
    }

    this.onCancelModifyResolution = () => {
      this.setState({
        isEditResolution: false,
        editResolution: ''
      })
    }

    this.getResolutionObj = (_str) => {
      const ary = _str.split('x')
      return {
        width: parseInt(ary[0]),
        height: parseInt(ary[1])
      }
    }

    this.onModifyResolution = (_sockid) => {
      const resolution = this.getResolutionObj(this.state.editResolution)
      this.setState({
        isEditResolution: false,
        editResolution: ''
      })

      adminIOCmdSocketMsg(_sockid, {
        to: 'app',
        cmd: 'setResolution',
        opts: {
          resolution: resolution
        }
      });
    }
  }

  parseCron (exp) {
    //解析后根据下次和下下次两个之间的时间差得到时间设置信息
    let returnType = null
    try {
      let interval = cronParse.parseExpression(exp)
      let nextDate = interval.next()
      let nextDate2 = interval.next()
      let seconds = Math.floor(nextDate2.getTime()/1000) - Math.floor(nextDate.getTime()/1000)
      if (seconds < 3600) {
        returnType = {
          type: 'minute',
          val: {
            minute: Math.floor(seconds/60)
          }
        }
      }
      else if (seconds < 3600 * 24) {
        returnType = {
          type: 'hour',
          val: {
            hour: Math.floor(seconds/3600)          }
        }
      }
      else{
        returnType = {
          type: 'day',
          val: {
            hour: nextDate2.getHours(),
            minute: nextDate2.getMinutes()
          }
        }
      }
    } catch (err) {
      returnType = null
      console.log('[Cron]Error: ', err.message)
    } finally {
      return returnType
    }
  }

  get socket () {
    const mac = this.props.params.mac
    const {sockets} = this.props.data.chatGroups.toJS();

    const socket = _.find(sockets, (socket) => {
      return socket.device.mac === mac
    })

    return socket
  }

  renderDeviceInfo (socket) {
    const {device} = socket
    return (<Panel header={'机器信息'} bsStyle='info'>
          <div bsStyle="link" bsSize="large">
            <div> 机器名: {device.hostname} </div>
            <div> IP地址: {device.ip} </div>
            <div> MAC: {device.mac} </div>
            <div> 操作系统: {device.platform} {device.arch} </div>
            {this.state.isEditResolution ? (
              <div>
                分辨率: 
                <select value={this.state.editResolution} onChange={this.handlerEditResolutionChange}>
                  {
                    DEVICE_RESOLUTION_MODES.map((item, j) => {
                      return (
                        <option key={j} value={item}>{item}</option>
                      )
                    })
                  }
                </select>
                <Button onClick={this.onModifyResolution.bind(this, socket.id)}
                    style={{marginLeft:5}}
                    bsStyle="primary" bsSize="xsmall">确定</Button>
                <Button onClick={this.onCancelModifyResolution}
                    style={{marginLeft:5}} bsSize="xsmall">取消</Button>
              </div>
            ) : (
              <div> 分辨率: {device.resolution.width} x {device.resolution.height}  
                <Button bsStyle="primary" style={{marginLeft:5}} bsSize="xsmall"
                  onClick = {this.onEditResolution.bind(this, device.resolution)}  >
                    修改
                </Button>
              </div>
            )}
          </div>
        </Panel>)
  }

  renderConfigInfo (core) {
    return (<Panel header={'配置信息'} bsStyle='info'>
          <div bsStyle="link" bsSize="large" >
            <div> 所属分组: {core.group} </div>
            <div> 默认启动的APP: {core.appId}</div>
            <div> CORE版本: {core.version}</div>
          </div>
        </Panel>)
  }

  renderCoreInfo (core) {
    console.log('[renderCoreInfo]', core)
    let ops = null
    if (core.appShellRuning) {
      ops = (<div>
                <Button bsStyle="link" bsSize="large"
                  onClick = {this.coreCmdCloseApp}  >
                    关闭APP
                </Button>
                <Button bsStyle="link" bsSize="large"
                  onClick = {this.coreCmdToggleAppDebugPanel}  >
                    切换APP调试窗口
                </Button>
              </div>)
    } else {
      ops = (<div style={{position: 'relative'}}>
                <Button bsStyle="link" bsSize="large"
                  onClick = {this.coreCmdOpenApp }  >
                    打开APP
                </Button>
                <Button bsStyle="link" bsSize="large"
                  onClick = {this.coreCmdUpdateApp }  >
                    升级APP
                </Button>
                <Button bsStyle="link" bsSize="xsmall"
                  style={{position: 'absolute',
                          top: 0, right: 0,
                          opacity: '0.4'}}
                  onClick = {this.coreCmdUpgradeCore }  >
                    升级Core
                </Button>
              </div>)
    }
    return (<Panel header={'APP信息'} bsStyle='info'>
          <div bsStyle="link" bsSize="large" >
            <div> APP版本: {core.appVersion} </div>
            <div> APP: {core.appShellRuning ? '运行中' : '还未启动'} </div>
            {this.state.edit ? null : ops}
          </div>
        </Panel>)
  }

  renderOpActions (socket) {
    const {core, app} = this.socket
    if (this.state.edit) {
      if (this.state.mode === 'advance') {
        return (<div>
              <Button bsStyle="success" bsSize="small" onClick = {this.onSave}  >
                  保存
              </Button>
              <Button bsStyle="warning" bsSize="small"
                      style={{marginLeft:20}} onClick = {this.onDeleteAll}  >
                  删除全部
              </Button>
              <Button bsStyle="danger" bsSize="small"
                      style={{marginLeft:20}} onClick = {this.onCancelEdit}  >
                  取消
              </Button>
            </div>)
      }

      return (
        <div>
          <Button bsStyle="success" bsSize="small" onClick = {this.onSaveActiveUrl}  >
              保存
          </Button>
          <Button bsStyle="danger" bsSize="small"
                  style={{marginLeft:20}} onClick = {this.onCancelEdit}  >
              取消
          </Button>
        </div>
      )

    }

    if (!core.appShellRuning) {
      return null
    }

    return (<div>
            <Button bsStyle="primary" bsSize="small"
                  onClick = {this.state.mode === 'advance' ? this.onEdit : this.onEditActiveUrl}  >
                编辑
            </Button>
          </div>)
  }

  renderAppInfo (app) {
    const {edit, url, cacheUrls, cacheActiveUrlIndex,
          editRefresh, editRefreshType, editRefreshVal, editActiveUrl} = this.state
    console.log('app:', app)
    if (edit) {
      if (this.state.mode === 'advance') {
        return (
          <Panel header={'APP功能'} bsStyle='primary'>
            <Form inline >

              <FormGroup>
                <ControlLabel>编辑urls列表：</ControlLabel>
                <Table responsive>
                  <thead>
                    <tr>
                      <th width="80">编号</th>
                      <th width="500">url</th>
                      <th width="100">操作</th>
                      <th>默认打开</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cacheUrls.map((_url, k) => {
                      return (
                        <tr key={k}>
                          <td>{k+1}</td>
                          <td><a href={_url} target="_blank">{_url}</a></td>
                          <td>
                            <Button bsStyle="warning" bsSize="xsmall"
                              onClick={this.onDelete.bind(this, k)}>删除</Button>
                          </td>
                          <td>{cacheActiveUrlIndex == k ?
                              "默认active url":
                              (<Button onClick={this.onSetDefault.bind(this, k)}
                                bsStyle="primary" bsSize="xsmall">设为默认Active Url</Button>)
                              }
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </Table>
              </FormGroup>

              <br />

              <FormGroup>
                <ControlLabel>输入URL： </ControlLabel>
                <FormControl type="text" placeholder=""
                value={url} onChange={this.handleUrlChange} style={{width:500}} />
              </FormGroup>

              <Button bsStyle="info" style={{marginLeft:20}} onClick={this.onAddUrl}>
                新增
              </Button>
            </Form>
          </Panel>)
      }

      return (
        <Panel header={'APP功能'} bsStyle='primary'>
          <Form inline >
            <FormGroup>
              <ControlLabel>编辑Active URL： </ControlLabel>
              <FormControl type="text" placeholder=""
              value={editActiveUrl} onChange={this.handleActiveUrlChange} style={{width:500}} />
            </FormGroup>
          </Form>
        </Panel>
      )

    }

    if (!app.running) {
      return (<Panel header={'APP功能'} bsStyle='info'>
          <Button bsStyle="link" bsSize="large" onClick = {this.onOpenAppPages.bind(this)} >
              打开网页
          </Button>
          <Button bsStyle="link" bsSize="large" onClick = {this.appCmdClearLocalstorage} >
              清除APP存储信息
          </Button>
        </Panel>)
    }

    let refreshDom = null
    if (editRefresh) {
      refreshDom = (
        <span>
          定时重新打开页面:
          <DropdownButton
              bsStyle='default'
              bsSize="small"
              title={REFRESH_TYPE_TITLE[editRefreshType]}
              style={{minWidth:120, marginLeft:10, marginRight:10}}
              id="socket-detail-refresh-type-split-button">
              {
                ['none', 'minute', 'hour', 'day'].map((_type, i) => {
                  return (
                    <MenuItem key={i} onClick={this.handleRefreshTypeChanged.bind(this, _type)}>
                        {REFRESH_TYPE_TITLE[_type]}
                        {editRefreshType === _type ? CHECK_DOM : null}
                    </MenuItem>
                  )
                })
              }
          </DropdownButton>
          {editRefreshType === 'hour' || editRefreshType === 'day' ? (
            <span>
              <input style={{width:35}} type="text"
                value={editRefreshVal.hour ? editRefreshVal.hour : ''}
                onChange={this.handleEditTimeChanged.bind(this, 'hour')}/>
                时
            </span>
          ) : null}

          {editRefreshType === 'minute' || editRefreshType === 'day' ? (
            <span>
              <input style={{width:35}} type="text"
                  value={editRefreshVal.minute ? editRefreshVal.minute : ''}
                  onChange={this.handleEditTimeChanged.bind(this, 'minute')}/>
                分
            </span>
          ) : null}

          <Button onClick={this.onConfirmEditRefresh}
              style={{marginLeft:10}}
              bsStyle="primary" bsSize="xsmall">确定</Button>
          <Button onClick={this.onCancelEditRefresh}
              style={{marginLeft:10}}
              bsStyle="default" bsSize="xsmall">取消</Button>
        </span>
      )
    }else {
      let curRefreshVal = null
      if (app.scheduleJobs.length > 0) {
        const findJob = _.find(app.scheduleJobs, (_job) => {
          return _job.name === 'refresh'
        })
        if (findJob) {
          curRefreshVal = this.parseCron(findJob.value.cron)
        }
      }
      refreshDom = (
        <span>
          定时重新打开页面: {curRefreshVal ? (
            curRefreshVal.type === 'minute' ? '每'+curRefreshVal.val.minute+'分钟' : (
            curRefreshVal.type === 'hour' ? '每'+curRefreshVal.val.hour+'小时' : '每天'+curRefreshVal.val.hour+'时'+curRefreshVal.val.minute+'分'
            )
          ) : "关闭"}
          <Button onClick={this.onModifyRefresh.bind(this, curRefreshVal)}
              style={{marginLeft:10}} bsStyle="primary" bsSize="xsmall">修改</Button>
        </span>
      )
    }

    return (<Panel header={'APP功能'} bsStyle='info'>
          模式：
          <DropdownButton
              bsStyle='default'
              bsSize="small"
              title={APP_MODES[this.state.mode]}
              style={{minWidth:50}}
              id="socket-detail-split-button-for-mode">
              {
                ['easy', 'advance'].map((_mode, i) => {
                  return (
                    <MenuItem key={i}
                      onClick={this.onChangeAppMode.bind(self, _mode)}>
                        {APP_MODES[_mode]}
                        {_mode === this.state.mode ? CHECK_DOM : null}
                    </MenuItem>
                  )
                })
              }
          </DropdownButton>
          <Button bsStyle="link" bsSize="large" onClick = {this.appCmdReload} >
              重新打开页面
          </Button>
          <Button bsStyle="link" bsSize="large" onClick = {this.appCmdRefresh} >
              刷新(F5)
          </Button>
          <Button bsStyle="link" bsSize="large" onClick = {this.appCmdHardRefresh} >
              强制刷新(Ctrl+F5)
          </Button>
          <Button bsStyle="link" bsSize="large" onClick = {this.appCmdEnterFullscreen} >
              全屏
          </Button>
          <Button bsStyle="link" bsSize="large" onClick = {this.appCmdLeaveFullscreen} >
              退出全屏
          </Button>
          <Button bsStyle="link" bsSize="large" onClick = {this.appCmdClearLocalstorage} >
              清除APP存储信息
          </Button>
          <Button bsStyle="link" bsSize="large" onClick = {this.onClickScreenShot}>
              截屏
          </Button>

          {refreshDom}

          <br />
          {this.state.mode === 'advance' ?
            (app.urls.length > 0 ? (
              <Form inline >

                <FormGroup>
                  <ControlLabel>App切换</ControlLabel>
                  <Table responsive>
                    <thead>
                      <tr>
                        <th width="80">编号</th>
                        <th width="500">url</th>
                        <th>Active Url</th>
                        <th>调试</th>
                      </tr>
                    </thead>
                    <tbody>
                      {app.urls.map((_url, k) => {
                        return (
                          <tr key={k}>
                            <td>{k+1}</td>
                            <td><a href={_url} target="_blank">{_url}</a></td>
                            <td>{_.indexOf(app.urls, app.activeUrl) == k ?
                                "当前 Active Url":
                                (<Button onClick={this.onSetActiveUrlRightNow.bind(this, app.urls[k] ? app.urls[k] : null)}
                                  bsStyle="primary" bsSize="xsmall">设为 Active Url</Button>)
                                }
                            </td>
                            <td>
                              <Button onClick={this.onToggleDebugPanelForOpenWin.bind(this)}
                                  bsStyle="link" bsSize="xsmall">切换调试窗口</Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </Table>
                </FormGroup>
              </Form>
            ) : null) :
          (
            <div style={{marginTop: 10}}>
              当前URL：
              {app.activeUrl ? (<span>
                <a href={app.activeUrl} target="_blank">{app.activeUrl}</a>
                <Button onClick={this.onToggleDebugPanelForOpenWin.bind(this)}
                    bsStyle="link" bsSize="xsmall" style={{marginLeft:30}}>切换调试窗口</Button>
                </span>) : "暂无"}
            </div>
          )
          }
        </Panel>)
  }

  render() {
    if (!this.socket) {
      return null
    }

    console.log('[SocketDetail]: render', this.socket, this.props.params.socketId)

    const {data, actions, pageStore, ...props} = this.props;

    // Your Custom Logic
    const {core, device, app} = this.socket

    return (
      <Panel header={''} bsStyle='primary'>
        {this.renderDeviceInfo(this.socket)}
        {this.renderConfigInfo(core)}
        {this.renderCoreInfo(core)}
        {core.appShellRuning ? this.renderAppInfo(app) : null}
        {this.renderOpActions(this.socket)}
      </Panel>
    );
  }

  componentDidMount() {
    window.addEventListener('message', this.capturePageRecvMsg)
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.capturePageRecvMsg)
  }
}