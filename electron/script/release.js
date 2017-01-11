var fs = require('fs-extra')

function packagerBuildCore() {
  var packager = require('electron-packager')
  packager({
    dir: 'release/core/',
    out: 'build',
    platform: ['darwin', 'win32'],
    arch: 'x64',
    version: '1.4.4',
    overwrite: true,
    prune: false,
    icon: './vmax_agent'
  }, (err, appPaths) => {
    console.log('after package electron:', err, appPaths)
    cpBatchFiles ()
  })
}

function cpApp () {
  const srcAppDir = './release/app'
  const destAppDir = './release/core/apps/default'
  fs.copySync(srcAppDir, destAppDir)

  console.log('[Finish cpApp]')
}

function cpBatchFiles () {
  const srcAppDir = 'script/winstartup/'
  const destAppDir = 'build/VMaxAgent-win32-x64/'
  fs.copySync(srcAppDir, destAppDir)

  console.log('finish cpBatchFiles')
}

cpApp ()
packagerBuildCore ()