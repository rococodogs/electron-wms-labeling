'use strict'

// requirements
const app = require('app')
const BrowserWindow = require('browser-window')
const ipc = require('ipc')
const join = require('path').join
const fs = require('fs')
const debug = require('debug')('labeling:app')

const Menu = require('menu')
const template = require(__dirname + '/menu-template')
const mainMenu = Menu.buildFromTemplate(template)

// shortcuts for absolute paths
const cwdJoin = join.bind(this, __dirname)
const appJoin = cwdJoin.bind(this, 'app')
const libJoin = appJoin.bind(this, 'lib')

// item processing
const queue = require('queue')()
const processCopyResource = require(libJoin('process-copy-resource'))
const pocketLabelInfo = require(libJoin('get-pocket-label-info'))
const generateCRClient = require(libJoin('generate-copy-resource-client'))

// prevent our settings + mainWindow from being gc'd
let settings
let mainWindow
let configWindow

// try loading settings from the app/local/settings.json file,
// + if it doesn't exist, copy the default settings
try { settings = require(appJoin('local', 'settings.json')) } 
catch (e) {
  settings = require(cwdJoin('settings.default.json'))
  saveSettings()
}

// writes the settings object to file
function saveSettings () {
  fs.writeFileSync(appJoin('local', 'settings.json'), JSON.stringify(settings))
}

// abstracted copyResource client construction, built after our settings are loaded
const client = generateCRClient(settings)

// calling `npm start debug` will open the dev-tools by default
let showDevTools = !!(process.argv[2] === 'debug')

// close the app when the windows are closed
app.on('window-all-closed', function () {
  app.quit()
})

// handle loading the app
app.on('ready', function () {
  Menu.setApplicationMenu(mainMenu)

  let windowOpts = {
    width: 1000,
    height: 1000,
    title: 'WMS Labeling'
  }
  mainWindow = new BrowserWindow(windowOpts)
  mainWindow.loadUrl('file://' + __dirname + '/app/index.html')

  if (showDevTools) mainWindow.openDevTools()

  mainWindow.on('close', function () {
    mainWindow = null
  })
})

// barcode requests from the main window
ipc.on('window:add-barcode', handleAddBarcodeRequest)

// sync/async ways to get settings
ipc.on('get-settings-sync', function (ev) { ev.returnValue = settings })
ipc.on('get-settings', function (ev) { ev.sender.send('app:settings', settings) })

// launch the config window
ipc.on('window:open-config', openConfig)

// handle updates from the config window
ipc.on('config:update-settings', function (ev, updated, changedKey) {
  settings = updated
  saveSettings()

  // send the key back to update the element in the window
  ev.sender.send('app:updated-setting-key', changedKey)
})

// adds job to queue + starts it if not running
function handleAddBarcodeRequest (ev, bc, pl, id) {
  if (Array.isArray(bc)) {
    bc.forEach(function (req) {
      return handleAddBarcodeRequest(ev, req[0], req[1], req[2])
    })
  }

  let job = function (next) {
    return processBarcodeRequest(ev, bc, pl, id, next)
  }

  queue.push(job)
  if (!queue.running) queue.start()
}

function processBarcodeRequest (event, barcode, pocketLabel, rowId, next) {
  debug(`processing barcode: \`${barcode}\` from rowId \`${rowId}\``)
  return client.barcode(barcode, function (err, res) {
    if (err) {
      debug(`received error from OCLC: ${err.message}`)
      event.sender.send('app:item-error', err.message, rowId)
      return next()

    }

    // takes in the results object from OCLC + extracts the pieces we need
    let info = processCopyResource(barcode, res)

    // if the pocketLabel param is true, then we'll need to make
    // another request to get the title/author fields via OCLC's
    // search API
    if (pocketLabel === true) {
      pocketLabelInfo(info.oclcNumber, settings['wskey.public'], function (pocket) {
        for (let m in pocket) info[m] = pocket[m]

        // send the info back to the ipc sender:
        // `rowId` and `pocketLabel` are copied from the initial
        // call of `processBarcodeRequest` so that potentially async
        // requests are placed in their corresponding places
        event.sender.send('app:item', info, rowId, pocketLabel)
        return next()
      })
    } else {
      // otherwise send the pre-pocketlabel info back
      event.sender.send('app:item', info, rowId, pocketLabel)
      return next()
    }
  })
}

function openConfig () {
  // prevent multiple config windows from opening
  if (configWindow) return configWindow.focus()

  configWindow = new BrowserWindow({
    height: 800,
    width: 1000,
    title: 'WMS Labeling - Config'
  })

  configWindow.loadUrl('file://' + __dirname + '/app/config.html')
  configWindow.on('close', function () {
    configWindow = null
  })
}
