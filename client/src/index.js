import React from 'react'
import { render } from 'react-dom'

import 'bootstrap/less/bootstrap.less'

import './styles/base.less';

require('expose?$!expose?jQuery!jquery');
require("!!bootstrap-webpack!./config/bootstrap.config.js");

require('expose?React!react');

import "whatwg-fetch"

// Config redux-simple-router
import router from './routes'

// add react div to body
const reactContentWrap = document.createElement('div');
document.body.appendChild(reactContentWrap);

render(router, reactContentWrap);

require('backendService/ioPackageService');