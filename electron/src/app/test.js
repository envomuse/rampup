import {DEV_MODE} from 'common/const'
import {remote} from 'electron'

function mockKeyCmd (e) {
    e = e || window.event;
    var code = e.which ? e.which : e.keycode;
    console.log('mockKeyCmd code', code)

    if (code === 49) {
      // 1. mute music
      gApp.audioPlayer.mute(true)
    }

    if (code === 50) {
      // 2. unmute music
      gApp.audioPlayer.mute(false)
    }

    if (code === 51) {
      // 3. next music
      gApp.audioPlayer.next()
    }

    if (code === 52) {
      // 4.pause music
      gApp.audioPlayer.pause()
    }

    if (code === 53) {
      // 5.resume music
      gApp.audioPlayer.resume()
    }
}

document.addEventListener('keyup', mockKeyCmd, false);


if (DEV_MODE) {
  remote.getCurrentWebContents().openDevTools()
}