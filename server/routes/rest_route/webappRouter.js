// webappRouter
var fs = require('fs');
var fse = require('fs-extra');
var walkSync = require('walk-sync');
var path = require('path');
var mount = require('koa-mount');
var parse = require('co-busboy');
var cors = require('koa-cors');
var os = require('os');
var path = require('path');
var shell = require('shelljs');

var WEBAPPS_ROOT = path.resolve(__dirname, '../../webapps');

var DEFAULT_VER = '1.0.0';
var DEFAULT_APP = 'sic3';
var STATIC_PREFIX = '/static';

import {ROLE_ADMIN, ROLE_GUEST} from '../../const'

function getRoute(app, webappPrefix = '/') {
  var webappRouter = require('koa-router')();
  var noCache = require('koa-no-cache');


  // Add CORS support
  webappRouter.use(cors());

  webappRouter.use(mount(STATIC_PREFIX,
    require('koa-static')(WEBAPPS_ROOT)));

  webappRouter
    .use(noCache({
      types: ['html'],
      paths: ['/meta']
    }));

  webappRouter.get('/meta', function *(next) {
    this.body = require('../../mock/mock_webapps');
  });

  webappRouter.get('/verisonlist', function *(next) {
    //
    var app = this.query.app ? this.query.app: DEFAULT_APP;
    console.log('request version list:', app)
    var appPath = path.join(WEBAPPS_ROOT, app);
    var allFiles = walkSync(appPath);
    var dirs = allFiles.filter(function(filename) {
      return filename.endsWith('/') && filename.split('/').length === 2
    })

    this.body = dirs
  });

  webappRouter.get('/*', function *(next) {
    console.log('webappRouter.get:', this.query.app)

    var app = this.query.app ? this.query.app: DEFAULT_APP;
    var version = this.query.version ? this.query.version: DEFAULT_VER;
    if (app && version) {
      var indexFilePath = path.join(WEBAPPS_ROOT, app, version, `${app}.v${version}.zip`);
      console.log('try to get ', indexFilePath)
      if (!fs.existsSync(indexFilePath)) {
        return this.body = 'Illegal Request! File not exist';
      }

      //redirect
      var redirectFileUrl = path.join(webappPrefix, STATIC_PREFIX, app, version, `${app}.v${version}.zip`);

      this.redirect(redirectFileUrl);
      return;
    };

    this.body = 'Illegal Request! App and version required';
    return;
  });

  webappRouter.post('/upload', function *(next) {
    // the body isn't multipart, so busboy can't parse it
    if (!this.request.is('multipart/*')) return yield next

    if (!this.session.user || this.session.user.role !== ROLE_ADMIN) {
      // ignore unauth cmd
      console.log('[IORoute] ignore unauth admin upload');
      return this.throw('please login as admin', 401);
    }

    var parts = parse(this)
    var part;
    var formFields = {};
    while (part = yield parts) {
      if (part.length) {
        // // arrays are busboy fields
        let key = part[0];
        let value = part[1];
        formFields[key] = value;
      } else {
        // otherwise, it's a stream
        var stream = fs.createWriteStream(path.join(os.tmpdir(), Math.random().toString()));
        part.pipe(stream);

        console.log('uploading %s -> %s', part.filename, stream.path);
        formFields['tmpPackagePath'] = stream.path;
      }
    }

    console.log('and we are done parsing the form! formFields:', formFields);

    var {app, version, commitSHA, password, tmpPackagePath} = formFields;
    // app =  'g20'
    // version = version ? version: 'v11'
    // commitSHA = commitSHA ? commitSHA: 'advdsa'
    // password = password ? password : 'waltonupload'
    if (!app || !version || !commitSHA) {
      return this.throw('please give app and version number', 401);
    }

    console.log('[webappRouter]', app, version, commitSHA, password, tmpPackagePath);

    var targetAppDirPath = path.join(WEBAPPS_ROOT, app, version);
    if (fs.existsSync(targetAppDirPath)) {
      if (password !== 'waltonupload') {
        return this.body = 'Illegal Request! File not exist';
      }
      console.log(`[webappRouter] ${targetAppDirPath} already exist, remove it`);
      fse.removeSync(targetAppDirPath);
    }

    // unzip tmpPackagePath to targetAppDirPath
    var unzipCmd = `unzip ${tmpPackagePath} -d ${targetAppDirPath}`
    console.log('[webappRouter] unzipCmd:', unzipCmd);
    var ret = shell.exec(unzipCmd, {
        silent: false
      }, (code, output) => {
        console.log('[webappRouter] code:', code);
        if (code === 0) {
          // this.body = 'success';
        } else {
          // this.body = 'unzip failed';
        }
      });

    this.body = 'done';
  });

  return webappRouter;
}

module.exports = getRoute;