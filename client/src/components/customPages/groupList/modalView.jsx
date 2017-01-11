import React from 'react'

import Table from 'react-bootstrap/lib/Table'
import Button from 'react-bootstrap/lib/Button'
import Modal from 'react-bootstrap/lib/Modal'
import Badge from 'react-bootstrap/lib/Badge'
import Panel from 'react-bootstrap/lib/Panel'

import {isURL} from 'util'
import {DEVICE_RESOLUTION_MODES} from './const'
const _ = require('lodash')

export default class MyModal extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {onHide, onConfirmApplyMode, modeSocketsInfo, modeNameToView, onDeleteMode} = this.props

    const self = this

    if (!modeNameToView) {
      return null
    }
    return (
      <Modal {...this.props} bsSize="large" backdrop={'static'}>
        <Modal.Header closeButton>
          <Modal.Title>查看模式：{modeNameToView}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Panel>
            <span>
              <span>总数: <Badge style={{background:"#337ab7"}}>{modeSocketsInfo.length}</Badge> </span>
            </span>
        </Panel>

          <div style={{marginTop:15,height:500,overflow:'scroll',border:'dotted 2px #999'}}>
            <Table responsive>
              <thead>
                <tr>
                  <th width="70">编号 </th>
                  <th width="120">IP地址</th>
                  <th width="130">分辨率</th>
                  <th>Active URL</th>
                </tr>
              </thead>
              <tbody>
                {modeSocketsInfo.map((socketInfo, i) => {
                    const {socket, ip, activeUrl, resolution} = socketInfo
                    return (
                      <tr key = {i}>
                        <td> {i+1} </td>
                        <td> {ip} </td>
                        <td> {resolution} </td>
                        <td> {activeUrl}</td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </Table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle="danger" style={{float:'left'}} onClick={onDeleteMode.bind(null, modeNameToView)}>删除</Button>
          <Button onClick={onHide} style={{marginLeft:50}}>取消</Button>
          <Button bsStyle="primary" onClick={onConfirmApplyMode.bind(null, modeNameToView)}>应用模式</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}