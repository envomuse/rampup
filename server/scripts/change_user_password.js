import DBMgr from '../services/db_mgr';
const co = require('co');
const path = require('path')
const dbFile = path.join(process.cwd(), 'dbfiles/data')

function changeUserPassword () {
  if (process.argv.length !== 4) {
    console.log ('please use script like this:  npm run changeUserPassword  -- yourusernmae newpassword ')
    return
  }

  const username = process.argv[2]
  const password = process.argv[3]

  const dbMgr = new DBMgr(dbFile)
  dbMgr.on(DBMgr.EVT_READY, function () {
    co(function * () {
      yield* dbMgr.changePassword(username, password)
    })

  })
}

// const username = process.env.TARGETUSER ? process.env.TARGETUSER : undefined
console.log('proc.args', process.argv)

changeUserPassword()