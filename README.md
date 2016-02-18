Docs ▸
**Introduction** |
[Development](docs/Development.md) |
[Demo](http://twitter.github.io/labella.js/)
&nbsp;&nbsp;////&nbsp;&nbsp;
API Reference ▸
[Force](docs/Force.md) |
[Node](docs/Node.md) |
[Renderer](docs/Renderer.md)

# Labella.js [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url]

> "Labels should be beautiful."

If you try to place labels for points on a timeline (or any 1D space), one common problem is the labels often overlap.
How about making the labels push each other and find where they can stay with overlapping?

* Play with [interactive demo](http://twitter.github.io/labella.js/) to learn more
* See examples: [up](http://twitter.github.io/labella.js/basic_up.html) |
[down](http://twitter.github.io/labella.js/basic_down.html) |
[left](http://twitter.github.io/labella.js/basic_left.html) |
[right](http://twitter.github.io/labella.js/basic_right.html) |
[with text (v)](http://twitter.github.io/labella.js/with_text.html) |
[with text (h)](http://twitter.github.io/labella.js/with_text2.html)
* Read the instructions on this page or API reference.

Moreover, if you are looking for a ready-to-use timeline component with Labella's smart labeling instead of building your own timeline from scratch, check out [d3Kit-timeline](https://github.com/kristw/d3kit-timeline).

**Note:** For users who are upgrading from v0.x.x to v1.x.x. The API has changed. `force.start()` and `force.on()` are deprecated. Both are replaced by `force.compute()` which has to be called slightly differently. Please read the [change logs](CHANGELOG.md#migrate-0.x.x-1.x.x).

### Install

```
npm install labella --save
```

or

```
bower install labella --save
```

### Example

```javascript
// idealPos: The most preferred position for each label
// width:    The width of each label
var nodes = [
  new labella.Node(1, 50), // idealPos, width
  new labella.Node(2, 50),
  new labella.Node(3, 50),
  new labella.Node(3, 50),
  new labella.Node(3, 50),
];

var force = new labella.Force()
  .nodes(nodes)
  .compute();

// The rendering is independent from this library.
// User can use canvas, svg or any library to draw the labels.
// There is also a built-in helper for this purpose. See labella.Renderer
draw(force.nodes());
```

### Import into your project

##### Choice 1. Global

Adding this library via ```<script>``` tag is the simplest way. By doing this, ```labella``` is available in the global scope.

```html
<script src="labella.min.js"></script>
```

##### Choice 2: AMD

If you use requirejs, Labella.js support AMD out of the box.

```javascript
require(['path/to/labella'], function(labella) {
  // do something
});
```

##### Choice 3: node.js / browserify

Labella.js also supports usage in commonjs style.

```javascript
var labella = require('path/to/labella');
```

### Files

The *dist* directory contains four variations of this library:

- *labella.js* and *labella.min.js* : Core functionalities. This is what you will need for regular use.
- *labella-extra.js* and *labella-extra.min.js* (since v1.1.0) : Same content with the above bundle plus `labella.util` and `labella.metrics`, which are special modules for demo/evaluation.

### Author

Krist Wongsuphasawat / [@kristw](https://twitter.com/kristw)

Copyright 2015 Twitter, Inc. Licensed under the [Apache License Version 2.0](http://www.apache.org/licenses/LICENSE-2.0)

[npm-image]: https://badge.fury.io/js/labella.svg
[npm-url]: https://npmjs.org/package/labella
[travis-image]: https://travis-ci.org/twitter/labella.js.svg?branch=master
[travis-url]: https://travis-ci.org/twitter/labella.js
