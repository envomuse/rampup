import React from 'react';
import './socketList.less'

import Panel from 'react-bootstrap/lib/Panel'
import Table from 'react-bootstrap/lib/Table'
import Button from 'react-bootstrap/lib/Button'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import InputGroup from 'react-bootstrap/lib/InputGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import Col from 'react-bootstrap/lib/Col'
import Modal from 'react-bootstrap/lib/Modal'
import Badge from 'react-bootstrap/lib/Badge'
import DropdownButton from 'react-bootstrap/lib/DropdownButton'
import MenuItem from 'react-bootstrap/lib/MenuItem'
import {Link} from 'react-router'

const _ = require('lodash')

const FILTER_NAME = {
  "IP":         "IP地址",
  "RESOLUTION": "分辨率",
  "URL":        "Active Url",
  "GROUP":      "所属分组"
}

const CHECK_DOM = (
  <span style={{color:"green", marginLeft:10}} className="glyphicon glyphicon-ok"></span>
)

export default class SocketList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editSocketId: null,
      editGroupName: null,
      editNewGroup: false,

      filterKey: "IP", //can be one of the following:IP, RESOLUTION, URL, GROUP
      filterValue: '',
      checkedObj: {}, //加入分组已经选中的item
      showModal: false,
      showOnlyChecked: false, //只显示选中

      editGroupNameForModal: null,
      editNewGroupForModal: false
    }

    //handler for filter event
    this.handlerFilterKeyChanged = (_filterKey) => {
      this.setState({
        filterKey: _filterKey
      })
      this.resetStateForEditGroupName()
    }

    this.handlerFilterValueChanged = (e) => {
      this.setState({
        filterValue: e.target.value.trim() //去除收尾空格
      })
      this.resetStateForEditGroupName()
    }

    //handler for edit group name in item select 
    this.resetStateForEditGroupName = () => {
      this.setState({
        editSocketId: null,
        editGroupName: '',
        editNewGroup: false
      })
    }

    this.handlerEditGroup = (_socket) => {
      this.setState({
        editSocketId: _socket.id,
        editGroupName: _socket.groupId ? _socket.groupId : null,
        editNewGroup: false
      })
    }

    this.handlerEditGroupChange = (e) => {
      this.setState({
        editGroupName: e.target.value
      })
    }

    this.handlerModifyGroupName = (_sockid) => {
      //send cmd to change group
      const {editGroupName} = this.state
      if (!editGroupName || editGroupName === '') {
        alert('分组名称不能为空!')
        return
      }
      this.sendCmdToSingleApp(_sockid, 'changeGroup', {group: editGroupName})
      this.resetStateForEditGroupName()
    }

    this.handlerCancelModifyGroupName = () => {
      this.resetStateForEditGroupName()
    }

    this.handlerNewGroupChanged = (e) => {
      this.setState({
        editGroupName: e.target.value
      })
    }

    this.handlerNewGroupName = () => {
      this.setState({
        editNewGroup:true
      })
    }

    this.handleCheckChanged = (ip, e) => {
      const {checkedObj} = this.state
      checkedObj[ip] = e.target.checked
      this.setState({
        checkedObj: checkedObj
      })
    }

    this.handleJoinToGroup = (socketList) => {
      //send cmd to change group
      const {editGroupNameForModal} = this.state
      if (!editGroupNameForModal || editGroupNameForModal === '') {
        alert('分组名称不能为空!')
        return
      }
      _.each(socketList, (_socket) => {
        this.sendCmdToSingleApp(_socket.id, 'changeGroup', {group: editGroupNameForModal})
      })
      this.hideJoinGroupModal()
    }

    this.showJoinGroupModal = () => {
      const curCheckedSockets = this.curCheckedSockets
      if (curCheckedSockets.length === 0) {
        alert('当前没有选中的PC, 请至少选择一个!')
        return
      }

      const {data} = this.props;
      const {groups} = data.chatGroups.toJS();

      let defaultGroupName = ''
      if (curCheckedSockets.length > 0) {
        defaultGroupName = curCheckedSockets[0].groupId
      }else if (groups.length > 0) {
        defaultGroupName = groups[0].name
      }

      this.setState({
        showModal: true,
        editNewGroupForModal: false,
        editGroupNameForModal: defaultGroupName
      })
      this.resetStateForEditGroupName()
    }

    this.hideJoinGroupModal = () => {
      this.setState({
        showModal:false
      })
    }

    this.handleShowOnlyCheckedChanged = (e) => {
      this.setState({
        showOnlyChecked: e.target.checked
      })
      this.resetStateForEditGroupName()
    }

    this.handlerEditGroupChangeForModal = (e) => {
      this.setState({
        editGroupNameForModal: e.target.value
      })
    }
    this.handlerNewGroupNameForModal = (val) => {
      this.setState({
        editNewGroupForModal:val
      })
    }
    this.handlerNewGroupChangedForModal = (e) => {
      this.setState({
        editGroupNameForModal: e.target.value
      })
    }

    this.onCheckOrUncheckAll = (checked) => {
      const {showOnlyChecked} = this.state
      if (showOnlyChecked && checked) {
        return
      }
      const _checkedObj = this.state.checkedObj
      _.each(this.filteredSocketsInfo, (_socketInfo) => {
        const {socket} = _socketInfo
        _checkedObj[socket.device.ip] = checked
      })
      
      this.setState({
        checkedObj: _checkedObj
      })
    }

    const adminIOCmdSocketMsg = this.props.actions.adminIOCmdSocketMsg

    this.sendCmdToSingleApp = (sockid, cmd, opts) => {
      console.log('socket onCmdToApp:', cmd, opts)
      adminIOCmdSocketMsg(sockid, {
        to: 'core',
        cmd,
        opts
      });
    }
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

  //check item is not in filter
  checkItemNotInFilter (text, filterValue) {
    if (typeof text != "string") {
      text = ''
    }
    return text.indexOf(filterValue) < 0
  }

  get allSockets () {
    const {data} = this.props;
    let {sockets} = data.chatGroups.toJS();
    sockets = _.filter(sockets, {'role': 'guest'})
    return sockets ? sockets : []
  }

  get curCheckedSockets () {
    const {checkedObj} = this.state
    const checkedSockets = []
    _.each(this.allSockets, (_socket) => {
      if (!!checkedObj[_socket.device.ip]) {
        checkedSockets.push(_socket)
      }
    })
    return checkedSockets
  }

  get filteredSocketsInfo () {
    const {filterKey, filterValue, showOnlyChecked, checkedObj} = this.state
    const {data} = this.props;
    let {sockets} = data.chatGroups.toJS();
    sockets = _.filter(sockets, {'role': 'guest'})

    const filteredSockets = []
    _.each(sockets, (socket, index) => {
      let ip = socket.device.ip,
          resolution = `${socket.device.resolution.width} x ${socket.device.resolution.height}`,
          url = socket.app.activeUrl,
          group = socket.groupId

      let qualified = true
      const info = {
        socket: socket,
        filter: {},
        index: index
      }

      if (showOnlyChecked && !checkedObj[socket.device.ip]) {
        qualified = false
      }

      //对根据filter对数据进行过滤，同时给item中和filter相等的字符串加上红色标记
      if (filterValue != '') {
        switch (filterKey) {
          case "IP":
            if (this.checkItemNotInFilter(ip, filterValue)) {
              qualified = false
            }
            info.filter = {
              ip: ip
            }
            break;
          case "RESOLUTION":
            if (this.checkItemNotInFilter(resolution, filterValue)) {
              qualified = false
            }
            info.filter = {
              resolution: resolution
            }
            break;
          case "URL":
            if (this.checkItemNotInFilter(url, filterValue)) {
              qualified = false
            }
            info.filter = {
              url: url
            }
            break;
          case "GROUP":
            if (this.checkItemNotInFilter(group, filterValue)) {
              qualified = false
            }
            info.filter = {
              group: group
            }
            break;
        }
      }
      if (qualified) {
        filteredSockets.push(info)
      }
    })
    return filteredSockets
  }

  renderFilter () {
    const {filterKey, filterValue, showOnlyChecked} = this.state
    return (
      <Panel bsStyle='info'>
          <FormGroup>
            <Col xs={4}>
              <InputGroup>
                <DropdownButton
                  componentClass={InputGroup.Button}
                  id="socketList-filter-dropdown"
                  title={FILTER_NAME[filterKey]}>
                  {
                    ["IP", "RESOLUTION", "URL", "GROUP"].map((key, i) => {
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
            <Col xs={8}>
              <span style={{lineHeight:"34px"}}>
                <span>总数: <Badge style={{background:"#337ab7"}}>{this.allSockets.length}</Badge> </span>
                <span>当前: <Badge style={{background:"#5bc0de"}}>{this.filteredSocketsInfo.length}</Badge> </span>
                <span>已选中: <Badge style={{background:"#5cb85c"}}>{this.curCheckedSockets.length}</Badge> </span>
              </span>
              <span>
                <input type="checkbox"
                  style={{marginLeft:15, marginTop:9}}
                  checked={showOnlyChecked}
                  onChange={this.handleShowOnlyCheckedChanged}>
                </input>
                <span style={{marginLeft:5}}>只显示选中</span>
              </span>

              <Button onClick={this.onCheckOrUncheckAll.bind(this, true)}
                      bsStyle='link'
                      bsSize='small'>
                全选
              </Button>
              <Button onClick={this.onCheckOrUncheckAll.bind(this, false)}
                      bsStyle='link'
                      bsSize='small'>
                取消全选
              </Button>

              <Button bsStyle='default' style={{marginLeft:10}}
                      onClick={this.showJoinGroupModal}>把选中PC加入分组...</Button>
            </Col>
          </FormGroup>
      </Panel>
    )
  }

  renderList () {
    const {data, actions, pageAction, pageStore, ...props} = this.props;
    let {sockets, groups} = data.chatGroups.toJS();
    sockets = _.filter(sockets, {'role': 'guest'})
    
    const self = this
    const {editSocketId, editGroupName, editNewGroup, filterValue, filterKey, checkedObj} = this.state

    return (
      <Table responsive>
          <thead>
            <tr>
              <th width="60">编号 </th>
              <th width="110">IP地址</th>
              <th width="120">分辨率</th>
              <th>Active Url</th>
              <th>URLS</th>
              <th width='200'>所属分组</th>
              <th>版本(C/A)</th>
              <th>操作 </th>
              <th width="60">选中 </th>
            </tr>
          </thead>
          <tbody>
            {
              this.filteredSocketsInfo.map((socketInfo, i) => {
                const {socket, filter, index} = socketInfo

                const info = {
                  ip: socket.device.ip,
                  resolution: `${socket.device.resolution.width} x ${socket.device.resolution.height}`,
                  url: socket.app.activeUrl,
                  group: socket.groupId
                }
                  
                _.forEach(filter, (_value, _key) => {
                  const flagedDom = this.getFilteredTextDom(_value, filterValue)
                  info[_key] = flagedDom ? flagedDom : _value
                })
                
                const groupDom = (socket.id == editSocketId ? (
                    <div>
                      {editNewGroup ? (
                        <span>
                          <input style={{width:140, marginBottom:10}} type="text"
                              value={editGroupName}
                              onChange={this.handlerNewGroupChanged}/>
                          <br />
                        </span>
                      ) : (
                        <span>
                          <select style={{minWidth:140, marginBottom:10}} value={editGroupName ? editGroupName : '暂无分组'} 
                            onChange={this.handlerEditGroupChange}>
                            {
                              groups.map((g, j) => {
                                return (
                                  <option key={j} value={g.name}>{g.name}</option>
                                )
                              })
                            }
                          </select>

                          <br />
                          <Button onClick={this.handlerNewGroupName}
                            bsStyle="info"
                            bsSize="xsmall">新建分组</Button>
                        </span>
                      )}
                      
                      <Button onClick={this.handlerModifyGroupName.bind(this, socket.id)}
                          style={{marginLeft:5}}
                          bsStyle="primary"
                          bsSize="xsmall">确定</Button>
                      <Button onClick={this.handlerCancelModifyGroupName}
                          style={{marginLeft:5}}
                          bsSize="xsmall">取消</Button>
                    </div>
                  ) : (
                    <div onClick={this.handlerEditGroup.bind(this, socket)}>
                      {(socket.groupId && socket.groupId != '') ? info.group : '暂无分组'}
                      <Button bsStyle="primary"
                          style={{marginLeft:5}}
                          onClick={this.handlerEditGroup.bind(this, socket)}
                          bsSize="xsmall">
                        {(socket.groupId && socket.groupId != '') ? '修改' : '添加'}
                      </Button>
                    </div>
                  )
                )
                
                return (
                  <tr key = {i}>
                    <td> {index+1} </td>
                    <td> {info.ip} </td>
                    <td> {info.resolution} </td>
                    <td> <a href={socket.app.activeUrl} target='_blank'> {info.url} </a></td>
                    <td> {socket.app.urls.length} </td>
                    <td> {groupDom}</td>
                    <td> {`${socket.core.version}/${socket.core.appVersion}`}</td>
                    <td>
                      <Button bsStyle="link" bsSize="xsmall">
                        <Link to={`/socket_detail/${socket.device.mac}`}>
                          <Glyphicon glyph="arrow-right" /> 查看详细 
                        </Link>
                      </Button>
                    </td>
                    <td>
                     {<input type="checkbox"
                          checked={!!checkedObj[socket.device.ip]}
                          onChange={this.handleCheckChanged.bind(this, socket.device.ip)}>
                        </input>
                      }
                    </td>
                  </tr>
                )
              })
            }
          </tbody>
        </Table>
    )
  }

  renderJoinGroupModal () {
    const {data} = this.props;
    const {groups} = data.chatGroups.toJS();

    const {showModal, editNewGroupForModal, editGroupNameForModal} = this.state
    const curCheckedSockets = this.curCheckedSockets

    return (
      <Modal bsSize="large" aria-labelledby="contained-modal-title-lg" show={showModal} backdrop={'static'}>
        <Modal.Header closeButton>
          <Modal.Title id="socketlist-modal-title-lg">加入分组</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Panel>
            <span>
              <span>总数: <Badge style={{background:"#337ab7"}}>{curCheckedSockets.length}</Badge> </span>
            </span>
          </Panel>

          <div style={{marginTop:15,height:500,overflow:'scroll',border:'dotted 2px #999'}}>
            <Table responsive>
              <thead>
                <tr>
                  <th width="70">编号 </th>
                  <th width="120">IP地址</th>
                  <th width="130">当前分组</th>
                </tr>
              </thead>
              <tbody>
                {curCheckedSockets.map((socket, i) => {
                    return (
                      <tr key = {i}>
                        <td> {i+1} </td>
                        <td> {socket.device.ip} </td>
                        <td> {socket.groupId} </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </Table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          {editNewGroupForModal ? (
            <span>
              请输入加入新分组名称：
              <input style={{width:140, marginBottom:10}} type="text"
                  value={editGroupNameForModal}
                  onChange={this.handlerNewGroupChangedForModal}/>
              <Button onClick={this.handlerNewGroupNameForModal.bind(this, false)}
                bsStyle="info" bsSize="xsmall" style={{marginLeft:15}}>选择现有</Button>
            </span>
          ) : (
            <span>
              请选择要加入的分组：
              <select style={{minWidth:140, marginBottom:10}} value={editGroupNameForModal} 
                onChange={this.handlerEditGroupChangeForModal}>
                {
                  groups.map((g, j) => {
                    return (
                      <option key={j} value={g.name}>{g.name}</option>
                    )
                  })
                }
              </select>
              <Button onClick={this.handlerNewGroupNameForModal.bind(this, true)}
                bsStyle="info" bsSize="xsmall" style={{marginLeft:15}}>新建分组</Button>
            </span>
          )}
          <Button style={{marginLeft:50}} onClick={this.hideJoinGroupModal}>取消</Button>
          <Button bsStyle="primary" onClick={this.handleJoinToGroup.bind(this, curCheckedSockets)}>确认</Button>
        </Modal.Footer>
      </Modal>
    )
  }

  render() {
    console.log('[socketList]: render')

    const {data} = this.props;

    // Your Custom Logic
    let {sockets} = data.chatGroups.toJS();
    sockets = _.filter(sockets, {'role': 'guest'})
    if (sockets.length === 0) {
      return this.renderEmpty();
    }

    return (
      <Panel header={'已连接客户端'} bsStyle='info'>
        {this.renderFilter()}
        {this.renderList()}
        {this.renderJoinGroupModal()}
      </Panel>
    )
  }

  renderEmpty () {
    console.log('[socketList]: renderEmpty');
    return (<h1>没有客户端连接</h1>);
  }

  componentWillMount() {
    console.log('[socketList]: componentWillMount')
  }

  componentDidMount() {
    console.log('[socketList]: componentDidMount');
  }

  componentWillUnmount() {
    console.log('[socketList]: componentWillUnmount');
  }
}