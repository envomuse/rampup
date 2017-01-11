import DBMgr from '../services/db_mgr';
const co = require('co');
const path = require('path')
const dbFile = path.join(process.cwd(), 'dbfiles/data')

function echoUserInfo (username) {
  const dbMgr = new DBMgr(dbFile)
  dbMgr.on(DBMgr.EVT_READY, function () {
    co(function * () {
      if (username) {
        const userInfo = yield dbMgr.getUser(username)
        console.log('READ ', username)
        console.log(userInfo, userInfo.preference)
      } else {
        const allusers = yield dbMgr.getUserInfoArr()
        console.log('READ ALL USERS')
        console.log(allusers)
      }
    })

  })
}

const username = process.env.TARGETUSER ? process.env.TARGETUSER : undefined
echoUserInfo(username)