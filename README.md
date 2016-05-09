mqstreams&nbsp;&nbsp;[![Build Status](https://travis-ci.org/mcollina/mqstreams.svg)](https://travis-ci.org/mcollina/mqstreams)
=================================================================

Publish-Subscribe node streams style, based on
[mqemitter](http://github.com/mcollina/mqemitter).

  * <a href="#install">Installation</a>
  * <a href="#basic">Basic Example</a>
  * <a href="#api">API</a>
  * <a href="#license">Licence &amp; copyright</a>

<a name="install"></a>
## Installation

```
$ npm install mqemitter mqstreams --save
```

<a name="basic"></a>
## Basic Example

```js
'use strict'

var mqemitter = require('mqemitter')
var mqstreams = require('mqstreams')
var emitter = mqstreams(mqemitter())
var through = require('through2')
var input = emitter.writable()
var output = emitter.readable('output/#')

emitter
  .readable('some/+')
  .pipe(through.obj(function (msg, enc, callback) {
    msg.topic = 'output/' + msg.topic
    this.push(msg)
    callback()
  }))
  .pipe(emitter.writable())

input.write({ topic: 'some/food', type: 'greek' })
input.write({ topic: 'some/startup', type: 'instasomething' })
input.end({ topic: 'some/dev', type: 'matteo' })

output.on('data', function (msg) {
  console.log(msg)

  // OUTPUT:
  // { topic: 'output/some/food', type: 'greek' }
  // { topic: 'output/some/startup', type: 'instasomething' }
  // { topic: 'output/some/dev', type: 'matteo' }
})
```

## API

  * <a href="#mqstreams"><code>mqstreams</code></a>
  * <a href="#readable"><code>emitter#<b>readable()</b></code></a>
  * <a href="#writable"><code>emitter#<b>writable()</b></code></a>

-------------------------------------------------------
<a name="mqstreams"></a>
### mqstreams(mqemitter)

Extends the MQEmitter with the `readable()` and `writable()` methods.

-------------------------------------------------------
<a name="readable"></a>
### emitter.readable([topic], [opts])

Return
a [`Readable`](http://nodejs.org/api/stream.html#stream_class_stream_readable)
stream in object mode that will include all emitter messages that match
the given topic. The `opts` parameter is passed through to the Stream
constructor. This stream fully respect the Stream3 interface.

The `topic` parameter is passed to the
[`emitter.on`](https://github.com/mcollina/mqemitter#on) method.

the returned object has the following method added:
`subscribe()`, `unsubscribe()`, `destroy()`.

<a name="readable-subscribe"></a>
#### emitter.readable#subscribe(topic)

Subscribe to the given topic, which can also be an array of topics.

<a name="readable-unsubscribe"></a>
#### emitter.readable#unsubscribe(topic)

Unsubscribe from the given topic, which can also be an array of topics.

<a name="readable-close"></a>
#### emitter.readable#destroy()

Close the stream, unsubscribing from all the topics.
This is aliased to `close()` for backwards compatibility.

-------------------------------------------------------
<a name="writable"></a>
### emitter.writable([opts])

Return
a [`Writable`](http://nodejs.org/api/stream.html#stream_class_stream_writable)
stream in object mode that will pass any message to the
[`emitter.emit`](https://github.com/mcollina/mqemitter#emit) method.
This stream fully respect the Stream3 interface.

## LICENSE

MIT
