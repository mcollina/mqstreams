
var stream = require('readable-stream')
  , PassThrough = stream.PassThrough
  , input = new PassThrough({ objectMode: true, highWatermark: 16 })
  , output = input.pipe(new PassThrough({ objectMode: true, highWatermark: 16 }))
  , total = 1000000
  , written = 0
  , received = 0
  , timerKey = 'time for sending ' + total + ' messages'

function deferWrite() {
  setImmediate(write)
}

function write() {
  if (written === total) {
    output.end()
    return
  }

  written++

  input.write({ topic: 'output/' + written, data: Math.random() }, deferWrite)
}

output.on('data', function(msg) {
  received++
  if (received === total) {
    console.timeEnd(timerKey)
  }
})

console.time(timerKey)
write()
