// copy webpack build core.js to server public dir
var fs = require('fs-extra')

const SRC_FILEPATH = './release/core/core.js'
const DEST_FILEPATH = '../server/webapps/core.js'

fs.move(SRC_FILEPATH, DEST_FILEPATH, {clobber: true}, function () {
  console.log('DONE')
})
