var mqemitter = require('mqemitter')
  , mqstreams = require('./')
  , emitter = mqstreams(mqemitter({ concurrency: 10 }))
  , input = emitter.writable()
  , output = emitter.readable('output/#')
  , total = 1000000
  , written = 0
  , received = 0
  , timerKey = 'time for sending ' + total + ' messages'

function deferWrite() {
  setImmediate(write)
}

function write() {
  if (written === total) {
    input.end()
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
