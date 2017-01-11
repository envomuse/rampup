import "babel-polyfill";

import {DEV_MODE} from 'common/const'

import React from 'react'
import { render } from 'react-dom'

const Promise = require("bluebird");
const path = require('path')
const fs = require('fs')

Promise.promisifyAll(fs);

import {CoreBroker} from 'common/message'
import './test'

import ProtocolMgr from './protocol_mgr'
import DBMgr from './db_mgr';
import App from './app.js'

const DevMusicFolder = '/Users/walton/AliDrive/03-Personal/01-娱乐'
const musicAssetsFolder = DEV_MODE ? DevMusicFolder : path.join(process.cwd(), 'runtime/music')
const dbFolder = path.join(process.cwd(), 'runtime/db')

function onReady (error) {
  if (error) {
    console.error('Failed to register protocol', error)
    return
  }

  console.log('Let me start',  process.cwd())

  const reactContentWrap = document.createElement('div');
  document.body.appendChild(reactContentWrap);

  const dbMgr = new DBMgr(dbFolder)

  window.gApp = render(<App dbMgr={dbMgr} protocolMgr={protocolMgr}/>, reactContentWrap);

  window.gApp.setupCoreBroker(new CoreBroker())

  gApp.run()
}

const protocolMgr = new ProtocolMgr (musicAssetsFolder, onReady)
