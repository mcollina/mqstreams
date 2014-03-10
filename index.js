
var streams = require('readable-stream')
  , util = require('util')
  , assert = require('assert')

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
  if (typeof topic === 'object') {
    opts = topic
    topic = null
  }

  opts = opts || {}
  opts.objectMode = true
  opts.highWaterMark = opts.highWaterMark || 16

  streams.PassThrough.call(this, opts)

  this._topics = [];
  this.mq = mq

  var that = this;
  this._callback = function forward(message, cb) {
    that.write(message, cb)
  }

  if (topic) {
    this.subscribe(topic)
  }
}

util.inherits(MQReadable, streams.PassThrough)

MQReadable.prototype.subscribe = function(topic) {
  assert(topic)

  if (typeof topic === 'string') {
    this.mq.on(topic, this._callback)
    this._topics.push(topic)
  } else {
    topic.forEach(this.subscribe.bind(this))
  }

  return this
}

MQReadable.prototype.unsubscribe = function(topic) {
  assert(topic)

  if (typeof topic === 'string') {
    this.mq.removeListener(topic, this._callback)
    this._topics.filter(function(t) { return t !== topic })
  } else {
    topic.forEach(this.unsubscribe.bind(this))
  }

  return this
}

MQReadable.prototype.close = function() {
  this.end()
}

MQReadable.prototype._flush = function(callback) {
  var that = this

  this._topics.forEach(function(topic) {
    that.unsubscribe(topic)
  })

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

  return streams.Transform.prototype.pipe.call(this, destination, options)
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
