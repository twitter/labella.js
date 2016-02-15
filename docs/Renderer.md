Docs ▸
[Introduction](../README.md) |
[Development](Development.md) |
[Demo](http://twitter.github.io/labella.js/)
&nbsp;&nbsp;////&nbsp;&nbsp;
API Reference ▸
[Force](Force.md) |
[Node](Node.md) |
**Renderer**

## labella.Renderer

Renderer is a utility for drawing the output from labella.

### Common usage

```javascript
var renderer = new labella.Renderer({
  layerGap: 60,
  nodeHeight: 12,
  direction: 'up'
});

function draw(nodes){
  // Add x,y,dx,dy to node
  renderer.layout(nodes);

  // Draw label rectangles
  d3.selectAll('rect.label')
    .data(nodes)
  .enter().append('rect')
    .classed('label', true)
    .attr('x', function(d){ return d.x - d.dx/2; })
    .attr('y', function(d){ return d.y; })
    .attr('width', function(d){ return d.dx; })
    .attr('height', function(d){ return d.dy; });

  // Draw path from point on the timeline to the label rectangle
  d3.selectAll('path.link')
    .data(nodes)
  .enter().append('path')
    .classed('link', true)
    .attr('d', function(d){return renderer.generatePath(d);});
}
```

### Constructor

<a name="constructor" href="#constructor">#</a> var renderer = new **labella.Renderer**([options: Object]);

There are a few options that you can customize when creating a renderer.

| option  | default | description |
| ------- | ------- | ----------- |
| layerGap  | 60 | gap between layer of labels |
| nodeHeight  | 12 | For horizontal axis, this is the height of each label. For vertical axis, this is the width of each label. |
| direction | 'down' | placement of the label relative to the axis. Choose from ```'up'```, ```'down'```, ```'left'``` or ```'right'```. Use ```'left'``` or ```'right'``` for vertical axis and ```'up'``` or ```'down'``` for horizontal axis. See [example](http://twitter.github.io/labella.js/basic_down.html).|

### Functions

<a name="generatePath" href="#generatePath">#</a> renderer.**generatePath(node:Node)**

Generate value for ```<path>``` attribute ```d``` for given node to draw the route from axis to label.

<a name="getWaypoints" href="#getWaypoints">#</a> renderer.**getWaypoints(node:Node)**

Return points on the route from axis to label. The returned value is an array of array of points.

```
[
  [point on the axis],
  [top point on layer1, bottom point on layer1],
  [top point on layer2, bottom point on layer2],
  ...
]
```
Each point is also an array [x, y].

<a name="layout" href="#layout">#</a> renderer.**layout(nodes:Array)**

Add ```x```, ```y```, ```dx``` and ```dy``` to each node in the input array.
