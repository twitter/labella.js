Docs ▸
**Introduction** |
[Development](docs/Development.md) |
[Demo](http://twitter.github.io/labella.js/)
&nbsp;&nbsp;////&nbsp;&nbsp;
API Reference ▸
[Force](docs/Force.md) |
[Node](docs/Node.md) |
[Renderer](docs/Renderer.md)

# Labella.js

*"Labels should be beautiful."*

If you try to place labels for points on a timeline (or any 1D space), one common problem is the labels often overlap.
How about making the labels push each other. Use the force, jedi-style.

See [interactive demo](http://twitter.github.io/labella.js/) or [simpler example](http://twitter.github.io/labella.js/easy.html).

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

var force = new labella.Force();
  .nodes(nodes)
  // Listen when the nodes' positions are updated.
  .on('end', function(){
    // The rendering is independent from this library.
    // User can use canvas, svg or any library to draw the labels.
    // There is also a built-in helper labella.Renderer for this purpose. See the examples
    draw(force.nodes());
  })
  // Run simulation at most 100 rounds. It may end earlier if equillibrium is reached.
  .start(100);
```

### Author

Krist Wongsuphasawat / [@kristw](https://twitter.com/kristw)

Copyright 2015 Twitter, Inc. Licensed under the [Apache License Version 2.0](http://www.apache.org/licenses/LICENSE-2.0)
