mqstreams&nbsp;&nbsp;[![Build Status](https://travis-ci.org/mcollina/mqstreams.png)](https://travis-ci.org/mcollina/mqstreams)
=================================================================

Publish-Subscribe node streams style, based on
[mqemitter](http://github.com/mcollina/mqemitter).

  * <a href="#install">Installation</a>
  * <a href="#basic">Basic Example</a>
  * <a href="#api">API</a>
  * <a href="#licence">Licence &amp; copyright</a>

<a name="install"></a>
## Installation

```
$ npm install mqemitter mqstreams --save
```

<a name="basic"></a>
## Basic Example

```js
var mqemitter = require('mqemitter')
  , mqstreams = require('mqstreams')
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
constructor. This stream fully respect the Stream2 interface.

The `topic` parameter is passed to the
[`emitter.on`](https://github.com/mcollina/mqemitter#on) method.

the returned object has the following method added:
`subscribe()`, `unsubscribe()`, `close()`.

<a name="readable-subscribe"></a>
#### emitter.readable#subscribe(topic)

Subscribe to the given topic, which can also be an array of topics.

<a name="readable-unsubscribe"></a>
#### emitter.readable#unsubscribe(topic)

Unsubscribe from the given topic, which can also be an array of topics.

<a name="readable-close"></a>
#### emitter.readable#close()

Close the stream, unsubscribing from all the topics.

-------------------------------------------------------
<a name="writable"></a>
### emitter.writable([opts])

Return
a [`Writable`](http://nodejs.org/api/stream.html#stream_class_stream_writable)
stream in object mode that will pass any message to the
[`emitter.emit`](https://github.com/mcollina/mqemitter#emit) method.
This stream fully respect the Stream2 interface.

## LICENSE

Copyright (c) 2014, Matteo Collina <hello@matteocollina.com>

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR
IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
