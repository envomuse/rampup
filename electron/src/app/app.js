'use strict';
import React from 'react'
import AudioPlayer from './audio_player'
import AssetMgr from './asset_mgr'

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.dbMgr = this.props.dbMgr
    this.protocolMgr = this.props.protocolMgr

    this.audioPlayer = new AudioPlayer ()
    this.assetMgr = new AssetMgr (this.dbMgr, this.protocolMgr)

    this.curPlaylistMeta = null // {date, playlist}
    this.lastSyncTime = null

    this.timer = null
    this.tick = this.tick.bind(this)

    this.bindUIActionEvt ()
    this.state = {
      pause: false,
      trackUrl: '',
      mute: false
    }
  }

  componentDidMount() {
    console.log('[App]: componentDidMount')

    this.audioPlayer
    .on('play', (trackUrl) => {
      this.setState({
        pause: false,
        trackUrl,
        mute: this.audioPlayer.isMuted
      })
    })
    .on('pause', (trackUrl) => {
      this.setState({
        pause: true
      })
    })
    .on('mute', (trackUrl) => {
      this.setState({
        mute: true
      })
    })
  }

  componentWillUnmount() {
    console.log('[App]: componentWillUnmount.')

    this.audioPlayer.removeAllListeners ()
  }

  render () {
    const desc = this.state.pause ? '播放': '暂停'

    return (
      <div className="app">
        <button onClick={this.onPauseClicked} > {desc} </button>
        <button onClick={this.onNext} > 下一首 </button>
        <button onClick={this.onMute} > 静音 </button>

      </div>
    )
  }

  bindUIActionEvt () {
    this.onPauseClicked = () => {
      if (this.audioPlayer.isPaused) {
        this.audioPlayer.resume ()
      } else {
        this.audioPlayer.pause ()
      }
    }

    this.onNext = () => {
      this.audioPlayer.next ()
    }

    this.onMute = () => {
      this.audioPlayer.mute (!this.audioPlayer.isMuted)
    }
  }

  // logic part
  setupCoreBroker (_coreBroker) {
    //
  }

  run () {
    if (this.timer) {
      return
    }

    this.timer = setInterval(this.tick, 5*60*1000)
    this.tick ()
  }

  async tick () {
    const now = new Date ()

    if (!this.curPlaylistMeta
        || now.getDay () !== this.curPlaylistMeta.date.getDay () ) {
      this.curPlaylistMeta = await this.assetMgr.queryPlaylist (now)

      if (this.curPlaylistMeta) {
        this.audioPlayer.stop ()
        this.audioPlayer.setPlaylist (this.curPlaylistMeta.playlist)
        this.audioPlayer.play ()
      }
    }

    if ((this.lastSyncTime - now) > 30 * 60*1000) {
      this.assetMgr.updateAsset ()
      this.lastSyncTime = now
    }
  }

  stop () {
    this.timer && clearInterval(this.timer)
    this.timer = null

    this.curPlaylistMeta = null
  }
}
