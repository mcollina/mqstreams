'use strict'

var stream = require('readable-stream')
var PassThrough = stream.PassThrough
var input = new PassThrough({ objectMode: true, highWatermark: 16 })
var output = input.pipe(new PassThrough({ objectMode: true, highWatermark: 16 }))
var total = 1000000
var written = 0
var received = 0
var timerKey = 'time for sending ' + total + ' messages'

function deferWrite () {
  setImmediate(write)
}

function write () {
  if (written === total) {
    output.end()
    return
  }

  written++

  input.write({ topic: 'output/' + written, data: Math.random() }, deferWrite)
}

output.on('data', function (msg) {
  received++
  if (received === total) {
    console.timeEnd(timerKey)
  }
})

console.time(timerKey)
write()
