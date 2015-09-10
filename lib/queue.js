'use strict';

const EE = require('events').EventEmitter
const util = require('util')

const processCopyResource = require('./process-copy-resource')
const pocketLabel = require('./get-pocket-label-info')

module.exports = Queue

util.inherits(Queue, EE)

function Queue () {
  this.inProcess = false
  this._queue = []
  this._client = require(__dirname + '/generate-copy-resource-client')()
  this._output = []

  EE.call(this)
}

Queue.prototype.add = function add (object) {
  // handle only getting a barcode
  if (typeof object !== 'object') object = {barcode: object, pocketLabel: false}

  this.emit('add', object)
  this._queue.push(object)
}

Queue.prototype.process = function processQueue () {
  var self = this
  var output = {}
  
  if (self.inProcess && self._queue.length === 0) {
    self.inProcess = false
    self.emit('end-processing')

    return
  }

  if (!self.inProcess) self.inProcess = true
  self.emit('begin-processing')

  var item = self._queue.shift()

  self._client.barcode(item.barcode, function (err, res) {
    // do some processing
    var info = processCopyResource(item.barcode, res)

    if (item.pocketLabel === true) {
      pocketLabel(info.oclcNumber, function (meta) {
        for (let m in meta) info[m] = meta[m]
          
        next(info)
      })
    } else {
      next(info)
    }
  })

  function next (info) {
    self.emit('data', info)
    self.process()
  }
}