import React from 'react'

import Modal from 'react-bootstrap/lib/Modal'
import Panel from 'react-bootstrap/lib/Panel'
import Table from 'react-bootstrap/lib/Table'
import Button from 'react-bootstrap/lib/Button'
import Glyphicon from 'react-bootstrap/lib/Glyphicon'
import FormGroup from 'react-bootstrap/lib/FormGroup'
import InputGroup from 'react-bootstrap/lib/InputGroup'
import FormControl from 'react-bootstrap/lib/FormControl'
import Col from 'react-bootstrap/lib/Col'
import DropdownButton from 'react-bootstrap/lib/DropdownButton'
import MenuItem from 'react-bootstrap/lib/MenuItem'
import Badge from 'react-bootstrap/lib/Badge'
import {Link} from 'react-router'

import {isURL} from 'util'
import {DEVICE_RESOLUTION_MODES} from './const'
const _ = require('lodash')

const FILTER_NAME = {
  "IP":         "IP地址"
}

const CHECK_DOM = (
  <span style={{color:"green", marginLeft:10}} className="glyphicon glyphicon-ok"></span>
)


export default class MyModal extends React.Component {
  constructor(props) {
    super(props);

    this.onConfirmMode = () => {
      //valid
      const {editResolutionObj, editUrlObj, checkedObj, editModeName} = this.state
      
      const checkedResolutionObj = {}
      const checkedUrlObj = {}
      const modeName = editModeName
      
      let hasOneChecked = false //是否有一个选中
      let hasInvalidUrl = false //选中的item中是否存在url不合法
      _.forEach(editUrlObj, (value, key) => {
        if (checkedObj[key]) {
          hasOneChecked = true
          if (!value || !isURL(value)) {
            hasInvalidUrl = true
          }
          checkedResolutionObj[key] = editResolutionObj[key]
          checkedUrlObj[key] = value
        }
      });

      if (!hasOneChecked) {
        alert('请选择至少一个!')
        return
      }

      if (hasInvalidUrl) {
        alert('检查url列表，有无效的url')
        return
      }

      if (modeName == '' || modeName == null) {
        alert('模式的名字不能为空')
        return
      }

      const {onConfirmMode} = this.props
      onConfirmMode && onConfirmMode(checkedResolutionObj, checkedUrlObj, modeName)
    }

    this.state = {
      editResolutionObj: {},
      editUrlObj: {},
      checkedObj: {},
      editModeName: '',
      showOnlyChecked: false,

      filterKey: "IP",
      filterValue: ''
    }

    this.handleCheckOnlyChanged = (e) => {
      this.setState({
        showOnlyChecked: e.target.checked
      })
    }

    this.handlerEditResolutionChange = (key, e) => {
      const _resolutionObj = this.state.editResolutionObj
      _resolutionObj[key] = e.target.value

      this.setState({
        editResolutionObj: _resolutionObj
      })
    }

    this.handleEditUrlChange = (key, e) => {
      const _urlObj = this.state.editUrlObj
      _urlObj[key] = e.target.value
      this.setState({
        editUrlObj: _urlObj
      })
    }

    this.handleCheckedObjChange = (key, e) => {
      const _checkedObj = this.state.checkedObj
      _checkedObj[key] = e.target.checked
      this.setState({
        checkedObj: _checkedObj
      })
    }

    this.handleEditModeNameChange = (e) => {
      this.setState({
        editModeName: e.target.value
      })
    }

    this.onCheckOrUncheckAll = (checked) => {
      const {showOnlyChecked} = this.state
      if (showOnlyChecked && checked) {
        return
      }
      const _checkedObj = this.state.checkedObj
      _.forEach(_checkedObj, (value, key) => {
        _checkedObj[key] = checked
      });
      this.setState({
        checkedObj: _checkedObj
      })
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

  }

  //check item is not in filter
  checkItemNotInFilter (text, filterValue) {
    if (typeof text != "string") {
      text = ''
    }
    return text.indexOf(filterValue) < 0
  }

  get curCheckedSocketsCount () {
    const {checkedObj} = this.state
    const filteredChecked = _.filter(checkedObj, (checked) => {
      return checked
    })
    return filteredChecked.length
  }

  get curVisibleSocketsInfo () {
    const {sockets} = this.props
    const {checkedObj, showOnlyChecked,
          filterValue, filterKey} = this.state

    const filteredSockets = []
    _.each(sockets, (socketInfo) => {
      const {socket, ip, resolution, activeUrl} = socketInfo
      const key = ip
      let qualified = true

      if (showOnlyChecked && checkedObj[key] == false) {
        qualified = false
      }

      //filter 
      //tolowercase will better to fiter
      let ipStr = ip,
          resolutionStr = resolution,
          urlStr = activeUrl

      //对根据filter对数据进行过滤
      if (filterValue != '') {
        switch (filterKey) {
          case "IP":
            if (this.checkItemNotInFilter(ipStr, filterValue)) {
              qualified = false
            }
            break;
        }
      }

      if (qualified) {
        filteredSockets.push(socketInfo)
      }
    })
    return filteredSockets
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

  renderFilter () {
    const {showOnlyChecked, filterKey, filterValue} = this.state
    const {sockets} = this.props
    return (
      <Panel>
          <FormGroup>
            <Col xs={5}>
              <InputGroup>
                <DropdownButton
                  componentClass={InputGroup.Button}
                  id="group-modal-save-filter-dropdown"
                  title={FILTER_NAME[filterKey]}>
                  {
                    ["IP"].map((key, i) => {
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
            <Col xs={7}>
              <div style={{marginTop:10}}>
                <Button onClick={this.onCheckOrUncheckAll.bind(this, true)}
                        bsStyle='link'
                        bsSize='small'
                        style={{float:'right',marginTop:'-5px'}}>
                  全选
                </Button>
                <Button onClick={this.onCheckOrUncheckAll.bind(this, false)}
                        bsStyle='link'
                        bsSize='small'
                        style={{float:'right', marginTop:'-5px'}}>
                  取消全选
                </Button>
                <span style={{float:'right'}}>只显示选中</span>
                <input type="checkbox"
                  style={{float:'right'}}
                  checked={showOnlyChecked}
                  onChange={this.handleCheckOnlyChanged}>
                </input>

                <span style={{float:'right',marginRight:20}}>
                  <span>总数: <Badge style={{background:"#337ab7"}}>{sockets.length}</Badge> </span>
                  <span>当前: <Badge style={{background:"#5bc0de"}}>{this.curVisibleSocketsInfo.length}</Badge> </span>
                  <span>已选中: <Badge style={{background:"#5cb85c"}}>{this.curCheckedSocketsCount}</Badge> </span>
                </span>
              </div>
            </Col>
          </FormGroup>
      </Panel>
    )
  }


  render() {
    const {editResolutionObj, editUrlObj, 
          checkedObj, editModeName, showOnlyChecked,
          filterValue, filterKey} = this.state

    const {onHide, onConfirmMode, sockets, modeNameToChange} = this.props

    return (
      <Modal {...this.props} bsSize="large" backdrop={'static'}>
        <Modal.Header closeButton>
          <Modal.Title>保存模式</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {this.renderFilter()}
          <div style={{marginTop:15,height:500,overflow:'scroll',border:'dotted 2px #999'}}>
            <Table responsive>
              <thead>
                <tr>
                  <th width="70">编号 </th>
                  <th width="120">IP地址</th>
                  <th width="130">分辨率</th>
                  <th>Active URL</th>
                  <th width="70">选中</th>
                </tr>
              </thead>
              <tbody>
                {
                  this.curVisibleSocketsInfo.map((socketInfo, i) => {
                    const {socket, ip, index} = socketInfo
                    const key = ip

                    
                    const resolutionDom = (
                      <select value={editResolutionObj[key]} onChange={this.handlerEditResolutionChange.bind(this, key)}>
                        {
                          DEVICE_RESOLUTION_MODES.map((item, j) => {
                            return (
                              <option key={j} value={item}>{item}</option>
                            )
                          })
                        }
                      </select>
                    )

                    const urlDom = (
                      <input style={{width:450}} type="text"
                          value={editUrlObj[key]}
                          onChange={this.handleEditUrlChange.bind(this, key)}/>
                    )
                    return (
                      <tr key = {i}>
                        <td> {index} </td>
                        <td> {filterKey === 'IP' ? this.getFilteredTextDom(ip, filterValue) : ip} </td>
                        <td> {resolutionDom} </td>
                        <td> {urlDom}</td>
                        <td> 
                          <input type="checkbox"
                            checked={checkedObj[key]}
                            onChange={this.handleCheckedObjChange.bind(this, key)}
                            ref={'checkbox'+key}>
                          </input>
                        </td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </Table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          模式名称：<input style={{width:300}} type="text"
                        value={editModeName}
                        onChange={this.handleEditModeNameChange.bind(this)}/>
          <Button onClick={onHide} style={{marginLeft:50}}>取消</Button>
          <Button bsStyle="primary" onClick={this.onConfirmMode}>保存</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  resetState () {
    const {onHide, onConfirmMode, sockets, modeNameToChange} = this.props
    const self = this

    const resolutionObj = {}
    const urlObj = {}
    const checkedObj = {}

    _.each(sockets, (socketInfo) => {
        const {ip, resolution, activeUrl} = socketInfo
        const key = ip
        resolutionObj[key] = resolution
        urlObj[key] = activeUrl
        checkedObj[key] = true
    })

    self.setState({
      editResolutionObj: resolutionObj,
      editUrlObj: urlObj,
      checkedObj: checkedObj,
      editModeName: modeNameToChange ? modeNameToChange : ''
    })
  }

  componentDidUpdate (prevProps, prevState){
    if (this.props.show && !prevProps.show) {
      this.resetState()
    }
  }
}