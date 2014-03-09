var mqemitter = require('mqemitter')
  , mqstreams = require('./')
  , emitter = mqstreams(mqemitter())
  , through = require('through2')
  , input = emitter.writable()
  , output = emitter.readable('output/#')

emitter.readable('some/+')
       .pipe(through.obj(function(msg, enc, callback) {
           msg.topic = 'output/' + msg.topic
           this.push(msg)
           callback()
         }))
       .pipe(emitter.writable())

input.write({ topic: 'some/food', type: 'greek' })
input.write({ topic: 'some/startup', type: 'instasomething' })
input.end({ topic: 'some/dev', type: 'matteo' })


output.on('data', function(msg) {
  console.log(msg)

  // OUTPUT:
  // { topic: 'output/some/food', type: 'greek' }
  // { topic: 'output/some/startup', type: 'instasomething' }
  // { topic: 'output/some/dev', type: 'matteo' }
})
