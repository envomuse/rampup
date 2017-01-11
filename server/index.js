"use strict";
var koa = require('koa.io');
var logger = require('koa-logger');
var port = process.env.PORT || 3000;
var app = koa();

import {WELCOMEPAGE, LOGINPAGE, IMGVIEWER} from './const';
import DBMgr from './services/db_mgr';
import PageCaptureMgr from './services/page_capture_mgr';

app.dbMgr = new DBMgr('./dbfiles/data')
app.pageCaptureMgr = new PageCaptureMgr(app)
app.getServices = () => {
  return [app.pageCaptureMgr]
}

// Add logger
app.use(logger());

// Add global error handling
app.use(function * errHandling (next) {
  try {
    yield next;
  } catch (err) {
    console.log('catch here', err);
    this.status = err.status || 500;
    this.body = err.message;
    this.app.emit('error', err, this);
  }
});

// Inject app.store before injectRESTRoute and injectIORoute
require('./service/store')(app);

// Static Asset Middleware
require('./routes/static_route')(app);

// Setup session
app.keys = ['secret', 'walton', 'key`'];
app.session();

// injectViews
require('./views')(app);

// injectRESTRoute: REST Routing
require('./routes/rest_route')(app);

// injectIORoute: middleware for socket.io connect and disconnect,
//                and other message handling
require('./routes/io_route')(app);

// Last fallback to welcome page
app.use(function*(next) {
  if (['/', '/index.html'].indexOf(this.path) >= 0) {
    // return this.redirect(WELCOMEPAGE);
    return this.redirect(LOGINPAGE);
  }
  if (['/login.html'].indexOf(this.path) >= 0) {
    return this.redirect(LOGINPAGE);
  }

  if (['/imgViewer.html'].indexOf(this.path) >= 0) {
    return this.redirect(IMGVIEWER);
  }

  return;
});

app.dbMgr.on(DBMgr.EVT_READY, () => {
  app.listen(port, function () {
    console.log('Server listening at port %d', port);
  });
})



