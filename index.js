
var streams = require('readable-stream')
  , util = require('util')

function mqstreams(mq) {
  // prototype chain all the things!
  mq = Object.create(mq)

  mq.readable = function(topic, opts) {
    return new MQReadable(this, topic, opts)
  }

  mq.writable = function(opts) {
    return new MQWritable(this, opts)
  }

  return mq
}

function MQReadable(mq, topic, opts) {

  opts = opts || {}
  opts.objectMode = true
  opts.highWaterMark = opts.highWaterMark || 16

  streams.Transform.call(this, opts)

  var that = this;
  mq.on(topic, function(message, cb) {
    that.write(message, cb)
  })
}

util.inherits(MQReadable, streams.PassThrough)

function MQWritable(mq, topic, opts) {

  opts = opts || {}
  opts.objectMode = true
  opts.highWaterMark = opts.highWaterMark || 16

  streams.Writable.call(this, opts)

  this.mq = mq
}

util.inherits(MQWritable, streams.Writable)

MQWritable.prototype._write = function(data, encoding, cb) {
  console.log('aaa')
  this.mq.emit(data, cb)
}

module.exports = mqstreams
