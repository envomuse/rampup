
const Datastore = require('nedb');
const wrap = require('co-nedb');
const events = require("events")
const co = require('co');
const _ = require('lodash')

class DBMgr extends events.EventEmitter {
  static EVT_READY = 'DBMgr_EVT_READY'

  constructor(dbFile, opts) {
    super()

    this.connect(dbFile)

    co(this._installMockData ())
    .then(()=> {
      console.log('done DBMgr')
      this.emit(DBMgr.EVT_READY)
    })
  }

  get users () {
    return this._users
  }

  * getUser (username) {
    return yield this.users.findOne({username})
  }

  connect (dbFile) {
    this.dbFile = dbFile
    this.db = new Datastore({
      filename: dbFile,
      autoload: true
    });

    this._users = wrap(this.db)
  }

  * changePassword (username, newPassword) {
    console.log('[DBMgr] changePassword', username, newPassword)
    const user = yield this.users.findOne({username})

    if (!user || !newPassword) {
      return
    }

    yield this.users.update({username},  {$set: {password: newPassword}})
  }

  * setPreferenceField (username, field, value, merge) {
    console.log('[DBMgr] setPreferenceField', username, field, value, merge)
    const user = yield this.users.findOne({username})

    if (!user || !value) {
      return
    }

    if (merge) {
      var oldVal = user.preference[field] ? user.preference[field] : {}
      value = _.merge(oldVal, value)
    }

    const setter = {}
    setter[`preference.${field}`] = value

    yield this.users.update({username},  {$set: setter})
  }

  * getUserInfoArr () {
    return yield this.users.find({})
  }

  * _installMockData () {
    var mockUserRoleInfos = require('../mock/mock_user_role');
    // console.log('_installMockData:', mockUserRoleInfos)
    for (var i = mockUserRoleInfos.length - 1; i >= 0; i--) {
      const userInfo = mockUserRoleInfos[i]
      var user = yield this.users.findOne({username: userInfo.username})
      if (!user) {
        yield this.users.insert(userInfo);
      }
    }
  }
}

export default DBMgr
