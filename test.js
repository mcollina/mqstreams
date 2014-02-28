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

  e.emit(expected, function() {
    // this will fail if it has not waited the stream
    // to flow

    t.end()
  })

  stream.on('data', function(message) {
    t.equal(message, expected)
  })
})
