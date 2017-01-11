import React from 'react'
import { render } from 'react-dom'

import ImgViewer from './components/imgViewer'


require('expose?$!expose?jQuery!jquery');
require("!!bootstrap-webpack!./config/bootstrap.config.js");

require('expose?React!react');

// add react div to body
const reactContentWrap = document.createElement('div');
document.body.appendChild(reactContentWrap);

render(<ImgViewer />, reactContentWrap)