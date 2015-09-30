'use strict';

const app = require('app')
const BrowserWindow = require('browser-window')
const ipc = require('ipc')
const Menu = require('menu')
const join = require('path').join
const fs = require('fs')

// shortcuts for absolute paths
const cwdJoin = join.bind(this, __dirname)
const appJoin = cwdJoin.bind(this, 'app')
const libJoin = appJoin.bind(this, 'lib')

let settings

try { settings = require(appJoin('local', 'settings.json')) }
catch (e) {
  settings = require(cwdJoin('settings.default.json'))
  saveSettings()
  ipc.send('app:update-settings', settings)
}

function saveSettings () {
  fs.writeFileSync(appJoin('local', 'settings.json'), JSON.stringify(settings))
}

const client = require(libJoin('generate-copy-resource-client'))(settings.oclc)

// item processing
const queue = require('queue')()
const processCopyResource = require(libJoin('process-copy-resource'))
const pocketLabelInfo = require(libJoin('get-pocket-label-info'))

let showDevTools = !!(process.argv[2] === 'debug')
let mainWindow = null

app.on('window-all-closed', function () {
  app.quit()
})

app.on('ready', function () {
  let windowOpts = {
    width: 600,
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

ipc.on('window:add-barcode', function (event, barcode, pocketLabel, row) {
  var job = function (next) {
    client.barcode(barcode, function (err, res) {
      if (err) ipc.send('app:item-error', err)

      let info = processCopyResource(barcode, res)

      if (pocketLabel === true) {
        pocketLabelInfo(info.oclcNumber, settings.oclc.wskey.public, function (pocket) {
          for (let m in pocket) info[m] = pocket[m]

          event.sender.send('app:item', info, row, pocketLabel)
          next()
        })
      } else {
        event.sender.send('app:item', info, row, pocketLabel)
        next()
      }
    })
  }

  queue.push(job)
  if (!queue.running) queue.start()
})

ipc.on('window:get-settings', function (ev) {
  ev.returnValue = settings
})