import {DEV_MODE} from 'common/const'
const events = require("events")
const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');

import {remote} from 'electron'

import {getPlatform} from 'common/util'

const BASE_APP_PATH = remote.app.getAppPath()

export const EVT_CONFIG_CHANGE = 'EVT_CONFIG_CHANGE'

class Config extends events.EventEmitter {

  constructor () {
    super()

    this._config = null
    this._configBackup = null
    this._pkg = require('json!./package.json')

    this.parse()
  }

  get appId () {
    return this._config.appId
  }

  get group () {
    return this._config.group
  }

  get server () {
    return this._config.server
  }

  get version () {
    return this._pkg.version
  }

  get appVersion () {
    if (!this._appVersion) {
      const appPkg = fs.readJSONSync(`${BASE_APP_PATH}/apps/${this.appId}/package.json`)
      this._appVersion = appPkg.version
    }

    return this._appVersion
  }

  get lastUpgradeTime () {
    return this._config.lastUpgradeTime ? this._config.lastUpgradeTime : null
  }

  set server (_server) {
    if (_server === this._config.server) {
      return
    }
    this._config.server = _server
    this._syncToFile()
  }

  set group (_group) {
    if (!_group || _group === this._config.group) {
      return
    }
    this._config.group = _group
    this._syncToFile()
  }

  set appId (_appId) {
    this._config.appId = _appId
    this._syncToFile()
  }

  set lastUpgradeTime (timeStr) {
    this._config.lastUpgradeTime = timeStr
    this._syncToFile()
  }

  parse () {
    if (this._config) {
      return this._config
    }

    if (DEV_MODE) {
      // webpack require style
      this._config = require('json!./config.json')
      console.log('this._config', this._config)
      this._appVersion = '1.0.0'
    } else {
      // node-webkit require style
      const configPath = this._getConfigFilePath()
      console.log('configPath:', configPath)
      this._config = fs.readJSONSync(configPath)
    }

    // compare which fields changed when syncToFile
    this._configBackup = _.assign({}, this._config)
  }

  _syncToFile () {
    if (DEV_MODE) {
      // do nothing
    } else {
      // node-webkit require style
      const configPath = this._getConfigFilePath()
      fs.writeJSONSync(configPath, this._config)
    }

    // compare which fields change
    var fields = []
    _.forIn(this._config, (v, k) => {
      if (this._configBackup[k] !== v) {
        fields.push(k)
      }
    })

    this._configBackup = _.assign({}, this._config)

    this.emit(EVT_CONFIG_CHANGE, fields)
  }

  _getConfigFilePath () {
    const baseDir = getPlatform() === 'win' ? path.dirname(process.execPath) : process.cwd()

    return path.join(BASE_APP_PATH, 'config.json')
  }
}

const gConfig = new Config()

export default gConfig
