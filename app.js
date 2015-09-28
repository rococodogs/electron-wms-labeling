'use strict';

const app = require('app')
const BrowserWindow = require('browser-window')
const ipc = require('ipc')
const Menu = require('menu')
const join = require('path').join

// shortcuts for absolute paths
const cwdJoin = join.bind(this, __dirname)
const appJoin = cwd.bind(this, 'app')
const libJoin = app.bind(this, 'lib')

const config = require(cwdJoin('config.json'))
const client = require(libJoin('generate-copy-resource-client'))

// item processing
const queue = require('queue')()
const processCopyResource = require(libJoin('process-copy-resource'))
const pocketLabel = require(libJoin('get-pocket-label-info'))

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
    client.barcode(item.barcode, function (err, res) {
      if (err) ipc.send('app:item-error', err)

      let info = processCopyResource(barcode, res)

      if (pocketLabel === true) {
        pocketLabel(info.oclcNumber, function (pocket) {
          for (let m in pocket) info[m] = pocket[m]

          ipc.send('app:item', info, row)
          next()
        })
      } else {
        ipc.send('app:item', info, row)
        next()
      }
    })
  }

  queue.push(job)
  if (!queue.running) queue.start()
})