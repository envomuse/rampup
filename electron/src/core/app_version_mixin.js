import {DEV_MODE} from 'common/const'
import {remote} from 'electron'

const path = require('path')
const url = require('url')
const fs = require('fs-extra');
const AdmZip = require('adm-zip');

import {getPlatform} from 'common/util'


// App Event
import {EVTS} from './app_evts'
// App Status
import {ST_STOPPED, ST_STARTING, ST_RUNNING, ST_STOPPING} from './app_evts'


const BASE_APP_PATH = remote.app.getAppPath()

class AppMeta {
  constructor (id, meta) {
    this.id = id
    this.meta = meta
  }

  get url () {
    return this.meta.url
  }
  get windowOpts () {
    return this.meta.window
  }

  get version () {
    return this.meta.version
  }
}

export const AppVersionMixin = (superclass) => class extends superclass {
  constructor (...args) {
    super(...args)

    console.log('AppVersionMgrMixin constructor')

    this._scanAppsMeta()

  }

  get appsMeta () {
    return this._appsMeta
  }

  get defaultAppVersion () {
    return this._appsMeta[0].version
  }

  _findAppMetaById (appId) {
    return _.find(this._appsMeta, function(_appMeta) {
      return (_appMeta.id === appId)
    })
  }

  upgradeApp (newApp, newVer) {
    console.log('[AppMgr] upgradeApp:', newApp)
    const self = this

    const upgradePath =  BASE_APP_PATH

    // getPlatform() === 'win' ? path.dirname(process.execPath) :

    const DEFAULT_APP_DIR = path.join(upgradePath, 'apps/default')
    const OLDER_APP_BACKUP_DIR = path.join(upgradePath, 'backup_apps/default')

    // download newApp TBC
    this.backendAgent.fetchZipFiles (newApp, newVer, (tmpZipFile) => {
      if(tmpZipFile){
        console.log('[AppMgr] upgradeApp: fetchZipFiles:', tmpZipFile)
        //create or empty app backup folder
        fs.ensureDirSync(OLDER_APP_BACKUP_DIR)
        fs.emptydirSync(OLDER_APP_BACKUP_DIR)

        //backup current app files, and clear current app folder
        fs.copySync(DEFAULT_APP_DIR, OLDER_APP_BACKUP_DIR)
        fs.emptydirSync(DEFAULT_APP_DIR)
        console.log('[AppMgr] upgradeApp: success backup app files')

        // extract zipFile to apps
        var _zip = new AdmZip(tmpZipFile)
        _zip.extractAllTo(DEFAULT_APP_DIR, true)
        console.log('[AppMgr] upgradeApp: success extract tmpZipFile to app folder')

        //remove tmpZipFile async
        fs.remove(tmpZipFile, (err) => {
          if (err) return console.error(err)
          console.log('[AppMgr] upgradeApp: success remove tmpZipFile:'+tmpZipFile)
        })

        this.config.lastUpgradeTime = new Date().toLocaleString()

        // re-scan apps meta
        this._scanAppsMeta ()

        //if app running close it
        if (this.appRuning) {
          this.closeApp()
          this.once(EVTS.APP_STATUS_CHANGED, (appStatus) => {
            if (appStatus === ST_STOPPED) {
              console.log('[AppMgr] upgradeApp: start new app')
              this.startApp ()
            }
          })
        }

        this.emit(EVTS.APP_UPGRADE_FINISHED)
      } else {
        console.log('[AppMgr] upgradeApp: failed to download upgrade file')
      }
    })
  }

  _scanAppsMeta () {
    console.log('[AppVersionMixin _scanAppsMeta]')

    var appsMeta = [];
    if (DEV_MODE) {
      const devMeta = {
        appId: 'default',
        version: '1.0.0',
        url: 'http://localhost:7777/app.html', // modify this the where you want open
                                               // eg: url: 'http://yourIPAddress: port/app.html',
        window: {
          title: 'dev app',
          width: 400,
          height: 400
        }
      }
      const devAppMeta = new AppMeta(devMeta.appId, devMeta)
      appsMeta.push(devAppMeta)
    } else {
      // scan apps dir
      const appsDirPath = path.join(BASE_APP_PATH, 'apps')
      var _appIdArr = fs.readdirSync(appsDirPath)
      _.each(_appIdArr, function (appId) {
        const appPath = path.join(appsDirPath, appId)
        if (fs.statSync(appPath).isDirectory()) {
          // read package.json
          const pkgPath = path.join(appPath, 'package.json')
          const pkg = fs.readJSONSync(pkgPath)
          const appUrl = url.format({
              protocol: 'file',
              slashes: true,
              pathname: path.join(BASE_APP_PATH, `apps/${appId}/index.html`)
            })
          const meta = {
            appId,
            version: pkg.version,
            url: appUrl,
            window: pkg.window
          }
          appsMeta.push(new AppMeta(meta.appId, meta))
        }
      })

      console.log('[AppMgr] _appIdArr:', _appIdArr)
    }
    // update this._appsMeta
    this._appsMeta = appsMeta
  }

}
