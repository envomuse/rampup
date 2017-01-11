"use strict";
const path = require('path');
const TEMPLATE_DIR = path.resolve(__dirname, 'tpls');

const _ = require('lodash');

var views = require('koa-views');
var request = require("co-request");
var swig  = require('swig');

function injectViews(app) {
  const store = app.store;

  app.use(views(TEMPLATE_DIR, {
    map: {
      html: 'swig'
    }
  }));

  app.views = {
    renderAdmin: function * (userInfo) {
      const locals = {
        __INITIAL_STATE__ : {
          user: _.omit(userInfo, 'password'),
          state: store.getState(),
          // webapps: mockWebappsInfo
        }
      };
console.log('renderAdmin:', userInfo)
      if (process.env.PROXY) {
        let result = yield request("http://localhost:8088/static/app.html");
        let indexTlp = result.body;

        this.body = swig.render(indexTlp, {locals});
      } else {
        yield this.render('app', locals);
      }
    }
  }
}

module.exports = injectViews;