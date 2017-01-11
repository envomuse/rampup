// apiRouter
const parse = require('co-body');

function getRoute(app) {
  var apiRouter = require('koa-router')();

  apiRouter.get('/books', function *(next) {
    console.log('in /api/books');
    this.jsonp = {foo: "bar1"};
  });

  apiRouter.post('/setPreference', function *(next) {
    const params = yield parse(this);

    if (!this.session.user) {
      return this.throw('unauth command', 401);
    }

    if (!params.field) {
      return this.throw('field required', 400);
    }

    yield app.dbMgr.setPreferenceField (this.session.user.username,
     params.field, params.value, params.merge)

    this.body = 'done';
  });

  return apiRouter;
}

module.exports = getRoute;