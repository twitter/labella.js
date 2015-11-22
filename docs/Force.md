Docs ▸
[Introduction](../README.md) |
[Development](Development.md) |
[Demo](http://twitter.github.io/labella.js/)
&nbsp;&nbsp;////&nbsp;&nbsp;
API Reference ▸
**Force** |
[Node](Node.md) |
[Renderer](Renderer.md)

## labella.Force

Force is the main engine that takes your nodes (labels) and figures out where to place them on the screen.

### Common usage

```javascript
var force = new labella.Force();
  .nodes(nodes)
  // Listen when the nodes' positions are updated.
  .on('end', function(){
    // The rendering is independent from this library.
    // User can use canvas, svg or any library to draw the labels.
    // There is also a built-in helper for this purpose. See labella.Renderer
    draw(force.nodes());
  })
  // Run simulation at most 100 rounds. It may end earlier if equillibrium is reached.
  .start(100);
```

### Constructor

<a name="constructor" href="#constructor">#</a> var force = new **labella.Force**([*options:Object*]);

There are many options that you can customize when creating a force. All of them are optional though, so in the simplest case, you can use it without setting any option at all.

| option  | default | description |
| ------- | ------- | ----------- |
| minPos  | 0       | minimum position for left edge of node |
| maxPos  | null    | maximum position for right edge of node |
| damping | 0.1     | damping value for the simulation |
| epsilon | 0.003   | maximum kinetic energy that is considered stable. |
| nodeSpacing | 3   | gap between nodes |
| roundsPerTick | 100 | number of rounds in the simulation before notifying via event "tick" |
| algorithm | 'overlap' | algorithm to determine how to split nodes into multiple layers. Choose between ```'overlap'```, ```'simple'``` and ```'none'``` |
| density | 0.85 | If ```maxPos``` is set, will fill each layer at most 85% of ```maxPos - minPos``` |
| stubWidth | 1 | width of stubs for nodes pushed to the next level |

### Functions

<a name="nodes" href="#nodes">#</a> force.**nodes**([nodes:Array])

Getter/Setter. Use ```force.nodes(nodes)``` to set the nodes to place and obtain them back via ```force.nodes()```.

<a name="options" href="#options">#</a> force.**options**([options:Object])

Getter/Setter. Use ```force.options(options)``` to set the options and obtain them back via ```force.options()```.

TBD