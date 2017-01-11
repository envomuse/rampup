import {DEV_MODE} from 'common/const'

const fs = require("fs")

// asset include playlist and tracks
export default class AssetMgr {
  constructor (dbMgr, protocolMgr) {
    this.dbMgr = dbMgr
    this.protocolMgr = protocolMgr
  }

  updateAsset () {
    // TBC: communicate with backend service
  }

  async queryPlaylist (now) {
    console.log('[AssetMgr] queryPlaylist')

    if (DEV_MODE) {
      return {
        date: now,
        playlist: await this._generatePlaylistByLocalMusicFolder ()
      }
    }

    // TBC

    return
  }

  async _generatePlaylistByLocalMusicFolder () {
    const folder = this.protocolMgr.musicAssetsFolder

    console.log('[AssetMgr] _generatePlaylistByLocalMusicFolder:', folder)
    // scan folder and generate playlist
    const playlist = []
    const files = await fs.readdirAsync(folder)
    for (let file of files) {
      if (file.endsWith('.mp3')) {
        playlist.push({
          url: this.protocolMgr.getUrl(file)
        })
      }
    }

    return playlist
  }
}
