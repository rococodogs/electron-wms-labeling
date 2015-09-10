var tape = require('tape')
var Queue = require(__dirname + '/../lib/queue')

tape('test Queuein\'', function (t) {
  var q = new Queue()
  q.add({barcode: 1234567, pocketLabel: false})
  t.equals(1, q._queue.length)

  t.end()
})

tape('Queue.add handles only getting barcodes', function (t) {
  var q = new Queue()
  var barcode = 1234567890
  var expect = {barcode: barcode, pocketLabel: false}

  q.add(barcode)
  t.deepEquals(expect, q._queue[0])
  t.end()
})

tape('process returns results', function (t) {
  var q = new Queue()
  q.add({barcode: 31542002626228, pocketLabel: false})
  q.process()
  t.end()
})
