const {app, protocol, BrowserWindow} = require('electron')
const path = require('path')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win = null

function installPepperFlashPlugin () {
  let pluginName
  switch (process.platform) {
    case 'win32':
      pluginName = 'pepflashplayer.dll'
      break
    case 'darwin':
      pluginName = 'PepperFlashPlayer.plugin'
      break
    case 'linux':
      pluginName = 'libpepflashplayer.so'
      break
  }
  const flashPluginPath = path.join(__dirname, 'plugins', pluginName)
  app.commandLine.appendSwitch('ppapi-flash-path', flashPluginPath)
}

function getStartWinUrl () {
  const target = process.env.TARGET
  if (target === 'REMOTE_APP') {
    return 'http://localhost:7777/app.html'
  }
  if (target === 'REMOTE_CORE') {
    return 'http://localhost:7777/index.html'
  }

  let appUrl = require('url').format({
    protocol: 'file',
    slashes: true,
    pathname: path.join(__dirname, 'index.html')
  })

  return appUrl
}

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({width: 1024, height: 768})

  // and load the index.html of the app.
  win.loadURL(getStartWinUrl())

  global.coreWinID = win.id

  // Open the DevTools.
  win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    const wins = BrowserWindow.getAllWindows()
    console.log('on closed evt', wins.length, wins)
    wins.forEach((_win) => {
      if (_win === win) {
        return
      }

      if (_win.isDestroyed()) {
        return
      }

      console.log('try close win:', _win)
      _win.close()
    })

    win = null
  })
}

installPepperFlashPlugin ()

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow ()
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.