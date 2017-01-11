const events = require("events")
const co = require('co');
const _ = require('lodash')
import {IO_GROUP_ADMIN} from '../const'
import {APPINFO_MSG} from '../core_app_msg'

import {adminCmd2Group, adminCmd2Socket} from '../service/actions/actions'

class PageCaptureMgr {

  constructor(app) {

    this.app = app
    this.tokenPairs = []  // {token, senderSocketId, targetSocketId, createDt}

    this._setupIORoute ()

    console.log('_.isFunction(service.canHandleAgentInfo)', _.isFunction(this.canHandleAgentInfo)
      , typeof (this.canHandleAgentInfo))
  }

  requestCapturePage (senderSocket, toSocketId, token) {
    console.log('toSocketId, token:', senderSocket.id, toSocketId, token);
    this.tokenPairs.push({
          token,
          senderSocketId: senderSocket.id,
          toSocketId,
          createDt: new Date()
        })

    const data = {
      to: 'app',
      cmd: 'capturePage',
      opts: {token}
    }
    // send request to the agents in toGroup
    let action = adminCmd2Socket(toSocketId, data);
    this.app.store.dispatch(action);

  }

  canHandleAgentInfo (data) {
    if (data.type !== APPINFO_MSG.CAPTURE_PAGE) {
      return false
    }

    // find socket that need this page capture data
    const token = data.msg.token
    const tokenPair = _.find(this.tokenPairs, (obj) => {
      return obj.token === token
    })

    console.log('HandleAgentInfo:', tokenPair)

    if (tokenPair) {
      // delete the old token pair
      _.remove(this.tokenPairs, (obj) => {
        return obj.token === token
      })

      const {senderSocketId} = tokenPair

      console.log('senderSocketId is:', senderSocketId)
      // find the original sender socket
      this.app.io.to(senderSocketId).emit('capturePageAck', data.msg);
    }

    return true
  }


  _setupIORoute () {
    const pageCaptureMgr = this

    this.app.io.route('admin/capturePage',
      function* (next, cmd) {
          console.log('[PageCaptureMgr] capturePage');
          if (!this.session.user) {
            // ignore unauth cmd
            console.log('[IORoute] ignore unauth admin capturePage');
            return;
          }
          let {toSocket, token} = cmd;
          pageCaptureMgr.requestCapturePage(this, toSocket, token);
      });
  }
}

export default PageCaptureMgr