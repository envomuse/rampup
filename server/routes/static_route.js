// Static Routing

import {STATIC_PREFIX, STATIC_PREFIX_REGR, VIEW_TPLS_DIR} from '../const';

function injectStaticRoute(app) {
  if (process.env.PROXY) {
    var proxy = require('koa-proxy')
    app.use(proxy({
      host:  'http://localhost:8088',
      match: STATIC_PREFIX_REGR
    }));
  } else {
    console.log('[injectStaticRoute] VIEW_TPLS_DIR:', VIEW_TPLS_DIR);
    var mount = require('koa-mount');
    app.use(mount(STATIC_PREFIX, require('koa-static-cache')(VIEW_TPLS_DIR)));
  }
}

module.exports = injectStaticRoute;