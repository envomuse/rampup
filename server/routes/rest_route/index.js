// Routing
var jsonp = require('koa-safe-jsonp');
var mount = require('koa-mount');

function injectRESTRoute(app) {
  var uRouter = require('./uRouter')(app);
  var apiRouter = require('./apiRouter')(app);
  var webappRouter = require('./webappRouter')(app, '/webapps');

  // jsonp support
  jsonp(app, {
    callback: '_callback', // default is 'callback'
    limit: 50, // max callback name string length, default is 512
  });

  app.use(mount('/u', uRouter.routes()));
  app.use(mount('/api', apiRouter.routes()));
  app.use(mount('/webapps', webappRouter.routes()));
}

module.exports = injectRESTRoute;