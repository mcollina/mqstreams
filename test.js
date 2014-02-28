var test = require('tap').test
  , mq = require('mqemitter')
  , mqstreams = require('./')

test('supports readable', function(t) {
  t.plan(1)

  var e = mqstreams(mq())
    , expected = {
          topic: 'hello world'
        , payload: { my: 'message' }
      }
    , stream = e.readable('hello world')


  e.emit(expected)

  stream.on('data', function(message) {
    t.equal(message, expected)
    t.end()
  })
})

test('avoid overflow in readable', function(t) {
  t.plan(1)

  var e = mqstreams(mq())
    , expected = {
          topic: 'hello world'
        , payload: { my: 'message' }
      }
    , stream = e.readable('hello world')
    , called

  e.emit(expected, function() {
    t.ok(called, 'the readable stream was not called')
  })

  stream.on('data', function(message) {
    called = true
  })
})

test('supports writable', function(t) {
  t.plan(1)

  var e = mqstreams(mq())
    , expected = {
          topic: 'hello world'
        , payload: { my: 'message' }
      }
    , stream = e.writable()


  e.on('hello world', function(message, cb) {
    cb()
    t.equal(message, expected)
  })


  stream.write(expected)
})

test('avoid overflow in writable', function(t) {
  var e = mqstreams(mq())
    , expected = {
          topic: 'hello world'
        , payload: { my: 'message' }
      }
    , stream = e.writable()

  e.on('hello world', function(message, cb) {
    t.equal(message, expected)
    cb()
  })

  stream.end(expected, function() {
    t.end()
  })
})
