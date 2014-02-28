
var streams = require('readable-stream')
  , util = require('util')

function mqstreams(mq) {
  // prototype chain all the things!
  mq = Object.create(mq)

  mq.readable = function(topic, opts) {
    return new MQReadable(this, topic, opts)
  }

  return mq
}

function MQReadable(mq, topic, opts) {

  opts = opts || {}
  opts.objectMode = true

  streams.Transform.call(this, opts)

  var that = this;
  mq.on(topic, function(message, cb) {
    that.write(message, cb)
  })
}

util.inherits(MQReadable, streams.PassThrough)

module.exports = mqstreams
