"use strict";
import {ROLE_ADMIN, ROLE_GUEST, IO_GROUP_ADMIN} from '../const'
const _ = require('lodash')

// redux actions
import {clientConnected, clientDisconnected, clientJoin,
  clientUpdateDeviceInfo, clientUpdateAppInfo, clientUpdateCoreInfo,
  adminCmd2Group, adminCmd2Socket} from '../service/actions/actions'

import {APPINFO_MSG} from '../core_app_msg'

function injectIORoute(app) {
  const store = app.store;

  app.io.use(function* userConnection(next) {
    // on connect
    console.log('[IORoute] on connect session.user');
    const {user} = this.session;
    let role = user ? user.role : ROLE_GUEST;
    let username = user ? user.username : null;
    store.dispatch(clientConnected(this, role, username));

    yield* next;

    // on disconnect
    store.dispatch(clientDisconnected(this));

  });

  app.io.route('registerCmd',
    function* (next, groupId, username) {
      store.dispatch(clientJoin(this, groupId, username));
  });

  app.io.route('core/appInfo',
    function* (next, data) {
      console.log('updateAppInfo:', data)

      // let services to handle it first
      const service = _.find(app.getServices(), function (_service) {
        if (!_.isFunction(_service.canHandleAgentInfo)) {
          return false
        }

        return _service.canHandleAgentInfo(data)
      })

      if (service) {
        // already handled by app.service
        return
      }

      // NOTE!! App msg should matched to server handling
      if (data.type === APPINFO_MSG.APP_STATUS) {
        const appInfo = data.msg
        store.dispatch(clientUpdateAppInfo(this, appInfo))
        return
      }
  });
  app.io.route('core/deviceInfo',
    function* (next, deviceInfo) {
      console.log('deviceInfo:', deviceInfo)
      store.dispatch(clientUpdateDeviceInfo(this, deviceInfo));
  });
  app.io.route('core/coreInfo',
    function* (next, coreInfo) {
      console.log('coreInfo:', coreInfo)
      store.dispatch(clientUpdateCoreInfo(this, coreInfo));
  });

  app.io.route('admin/ioCmdToGroup',
    function* (next, cmd) {
      console.log('admin ioCmdToGroup');
      if (!this.session.user) {
        // ignore unauth cmd
        console.log('[IORoute] ignore unauth admin ioCmdToGroup');
        return;
      }
      let {toGroup, data} = cmd;
      console.log('ioGroup, data:', toGroup, data);
      let action = adminCmd2Group(this, toGroup, data);

      store.dispatch(action);
  });
  app.io.route('admin/ioCmdToSocket',
    function* (next, cmd) {
      console.log('admin ioCmdToSocket');
      if (!this.session.user) {
        // ignore unauth cmd
        console.log('[IORoute] ignore unauth admin ioCmdToSocket');
        return;
      }
      let {toSocket, data} = cmd;
      console.log('to socketId, data:', toSocket, data);
      let action = adminCmd2Socket(toSocket, data);

      store.dispatch(action);
  });

  store.subscribe(function() {
    console.log('[STORE change]');
    // Broadcast the change to all admin client
    app.io.to(IO_GROUP_ADMIN).emit('state', store.getState());
  })
}

module.exports = injectIORoute;