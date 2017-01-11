'use strict';

import React from 'react';
import ReactDOM from 'react-dom'
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar'
import Button from 'react-bootstrap/lib/Button'
import Modal from 'react-bootstrap/lib/Modal'
import Panel from 'react-bootstrap/lib/Panel'

import './imgViewer.less';

const _ = require('lodash')
const FileSaver = require('file-saver')
const Viewer = require('viewerjs')
const uuid = require('uuid')
require('viewerjs/dist/viewer.css')

const MSGS = ["sic3shell_img_viewer_sockets"]

export default class ImgViewer extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dataLen: -1
    }
    
    this.dataLenCur = 0
    this.capturePageRecvMsg = (event) => {
      if(!event.data.cmd) return;
      if(MSGS.indexOf(event.data.cmd) < 0) return;
      if(event.data.cmd === "sic3shell_img_viewer_sockets") {
        if (event.data.uuid !== this.uuid) {
          return
        }

        if (this.state.dataLen < 0) {
          this.setState({
            dataLen: event.data.dataLen
          })
        }

        this.drawImage(event.data.captureData, event.data.showOnlySage)
        this.dataLenCur++
        if (this.state.dataLen === this.dataLenCur) {
          window.removeEventListener('message', this.capturePageRecvMsg)
          this.parentWindow.postMessage({cmd: "sic3shell_img_viewer_finished", uuid: this.uuid}, '*')
        }
      }
    }

    this.drawImage = (data, showOnlySage) => {
      //check url info valid and get clientID
      console.log("[showOnlySage]:", showOnlySage)
      let clientID = 0
      if (showOnlySage) {
        const info = data.url.split("?clientID=")
        if (info.length !== 2) {
          return
        }
        clientID = parseInt(info[1], 10)
      }
    
      const imgObj = new Image()
      imgObj.src = data.imgData
      imgObj.onload = () => {
        if (this.state.dataLen <= 1) {
          this.ctx.drawImage(imgObj, 0, 0, 1400, 1050)
        }else {
          this.ctx.drawImage(imgObj, (clientID % 7) * 1400, (Math.floor(clientID / 7)) * 1050, 1400, 1050)
        }
      }
    }

    this.onSaveImg = () => {
      this.canvas.toBlob(function(blob) {
        FileSaver.saveAs(blob, `screenshot-${new Date().toLocaleString()}.png`)
      });
    }

    this.createImgViewer = () => {
      const imgDom = ReactDOM.findDOMNode(this.refs.img)
      imgDom.src = this.canvas.toDataURL("image/png")
      if (!this.viewer) {
        this.viewer = new Viewer(imgDom, {
          inline: false,
          navbar: false,
          title: false,
          toolbar: true
        })
      }
    }

    this.onClickCanvas = () => {
      if (!this.viewer) {
        this.createImgViewer()
      }
      this.viewer.show()
    }
  }

  get canvas () {
    return ReactDOM.findDOMNode(this.refs.canvas)
  }

  get ctx () {
    return this.canvas.getContext('2d')
  }

  render() {
    const sizeinfo = this.state.dataLen <= 1 ? {
      width: "1400",
      height: "1050"
    } : {
      width: "9800",
      height: "3150"
    }

    return (
      <Panel>
          <Panel>
            <ButtonToolbar>
              <Button bsStyle="primary" bsSize="small" onClick = {this.onSaveImg} >
                  保存截屏
              </Button>
              <span style={{marginLeft: 20, marginTop: 10}}>截屏时间：{new Date().toLocaleString()}</span>
            </ButtonToolbar>
          </Panel>
          <canvas onClick={this.onClickCanvas} ref="canvas" width={sizeinfo.width} height={sizeinfo.height}
            style={{width: "100%", height: "100%", cursor: "zoom-in"}} />
          <div style={{width: 1, height: 1, overflow: 'hidden', position: 'absolute', left: 0, top: 0}}>
            <img style={{width: 1, height:1}} ref="img" />
          </div>
      </Panel>
    )
  }

  componentDidMount() {
    window.addEventListener('message', this.capturePageRecvMsg)
    if (window.opener) {
      this.uuid = uuid.v1()
      this.parentWindow = window.opener
      this.parentWindow.postMessage({cmd: "sic3shell_img_viewer_ready", uuid: this.uuid}, '*')
    }
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.capturePageRecvMsg)
  }
}
