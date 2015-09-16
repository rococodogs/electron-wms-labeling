'use strict';

const app = require('app')
const BrowserWindow = require('browser-window')
const ipc = require('ipc')
const Menu = require('menu')

const config = require('./config.json')
const Queue = require('./app/lib/queue')
const queue = new Queue(config)

let showDevTools = !!(process.argv[2] === 'debug')
let mainWindow = null

app.on('window-all-closed', app.quit)

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

ipc.on('add-item', function (event, item) {
  queue.add(item)
  
  if (!queue.inProcess) queue.process()

  queue.on('data', function (d) { 
    event.sender.send('item-data', d)
  })
})