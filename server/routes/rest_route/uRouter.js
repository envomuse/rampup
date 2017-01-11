import {ROLE_ADMIN, ROLE_GUEST} from '../../const'

function getRoute(app) {
  var uRouter = require('koa-router')();
  var auth = require('../../middleware/auth');

  uRouter.post('/login', auth.login);
  uRouter.post('/logout', auth.logout);
  uRouter.get('/home', auth.authlogin, function *(next) {
    console.log('in u/home:', this.session.user);

    //
    if (this.session.user.role === ROLE_ADMIN) {
      // render admin view
      const userInfo = yield this.app.dbMgr.getUser(this.session.user.username)
      yield this.app.views.renderAdmin.bind(this)(userInfo);
      return;

    } else {

    }
  });

  return uRouter;
}

module.exports = getRoute;