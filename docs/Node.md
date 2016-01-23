Docs ▸
[Introduction](../README.md) |
[Development](Development.md) |
[Demo](http://twitter.github.io/labella.js/)
&nbsp;&nbsp;////&nbsp;&nbsp;
API Reference ▸
[Force](Force.md) |
**Node** |
[Renderer](Renderer.md)

## labella.Node

Node is an instance to wrap each of your label. You have to specify a desired position (*idealPos*) and *width* for each label. You may also attach *data* to the node, such as label text.

<a name="constructor" href="#constructor">#</a> var node = new **labella.Node**(idealPos:Number, width:Number [, data:Any]);

### Fields

<a name="idealPos" href="#idealPos">#</a> node.**idealPos**

Desired position for this node

<a name="currentPos" href="#currentPos">#</a> node.**currentPos**

Current position of this node, set to *idealPos* automatically in the beginning. This field will be updated by the force to the position appropriate for drawing this node.

<a name="width" href="#width">#</a> node.**width**

The width of this node. Note that this width means the width along the main axis, so if the axis is vertical, this field should be the height of the label.

<a name="data" href="#data">#</a> node.**data**

Attach data about each label. This can be any value (String, Number, etc.)

### Functions

<a name="getLayerIndex" href="#getLayerIndex">#</a> node.**getLayerIndex**()

Return index of the layer that this node was placed in. (In the beginning of the layout process, the force distribute nodes into multiple layers if all nodes cannot fit within one layer.)