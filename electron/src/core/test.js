import {DEV_MODE} from 'common/const'
import BackendAgent from './backend_agent'

export default function setupBackendAgentMock (gBackendAgent) {
  function mockKeyCmd (e) {
    e = e || window.event;
    var code = e.which ? e.which : e.keycode;
    var msg;
    console.log('mockKeyCmd code', code)

    if (window.disableTest) {
      return
    }

    if (code === 49) {
      // 1. openApp
      msg = {
        to: 'core',
        cmd: 'openApp'
      }
      gBackendAgent.emit(BackendAgent.EVT_MSG, msg)
    }

    if (code === 50) {
      // 2.closeApp
      msg = {
        to: 'core',
        cmd: 'closeApp'
      }
      gBackendAgent.emit(BackendAgent.EVT_MSG, msg)
    }

    if (code === 51) {
      // 3.打开url
      msg = {
        to: 'app',
        cmd: 'setActiveUrl',
        opts: {
          activeUrl: 'https://api.jquery.com/keydown/'
        }
      }
      gBackendAgent.emit(BackendAgent.EVT_MSG, msg)
    }

    if (code === 52) {
      // 4.打开另一个url
      msg = {
        to: 'app',
        cmd: 'setActiveUrl',
        opts: {
          activeUrl: 'http://www.163.com/'
        }
      }
      gBackendAgent.emit(BackendAgent.EVT_MSG, msg)
    }

    if (code === 53) {
      // 5.refresh
      msg = {
        to: 'app',
        cmd: 'refresh',
        opts: {
        //   group: 'sic3-f3'
        }
      }
      gBackendAgent.emit(BackendAgent.EVT_MSG, msg)

    }

    if (code === 54) {
      // 6.enterFullscreen
      msg = {
        to: 'app',
        cmd: 'enterFullscreen',
        opts: {

        }
      }
      gBackendAgent.emit(BackendAgent.EVT_MSG, msg)
    }

    if (code === 55) {
      // 7.leaveFullscreen
      msg = {
        to: 'app',
        cmd: 'leaveFullscreen',
        opts: {

        }
      }
      gBackendAgent.emit(BackendAgent.EVT_MSG, msg)
    }

    if (code === 56) {
      // 8.set error url
      msg = {
        to: 'app',
        cmd: 'setActiveUrl',
        opts: {
          activeUrl: 'http://vmax.alibaba.net:9999/'
        }
      }
      gBackendAgent.emit(BackendAgent.EVT_MSG, msg)
    }

    if (code === 57) {
      // 9.upgrade app
      msg = {
        to: 'core',
        cmd: 'upgradeApp',
        opts: {
          app: 'default',
          // version: '1.0.0'
        }
      }
      gBackendAgent.emit(BackendAgent.EVT_MSG, msg)
    }

    if (code === 65) {
      // a.set another url
      msg = {
        to: 'app',
        cmd: 'setActiveUrl',
        opts: {
          activeUrl: 'https://www.baidu.com/s?wd=8',
        }
      }
      gBackendAgent.emit(BackendAgent.EVT_MSG, msg)
    }

    if (code === 66) {
      // b.toggleAppDebugPanel
      msg = {
        to: 'core',
        cmd: 'toggleAppDebugPanel'
      }
      gBackendAgent.emit(BackendAgent.EVT_MSG, msg)
    }

    if (code === 67) {
      // c.upgrade core
      msg = {
        to: 'core',
        cmd: 'upgradeCore'
      }
      gBackendAgent.emit(BackendAgent.EVT_MSG, msg)
    }
}

  document.addEventListener('keyup', mockKeyCmd, false);
}
