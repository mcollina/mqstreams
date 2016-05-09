'use strict'

var streams = require('readable-stream')
var util = require('util')
var assert = require('assert')
var mqemitter = require('mqemitter')

function mqstreams (mq) {
  // prototype chain all the things!
  mq = mq && Object.create(mq) || mqemitter()

  mq.readable = function (topic, opts) {
    return new MQReadable(this, topic, opts)
  }

  mq.writable = function (opts) {
    return new MQWritable(this, opts)
  }

  return mq
}

function MQReadable (mq, topic, opts) {
  if (typeof topic === 'object') {
    opts = topic
    topic = null
  }

  opts = opts || {}
  opts.objectMode = true
  opts.highWaterMark = opts.highWaterMark || 16

  streams.PassThrough.call(this, opts)

  this._topics = []
  this.mq = mq

  var that = this
  this._callback = function forward (message, cb) {
    that.write(message, cb)
  }

  if (topic) {
    this.subscribe(topic)
  }
}

util.inherits(MQReadable, streams.PassThrough)

MQReadable.prototype.subscribe = function (topic) {
  assert(topic)

  if (typeof topic === 'string') {
    this.mq.on(topic, this._callback)
    this._topics.push(topic)
  } else {
    topic.forEach(this.subscribe.bind(this))
  }

  return this
}

MQReadable.prototype.unsubscribe = function (topic) {
  assert(topic)

  if (typeof topic === 'string') {
    this.mq.removeListener(topic, this._callback)
    this._topics.filter(function (t) { return t !== topic })
  } else {
    topic.forEach(this.unsubscribe.bind(this))
  }

  return this
}

MQReadable.prototype.destroy = function () {
  this.end()
}

MQReadable.prototype.close = MQReadable.prototype.destroy

MQReadable.prototype._flush = function (callback) {
  var that = this

  this._topics.forEach(function (topic) {
    that.unsubscribe(topic)
  })

  callback()

  this.emit('close')
}

function MQWritable (mq, topic, opts) {
  opts = opts || {}
  opts.objectMode = true
  opts.highWaterMark = opts.highWaterMark || 16

  streams.Writable.call(this, opts)

  this.mq = mq
}

util.inherits(MQWritable, streams.Writable)

MQWritable.prototype._write = function (data, encoding, cb) {
  this.mq.emit(data, cb)
}

module.exports = mqstreams
