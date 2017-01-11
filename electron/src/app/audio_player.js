import {Howl} from 'howler'
const events = require("events")

export default class AudioPlayer extends events.EventEmitter {
  constructor () {
    super ()

    this.playlist = [] // [{url, meta}]
    this.playing = false
    this.curIdx = 0

    this.curTrack = null
    this.nextTrack = null

    this._onTrackEnd = this._onTrackEnd.bind(this)
    this._onTrackMuted = () => {
      console.log('[AudioPlayer] _onTrackMuted', this.curTrack.mute())
      this.emit('mute', this.curTrack.mute())
    }
    this._onTrackPlay = () => {
      const duration = this.curTrack.duration ()
      const volume = this.curTrack.volume ()
      const trackUrl = this.playlist[this.curIdx].url
      console.log('[AudioPlayer] _onTrackPlay', trackUrl, duration, volume)
      this.emit('play', {trackUrl})
    }
    this._onTrackPause = () => {
      console.log('[AudioPlayer] _onTrackPause', this.curTrack.playing ())
      this.emit('pause')
    }
  }

  get isPaused () {
    return this.playing ? !this.curTrack.playing () : true
  }
  get isMuted () {
    return this.playing ? this.curTrack.mute () : false
  }

  setPlaylist (playlist) {
    console.log('[AudioPlayer] setPlaylist length', playlist.length)
    this.playlist = playlist
  }

  play () {
    console.log('[AudioPlayer] play')
    if (this.playing) {
      return
    }
    if (this.playlist.length === 0) {
      return
    }

    const curTrackUrl = this.playlist[this.curIdx].url
    this.curTrack = this._createHowl(curTrackUrl)
    this.curTrack.play ()

    this._loadNextTrack ()

    this.playing = true

    console.log('[AudioPlayer] go play curTrackUrl:', curTrackUrl)
  }

  pause () {
    if (this.playing) {
      if (this.curTrack.playing()) {
        this.curTrack.pause ()
      }
    }
  }

  resume () {
    if (this.playing) {
      if (!this.curTrack.playing()) {
        this.curTrack.play ()
      }
    }
  }

  next () {
    if (this.playing) {
      this._onTrackEnd ()
    }
  }

  mute (muted) {
    if (this.playing) {
      this.curTrack.mute(muted)
    }
  }

  stop () {
    this.playing = false
    this.curIdx = 0
    if (this.curTrack) {
      this.curTrack.unload ()
      this.curTrack = null
    }
    if (this.nextTrack) {
      this.nextTrack.unload ()
      this.nextTrack = null
    }
  }

  volume (val) {
    if (!this.playing) {
      return
    }
    if (val >= 0 && val <= 1.0 ) {
      this.curTrack.volume(val)
    }
  }

  _onTrackEnd () {
    console.log('[AudioPlayer] _onTrackEnd')
    if (this.playing) {
      // play next track
      this.curTrack.stop ()
      this.curTrack.unload ()
      this.curTrack = this.nextTrack
      this.curIdx++
      this.curTrack.play ()

      this._loadNextTrack ()
    }
  }

  _loadNextTrack () {
    console.log('[AudioPlayer] _loadNextTrack')
    const nextTrackUrl = this.playlist[(this.curIdx+1) % this.playlist.length].url
    this.nextTrack = this._createHowl(nextTrackUrl)
  }

  _createHowl (trackUrl) {
    const track = new Howl({
      html5: true,
      src: [trackUrl],
      onend: this._onTrackEnd,
      onpause: this._onTrackPause,
      onplay : this._onTrackPlay,
      onmute : this._onTrackMuted
    })

    return track
  }

}
