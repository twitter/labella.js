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
There are actually two steps in this process: *distribute* and *remove overlap(s)*, but you do not need to call these step separately, ```force.compute()``` will take care of both and notify when everything is completed.

In the *distribute* step, the nodes are split into multiple layers if all nodes cannot fit within one layer. In the *remove overlap(s)* step, Labella employs a constraint-based layout algorithm and uses special quadratric programming solver called [VPSC](https://github.com/tgdwyer/WebCola/wiki/What-is-VPSC%3F) to find the best location to place the nodes. (In Labella 0.x.x, this step was a force-directed simulation, which was slower.)

### Common usage

```javascript
var force = new labella.Force()
  .nodes(nodes)
  .compute();

// The rendering is independent from this library.
// User can use canvas, svg or any library to draw the labels.
// There is also a built-in helper for this purpose. See labella.Renderer
draw(force.nodes());
```

### Constructor

<a name="constructor" href="#constructor">#</a> var force = new **labella.Force**([*options:Object*]);

There are many options that you can customize when creating a force. All of them are optional though, so in the simplest case, you can use it without setting any option at all.

| option  | default | description |
| ------- | ------- | ----------- |
| minPos  | 0       | minimum position for left edge of node (can set to `null` if don't want to limit minimum position) |
| maxPos  | null    | maximum position for right edge of node |
| lineSpacing | 2   | gap between lines |
| nodeSpacing | 3   | gap between nodes |
| algorithm | 'overlap' | algorithm to determine how to split nodes into multiple layers. Choose between ```'overlap'```, ```'simple'``` and ```'none'``` |
| density | 0.85 | If ```maxPos``` is set, will fill each layer at most 85% of ```maxPos - minPos``` |
| stubWidth | 1 | width of stubs for nodes pushed to the next level |

### Functions

<a name="nodes" href="#nodes">#</a> force.**nodes**([nodes:Array])

Getter/Setter. Use ```force.nodes(nodes)``` to set the nodes to place and obtain them back via ```force.nodes()```.

<a name="options" href="#options">#</a> force.**options**([options:Object])

Getter/Setter. Use ```force.options(options)``` to set the options and obtain them back via ```force.options()```.

<a name="compute" href="#compute">#</a> force.**compute**()

Compute the best positions for all nodes. Return `force`

