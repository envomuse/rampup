import {DEV_MODE} from 'common/const'

import React from 'react'
import { render } from 'react-dom'

require('expose?React!react');

import CoreUI from './core_ui'

import gConfig from './config'
import gDevice from './device'
import AppMgr from './app_mgr'
import BackendAgent from './backend_agent'

import setupBackendAgentMock from './test.js'

import {remote} from 'electron'

const gBackendAgent = new BackendAgent(gConfig.server, {
  group: gConfig.group
})
const gAppMgr = new AppMgr(gConfig, gBackendAgent)
console.log(';gDevice', gDevice)
// add react div to body
const reactContentWrap = document.createElement('div');
document.body.appendChild(reactContentWrap);

const coreProps = {
  appMgr: gAppMgr,
  device: gDevice,
  backendAgent: gBackendAgent
}
render(<CoreUI {...coreProps}/>, reactContentWrap);

if (DEV_MODE) {
  remote.getCurrentWebContents().openDevTools()
}
setupBackendAgentMock(gBackendAgent)
