import React from 'react';

import Panel from 'react-bootstrap/lib/Panel'
import Tab from 'react-bootstrap/lib/Tab'
import Row from 'react-bootstrap/lib/Row'
import Col from 'react-bootstrap/lib/Col'
import Nav from 'react-bootstrap/lib/Nav'
import NavItem from 'react-bootstrap/lib/NavItem'
import Table from 'react-bootstrap/lib/Table'
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar'
import Button from 'react-bootstrap/lib/Button'

import {isURL} from 'util'
import {DEVICE_RESOLUTION_MODES} from '../groupList/const'
const isIp = require('is-ip')
const _ = require('lodash')

const generateRandomKey = () => {
  return new Date().getTime() + '' + Math.random()
}

export default class ModeDetail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isEdit: false,
      curSelectMode: this.props.modeInfo.modes.length > 0 ?
                     this.props.modeInfo.modes[0].name : null,
      editConfig: []
    }

    this.onSelectMode = (modeName) => {
      this.setState({
        isEdit: false,
        curSelectMode: modeName
      })
    }

    this.onEdit = () => {
      const curMode = _.find(this.props.modeInfo.modes, (mode) => {
        return (mode.name === this.state.curSelectMode)
      })
      const editConfig = curMode.config.map((config) => {
        return {
          key: generateRandomKey(),
          ip: config.ip,
          activeUrl: config.activeUrl,
          resolution: config.resolution
        }
      })
      this.setState({
        isEdit: true,
        editConfig
      })
    }

    this.onSave = () => {
      const {editConfig, curSelectMode} = this.state
      //check all ip valid
      const findInvalidIP = _.find(editConfig, (item) => {
        return !isIp.v4(item.ip)
      })
      if (findInvalidIP) {
        alert("输入ip有误，请检查ip")
        return
      }

      //check all urls valid
      const findInvalidUrl = _.find(editConfig, (item) => {
        return !isURL(item.activeUrl)
      })
      if (findInvalidUrl) {
        alert("输入url有误，请检查url")
        return
      }

      //check whether there are two ips that are same
      const ips = []
      const uniqIps = _.uniqBy(ips, 'ip')
      if (uniqIps.length < ips.length) {
        alert("ip有重复，请保持每个ip唯一")
        return
      }

      if (editConfig.length === 0) {
        alert("请至少输入一条记录")
        return
      }

      //save mode config
      console.log("[EditConfig]:", editConfig)

      const configToSave = editConfig.map((conf) => {
        return {
          ip: conf.ip,
          activeUrl: conf.activeUrl,
          resolution: conf.resolution
        }
      })

      const newModes = this.props.modeInfo.modes.map((mode) => {
        if (mode.name === curSelectMode) {
          mode.config = configToSave
        }
        return mode
      })

      const {modeInfo} = this.props
      const user = this.props.user.toJS()
      let preference = user.preference ? user.preference : {}
      const modePreference = preference.modePreference ? preference.modePreference : []

      const info = _.remove(modePreference, (obj) => {
        return obj.group === modeInfo.group
      })
      const currentGroupInfo = (info.length > 0 ? info[0] : {group : modeInfo.group})
      currentGroupInfo.modes = newModes

      modePreference.push(currentGroupInfo)

      this.props.actions.updatePreferenceAsync('modePreference', modePreference, false)

      //exit edit mode
      this.setState({
        isEdit: false
      })
    }

    this.onCancel = () => {
      this.setState({
        isEdit: false
      })
    }

    this.onAdd = () => {
      const {editConfig} = this.state
      editConfig.push({
        key: generateRandomKey(),
        ip: '',
        activeUrl: '',
        resolution: DEVICE_RESOLUTION_MODES[0]
      })
      this.setState({editConfig})
    }

    this.onDelete = (key) => {
      const {editConfig} = this.state
      _.remove(editConfig, (config) => {
        return config.key === key
      })
      this.setState({editConfig})
    }

    this.handleEditConfigChange = (key, type, e) => {
      const {editConfig} = this.state
      const newConfig = editConfig.map((config) => {
        if (config.key === key) {
          config[type] = e.target.value
        }
        return config
      })
      this.setState({
        editConfig: newConfig
      })
    }

    this.onCreateMode = () => {
      const {modeInfo} = this.props
      const newModeName = prompt("请输入新模式名称:")
      if (!newModeName || newModeName === '') {
        return
      }
      const existMode = _.find(modeInfo.modes, (mode) => {
        return mode.name === newModeName
      })
      if (existMode) {
        alert("模式名称已经存在！")
        return
      }

      const user = this.props.user.toJS()
      let preference = user.preference ? user.preference : {}
      const modePreference = preference.modePreference ? preference.modePreference : []

      const info = _.remove(modePreference, (obj) => {
        return obj.group === modeInfo.group
      })
      const currentGroupInfo = (info.length > 0 ? info[0] : {group: modeInfo.group, modes: []})
      currentGroupInfo.modes.push({name: newModeName, config: []})
      modePreference.push(currentGroupInfo)
      this.props.actions.updatePreferenceAsync('modePreference', modePreference, false)

      this.forceUpdate()
    }

    this.onDuplicateMode = () => {
      const {modeInfo} = this.props
      const newModeName = prompt("请输入新模式名称:")
      if (!newModeName || newModeName === '') {
        return
      }
      const existMode = _.find(modeInfo.modes, (mode) => {
        return mode.name === newModeName
      })
      if (existMode) {
        alert("模式名称已经存在！")
        return
      }

      const curMode = _.find(modeInfo.modes, (mode) => {
        return (mode.name === this.state.curSelectMode)
      })
      const configToDuplicate = curMode.config.map((config) => {
        return {
          ip: config.ip,
          activeUrl: config.activeUrl,
          resolution: config.resolution
        }
      })

      const user = this.props.user.toJS()
      let preference = user.preference ? user.preference : {}
      const modePreference = preference.modePreference ? preference.modePreference : []

      const info = _.remove(modePreference, (obj) => {
        return obj.group === modeInfo.group
      })
      const currentGroupInfo = (info.length > 0 ? info[0] : {group: modeInfo.group, modes: []})
      currentGroupInfo.modes.push({name: newModeName, config: configToDuplicate})
      modePreference.push(currentGroupInfo)
      this.props.actions.updatePreferenceAsync('modePreference', modePreference, false)

      this.forceUpdate()
    }

    this.onRemoveMode = () => {
      if (!window.confirm('模式删除后无法恢复，确定删除该模式吗？')) {
        return
      }

      const {modeInfo} = this.props
      const user = this.props.user.toJS()
      let preference = user.preference ? user.preference : {}
      const modePreference = preference.modePreference ? preference.modePreference : []

      const info = _.remove(modePreference, (obj) => {
        return obj.group === modeInfo.group
      })
      const currentGroupInfo = (info.length > 0 ? info[0] : {group: modeInfo.group, modes: []})
      _.remove(currentGroupInfo.modes, (mode) => {
        return mode.name === this.state.curSelectMode
      })
      modePreference.push(currentGroupInfo)
      this.props.actions.updatePreferenceAsync('modePreference', modePreference, false)

      this.forceUpdate()
    }
  }

  render() {
    const {modeInfo} = this.props
    const {isEdit, editConfig, curSelectMode} = this.state

    if (modeInfo.modes.length === 0) {
      return (
        <Button bsStyle="success"
          bsSize="small"
          style={{width: 100}}
          onClick = {this.onCreateMode} >
        创建新模式
        </Button>
      )
    }

    return (
      <div style={{minHeight: 500, marginTop: 20}}>
        <Tab.Container id="modeDetail-left-tabs"
            defaultActiveKey={modeInfo.modes.length > 0 ? modeInfo.modes[0].name : ''}>
          <Row className="clearfix">
            <Col sm={4}>
              <Nav bsStyle="pills" stacked
                   onSelect={this.onSelectMode}>
                {modeInfo.modes.map((mode, i) => {
                    return (
                      <NavItem eventKey={mode.name} key={i}
                               active={mode.name === curSelectMode}>
                        {mode.name}
                      </NavItem>
                    )
                })}
              </Nav>
            </Col>
            <Col sm={8}>
              <Tab.Content animation>
                {modeInfo.modes.map((mode, j) => {
                  return (
                    <Tab.Pane eventKey={mode.name} key={j}>
                      {isEdit ? (
                        <ButtonToolbar>
                           <Button bsStyle="success"
                              bsSize="small"
                              style={{marginBottom: 20, width: 100}}
                              onClick = {this.onSave} >
                            保存模式
                            </Button>
                            <Button bsStyle="danger"
                              bsSize="small"
                              style={{marginLeft: 15, marginBottom: 20, width: 100}}
                              onClick = {this.onCancel} >
                            取消
                            </Button>
                            <Button bsStyle="primary"
                              bsSize="small"
                              style={{marginLeft: 15, marginBottom: 20, width: 100, float: 'right'}}
                              onClick = {this.onAdd} >
                            新增PC
                            </Button>
                        </ButtonToolbar>
                      ): (
                        <ButtonToolbar>
                           <Button bsStyle="primary"
                              bsSize="small"
                              style={{marginBottom: 20, width: 100}}
                              onClick = {this.onEdit} >
                            编辑模式
                            </Button>
                            <Button bsStyle="success"
                              bsSize="small"
                              style={{marginBottom: 20, marginLeft: 15, width: 100}}
                              onClick = {this.onCreateMode} >
                            创建新模式
                            </Button>
                            <Button bsStyle="info"
                              bsSize="small"
                              style={{marginBottom: 20, marginLeft: 15, width: 100}}
                              onClick = {this.onDuplicateMode} >
                            复制当前模式
                            </Button>
                            <Button bsStyle="danger"
                              bsSize="small"
                              style={{marginBottom: 20, marginLeft: 15, width: 100, float: 'right'}}
                              onClick = {this.onRemoveMode} >
                            删除模式
                            </Button>
                        </ButtonToolbar>
                      )}
                      <Table responsive>
                        <thead>
                          <tr>
                            <th width="140">IP地址</th>
                            <th>Active URL</th>
                            <th>分辨率</th>
                            {isEdit ? <th>操作</th> : null}
                          </tr>
                        </thead>
                        {
                          isEdit ? (
                          <tbody>{
                            editConfig.map((config, k) => {
                              return (
                                <tr key={k}>
                                  <td>
                                    <input style={{width: "100%"}} type="text"
                                      value={config.ip}
                                      onChange={this.handleEditConfigChange.bind(this, config.key, 'ip')}/>
                                  </td>
                                  <td>
                                    <input style={{width: "100%"}} type="text"
                                      value={config.activeUrl}
                                      onChange={this.handleEditConfigChange.bind(this, config.key, 'activeUrl')}/>
                                  </td>
                                  <td>
                                    <select value={config.resolution}
                                            onChange={this.handleEditConfigChange.bind(this, config.key, 'resolution')}>
                                      {
                                        DEVICE_RESOLUTION_MODES.map((item, m) => {
                                          return (
                                            <option key={m} value={item}>{item}</option>
                                          )
                                        })
                                      }
                                    </select>
                                  </td>
                                  <td>
                                    <Button bsStyle="danger"
                                      bsSize="small"
                                      onClick = {this.onDelete.bind(this, config.key)} >
                                    删除
                                    </Button>
                                  </td>
                                </tr>
                              )
                            })
                          }</tbody>
                          ) : (
                          <tbody>
                          {
                            mode.config.map((config, k) => {
                              return (
                                <tr key={k}>
                                  <td>{config.ip}</td>
                                  <td>{config.activeUrl}</td>
                                  <td>{config.resolution}</td>
                                </tr>
                              )
                            })
                          }
                          </tbody>)
                        }
                      </Table>
                    </Tab.Pane>
                  )
                })}
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </div>
    );
  }
}