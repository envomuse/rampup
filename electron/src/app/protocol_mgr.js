import {DEV_MODE} from 'common/const'
import {remote} from 'electron'
const path = require('path')
const fs = require('fs-extra')

export default class ProtocolMgr {
  constructor(musicAssetsFolder, callback) {
    this.musicAssetsFolder = musicAssetsFolder
    this.callback = callback

    this.onTrackRequest = this.onTrackRequest.bind(this)

    this.init ()
  }

  init () {
    // ensure
    fs.ensureDirSync(this.musicAssetsFolder)

    this.registerFileProtocols ()

    window.onbeforeunload = () => {
      console.log('[ProtocolMgr] will onbeforeunload!')
      this.unregisterFileProtocols ()
    }
  }

  registerFileProtocols () {
    console.log('[ProtocolMgr] registerFileProtocols')
    // music track protocol
    remote.protocol.registerFileProtocol('track'
      , this.onTrackRequest
      , this.callback)
  }

  unregisterFileProtocols () {
    console.log('[ProtocolMgr] unregisterFileProtocols')
    remote.protocol.unregisterProtocol('track')
  }

  onTrackRequest (request, callback) {
    const url = request.url.substr(8)
    const trackFilePath = path.normalize(`${this.musicAssetsFolder}/${url}`)

    console.log('[ProtocolMgr] onTrackRequest:', request.url, trackFilePath)

    callback({path: trackFilePath})
  }

  getUrl (trackPath) {
    return `track:///${trackPath}`
  }
}
