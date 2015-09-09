'use strict';

const app = require('app')
const BrowserWindow = require('browser-window')
const ipc = require('ipc')

const config = require('./config.json')
const Queue = require('./lib/queue')
const queue = new Queue(config)

let showDevTools = !!(process.argv[2] === 'debug')
let mainWindow = null

app.on('window-all-closed', app.quit)

app.on('ready', function () {
  mainWindow = new BrowserWindow({width: 800, height: 1000})
  mainWindow.loadUrl('file://' + __dirname + '/index.html')

  if (showDevTools) mainWindow.openDevTools()

  mainWindow.on('close', function () {
    mainWindow = null
  })
})

ipc.on('add-item', function (_, item) {
  queue.add(item)
})