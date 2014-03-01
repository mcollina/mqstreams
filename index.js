
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

  this.topic = topic;
  this.mq = mq

  var that = this;
  this._callback = function forward(message, cb) {
    that.write(message, cb)
  }

  mq.on(topic, this._callback)
}

util.inherits(MQReadable, streams.PassThrough)

MQReadable.prototype.close = function() {
  this.end()
}

MQReadable.prototype._flush = function(callback) {
  this.mq.removeListener(this.topic, this._callback)
  callback()
  this.emit('close')
}

MQReadable.prototype.pipe = function(destination, options) {
  var that = this

  function closeAnyway() {
    that.close()
  }

  destination.on('finish', closeAnyway)
  destination.on('error', closeAnyway)

  streams.Transform.prototype.pipe.call(this, destination, options)
}

function MQWritable(mq, topic, opts) {
  opts = opts || {}
  opts.objectMode = true
  opts.highWaterMark = opts.highWaterMark || 16

  streams.Writable.call(this, opts)

  this.mq = mq
}

util.inherits(MQWritable, streams.Writable)

MQWritable.prototype._write = function(data, encoding, cb) {
  this.mq.emit(data, cb)
}

module.exports = mqstreams
