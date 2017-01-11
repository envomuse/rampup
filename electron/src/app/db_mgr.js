
const Datastore = require('nedb');
const wrap = require('co-nedb');
const events = require("events")
const path = require('path')
// const co = require('co');
// const _ = require('lodash')

class DBMgr extends events.EventEmitter {
  static EVT_READY = 'DBMgr_EVT_READY'

  constructor(dbFolder) {
    super()

    this.connect(dbFolder)
  }

  * getUser (username) {
    return yield this.users.findOne({username})
  }

  connect (dbFolder) {
    this.dbFolder = dbFolder
    this.dbTracks = wrap(new Datastore({
                            filename: path.join(dbFolder, 'track'),
                            autoload: true
                          }));
    this.dbPlaylists = wrap(new Datastore({
                            filename: path.join(dbFolder, 'playlist'),
                            autoload: true
                          }));

    // this._users = wrap(this.db)
  }

  * changePassword (username, newPassword) {
    console.log('[DBMgr] changePassword', username, newPassword)
    const user = yield this.users.findOne({username})

    if (!user || !newPassword) {
      return
    }

    yield this.users.update({username},  {$set: {password: newPassword}})
  }
}

export default DBMgr
