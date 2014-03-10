var test = require('tap').test
  , mq = require('mqemitter')
  , mqstreams = require('./')
  , streams = require('readable-stream')

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

test('close a readable stream', function(t) {
  t.plan(3)

  var e = mqstreams(mq())
    , expected = {
          topic: 'hello world'
        , payload: { my: 'message' }
      }
    , stream = e.readable('hello world')

  e.emit(expected)

  stream.on('end', function() {
    t.ok(true, 'should emit end')
  })

  stream.on('close', function() {
    t.ok(true, 'should emit close')
  })

  stream.once('data', function(message) {
    stream.close()

    stream.on('data', function() {
      t.ok(false, 'should not emit again')
    })

    e.emit(expected, function() {
      t.ok(true, 'should call the callback')
    })
  })
})

test('close a readable stream when downstream is closed', function(t) {
  t.plan(1)

  var e = mqstreams(mq())
    , expected = {
          topic: 'hello world'
        , payload: { my: 'message' }
      }
    , stream = e.readable('hello world')
    , writable = new streams.Writable({ objectMode: true })

  writable._write = function(a, b, cb) { cb() }

  stream.pipe(writable)
  e.emit(expected, function() {
    writable.end()
  })

  stream.on('close', function() {
    t.ok(true, 'should emit close')
  })
})

test('close a readable stream when downstream errors', function(t) {
  t.plan(1)

  var e = mqstreams(mq())
    , expected = {
          topic: 'hello world'
        , payload: { my: 'message' }
      }
    , stream = e.readable('hello world')
    , writable = new streams.Writable({ objectMode: true })

  writable._write = function(a, b, cb) { cb() }

  t.equal(stream.pipe(writable), writable);

  e.emit(expected, function() {
    writable.emit('error', new Error('fake error'))
  })

  stream.on('close', function() {
    t.ok(true, 'should emit close')
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

test('multi-subscription readable', function(t) {
  t.plan(2)

  var e = mqstreams(mq())
    , expected = {
          topic: 'hello world'
        , payload: { my: 'message' }
      }
    , stream = e.readable()

  stream.subscribe('hello world')
  stream.subscribe('matteo')

  e.emit(expected)
  e.emit({ topic: 'matteo' })

  stream.on('data', function(message) {
    t.ok(message, 'receive a message')
  })
})

test('readable#unsubscribe', function(t) {
  t.plan(1)

  var e = mqstreams(mq())
    , expected = {
          topic: 'hello world'
        , payload: { my: 'message' }
      }
    , stream = e.readable()

  stream.subscribe('hello world')
  stream.unsubscribe('hello world')
  stream.subscribe('matteo')

  e.emit(expected)
  e.emit({ topic: 'matteo' })

  stream.on('data', function(message) {
    t.ok(message, 'receive a message')
  })
})

test('close a readable stream with multiple subscriptions', function(t) {
  var e = mqstreams(mq())
    , expected = {
          topic: 'hello world'
        , payload: { my: 'message' }
      }
    , stream = e.readable()

  e.emit(expected)

  stream.subscribe('hello world')
  stream.subscribe('hello matteo')

  stream.on('close', function() {
    t.ok(true, 'should emit close')

    stream.on('data', function(message) {
      t.nok(message, 'should not emit any data event')
    })

    e.emit(expected)
    t.end()
  })

  stream.close()
})

test('subscribe to multiple topics', function(t) {
  t.plan(2)

  var e = mqstreams(mq())
    , expected = {
          topic: 'hello world'
        , payload: { my: 'message' }
      }
    , stream = e.readable()

  stream.subscribe(['hello world', 'matteo'])

  e.emit(expected)
  e.emit({ topic: 'matteo' })

  stream.on('data', function(message) {
    t.ok(message, 'receive a message')
  })
})

test('unsubscribe from multiple topics', function(t) {
  t.plan(1)

  var e = mqstreams(mq())
    , expected = {
          topic: 'hello world'
        , payload: { my: 'message' }
      }
    , stream = e.readable()

  stream.subscribe('hello world')
  stream.subscribe('hello matteo')
  stream.unsubscribe(['hello world', 'hello matteo'])
  stream.subscribe('matteo')

  e.emit(expected)
  e.emit({ topic: 'matteo' })

  stream.on('data', function(message) {
    t.ok(message, 'receive a message')
  })
})
