"use strict";

const _ = require('lodash');

const parse = require('co-body');

const LOGINPAGE = require('../const').LOGINPAGE;

function* loginMiddleware (next, loginInfo) {
    if (!loginInfo) {
      loginInfo = yield parse(this);
    }

    if (!loginInfo.username || !loginInfo.password) {
      return this.throw('please submit username or password', 401);
    }

    const user = yield this.app.dbMgr.getUser (loginInfo.username)
    if (!user || (user.password !== loginInfo.password)) {
      return this.throw('invalid username or password', 401);
    }

    this.session.user = _.pick(user, ['username', 'role'])

    this.body = {
      redirect: "/u/home"
    };
}

function* logoutMiddleware (next) {
  this.session.user = null;

  console.log('logout');
  this.body = {
    loginurl: LOGINPAGE
  };
}

function* authlogin (next) {
  if (this.session.user) {
    return yield next;
  }

  console.log('authlogin not authrized');

  return this.redirect(LOGINPAGE);
}

module.exports = {
  login: loginMiddleware,
  logout: logoutMiddleware,
  authlogin: authlogin
};