// zip app release and copy to server webapps directory

var EasyZip = require('easy-zip').EasyZip;
var fs = require('fs-extra')

const APP_DIR = './release/app/'
const DEST_ZIP_FILEPATH = '../server/webapps/default/1.0.0/default.v1.0.0.zip'

var zip = new EasyZip();
var files = [
  {
    source: APP_DIR+'app.js',
    target: 'app.js'
  },
  {
    source: APP_DIR+'index.html',
    target: 'index.html'
  },
  {
    source: APP_DIR+'package.json',
    target: 'package.json'
  },
  {
    source: APP_DIR+'nircmdc.exe.zip',
    target: 'nircmdc.exe.zip'
  }
];

zip.batchAdd(files, function(){
    zip.writeToFileSycn(DEST_ZIP_FILEPATH);
    console.log('zip app to server done')
});
