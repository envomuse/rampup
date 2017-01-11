const events = require("events")
const os = require('os');
const _ = require('lodash');

const electron = require('electron')

import {getScreenResolution} from 'common/util'

export const EVT_DEVICE_CHANGE = 'EVT_DEVICE_CHANGE'

class Device extends events.EventEmitter {
  constructor () {
    super()

    electron.screen.on('display-metrics-changed', () => {
      this.emit(EVT_DEVICE_CHANGE)
    })
  }

  getDeviceInfo () {
    const netInfo = this._getIPMacAndNetworkInterface()
    return {
      ip: netInfo ? netInfo.ip : '',
      mac: netInfo ? netInfo.mac : '',
      code: 21,
      arch: os.arch(),
      cpus: os.cpus(),
      hostname: os.hostname(),
      platform: os.platform(),
      freemem: os.freemem(),
      networkInterfaces: netInfo ? netInfo.networkInterface : null,
      resolution: getScreenResolution()
    }
  }

  _getIPMacAndNetworkInterface () {
    var faces = os.networkInterfaces()
    var result = null
    for( var key in faces){
      var face = faces[key]
      var net = _.find(face, (_net) => {
        return (_net.family === 'IPv4' && _net.address != '127.0.0.1')
      })
      if(net){
        result = {
          mac: net.mac,
          ip: net.address,
          networkInterface: face
        }
      }
    }
    return result
  }
}

const gDevice = new Device()

export default gDevice
