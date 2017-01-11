import React from 'react';
import ReactDOM from 'react-dom';

import PanelGroup from 'react-bootstrap/lib/PanelGroup'
import Panel from 'react-bootstrap/lib/Panel'
import ModeDetail from './modeDetail'
import Button from 'react-bootstrap/lib/Button'
import Modal from 'react-bootstrap/lib/Modal'
import ModeDiff from './ModeDiff'

const _ = require('lodash')
const FileSaver = require('file-saver')

export default class ModeGroupList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showModal: false,
      importConfig: null
    }

    this.onHideModal = () => {
      this.setState({
        showModal: false
      })
    }

    this.showModal = (importConfig) => {
      this.setState({
        importConfig,
        showModal: true
      })
    }
  }

  onExportModeConfig (groupName) {
    const user = this.props.user.toJS()
    let preference = user.preference ? user.preference : {}
    const modePreference = preference.modePreference ? preference.modePreference : []

    const info = _.find(modePreference, (obj) => {
      return obj.group === groupName
    })

    if (!info) {
      alert("暂无配置信息")
      return
    }

    const blob = new Blob([JSON.stringify(info)], {type: 'application/json'})
    FileSaver.saveAs(blob, `${groupName}-${new Date().toLocaleString()}.json`)
  }

  onClickImport (groupName) {
    const inputFile = this.refs[`file${groupName}`]
    inputFile.click()
  }

  onImportModeConfig (groupName, e) {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }

    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      // 重置file上传，否则选择同一文件不会触发change
      this.refs[`file${groupName}`].value = ''

      const output = e.target.result
      const readConfig = JSON.parse(output)
      if (!readConfig && !readConfig.group) {
        alert("配置文件错误")
        return
      }

      if (readConfig.group !== groupName) {
        alert("不是当前组的配置文件")
        return
      }

      this.showModal(readConfig)
    }
    reader.readAsText(file)
  }

  onConfirmImport () {
    const user = this.props.user.toJS()
    const preference = user.preference || {}
    const modePreference = preference.modePreference || []

    _.remove(modePreference, (obj) => {
      return obj.group === this.state.importConfig.group
    })
    modePreference.push(this.state.importConfig)

    this.props.actions.updatePreferenceAsync('modePreference', modePreference, false)
    alert("导入成功！正在刷新...")
    window.location.reload()
  }

  getDiffModes(prevGroup, nextGroup) {
    // prevGroup必定存在，将prevGroup的modes数组映射为对象
    const prevModesMap = this.mapArray(prevGroup.modes, 'name')
    const nextModesMap = this.mapArray(nextGroup.modes, 'name')

    const modesToCreate = []
    const modesToUpdate = []
    const modesToDelete = []

    nextGroup.modes.forEach((item) => {
      if (!prevModesMap[item.name]) {
        modesToCreate.push(item)
      }
    })

    prevGroup.modes.forEach((item) => {
      if (!nextModesMap[item.name]) {
        modesToDelete.push(item)
      } else if (!_.isEqual(item, nextModesMap[item.name])) {
        item.next = nextModesMap[item.name]
        modesToUpdate.push(item)
      }
    })

    return {
      modesToCreate,
      modesToUpdate,
      modesToDelete
    }
  }

  /**
   * map array by key
   */
  mapArray(array = [], key) {
    const map = {}
    array.forEach((item, index) => {
      map[item[key]] = item
    })
    return map
  }

  renderCompareModesModal () {
    const user = this.props.user.toJS()
    const preference = user.preference || {}
    const modePreference = preference.modePreference || []

    const prevGroup = _.find(modePreference, (obj) => {
      return obj.group === this.state.importConfig.group
    })
    const nextGroup = this.state.importConfig
    const { modesToCreate, modesToUpdate, modesToDelete } = this.getDiffModes(prevGroup, nextGroup)

    return (
      <Modal bsSize="large" backdrop={'static'} show={this.state.showModal}>
        <Modal.Header closeButton>
          <Modal.Title>模式对比</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>确认导入当前模式配置信息？</p>

          <ModeDiff modes={modesToUpdate} title="以下模式将被替换" />
          <ModeDiff modes={modesToCreate} title="以下模式将被新增" />
          <ModeDiff modes={modesToDelete} title="以下模式将被删除" />
        {/*待显示当前模式配置信息和要导入的模式配置信息*/}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.onHideModal} style={{marginLeft:50}}>取消</Button>
          <Button bsStyle="primary" onClick={this.onConfirmImport.bind(this)}>确认导入</Button>
        </Modal.Footer>
      </Modal>
    )
  }

  render() {
    const {actions, user} = this.props
    const userObj = user.toJS()
    const preference = userObj.preference ? userObj.preference : {}
    const modePreference = preference.modePreference ? preference.modePreference : []
    if (modePreference.length === 0) {
      return this.renderEmpty()
    }

    return (
      <PanelGroup defaultActiveKey={0} accordion>
        {modePreference.map((item, i) =>
          <Panel header={'组名:'+item.group} eventKey={i} key={i} bsStyle='info'>
            <Panel header={'功能'} bsStyle='info'>
              <Button bsSize="large"
                  onClick = {this.onExportModeConfig.bind(this, item.group)}  >
                    导出配置
              </Button>
              <Button bsSize="large" style={{marginLeft: 20}}
                  onClick = {this.onClickImport.bind(this, item.group)}  >
                    导入配置
              </Button>
              <input type="file" ref={`file${item.group}`} style={{display: "none"}}
                     onChange={this.onImportModeConfig.bind(this, item.group)} />
            </Panel>
            <ModeDetail modeInfo={item} actions={actions} user={user}/>
          </Panel>
        )}
        {this.state.showModal && this.renderCompareModesModal()}
      </PanelGroup>
    );
  }

  renderEmpty () {
    console.log('[modeManage]: renderEmpty');
    return (<h1>模式信息为空</h1>);
  }

  componentDidMount () {
    this.timer = setTimeout(() => {
      this.forceUpdate()
    }, 3000)
  }

  componentWillUnmount () {
    clearTimeout(this.timer)
  }
}