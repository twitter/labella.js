var nodes = [
  new labella.Node(1,50),
  new labella.Node(2,50),
  new labella.Node(3,50),
  new labella.Node(3,50),
  new labella.Node(3,50),
  new labella.Node(304,50),
  new labella.Node(454,50),
  new labella.Node(454,50),
  new labella.Node(454,50),
  new labella.Node(804,50),
  new labella.Node(804,70),
  new labella.Node(804,50),
  new labella.Node(804,50),
  new labella.Node(854,50),
  new labella.Node(854,50)
];

var skeleton = new d3Kit.Skeleton('#timeline',
  {
    margin: {left: 20, right: 20, top: 20, bottom: 20},
    initialWidth: 1000,
    initialHeight: 112,
    labelHeight: 12
  }
);

var layers = skeleton.getLayerOrganizer();
var options = skeleton.options();
layers.create(['line', 'path', 'label', 'dot']);

var colorScale = d3.scale.category10();

var renderer = new labella.Renderer({
  rowGap: 60,
  labelHeight: options.labelHeight
});

layers.get('line').append('line')
  .attr('x2', skeleton.getInnerWidth())
  .style('stroke-width', 2)
  .style('stroke', '#222');

function color(d,i){
  return colorScale(i);
}

function draw(nodes){
  nodes.forEach(function(node){
    node.y = renderer.nodePos(node);
  });

  // ---------------------------------------------------
  // Draw dots on the timeline
  // ---------------------------------------------------

  var dots = layers.get('dot').selectAll('circle.dot')
    .data(nodes);

  dots.enter().append('circle')
    .classed('dot', true)
    .attr('r', 3)
    .attr('cx', function(d){return d.getRoot().idealPos;})
    .style('fill', '#222');

  // ---------------------------------------------------
  // Draw label rectangles
  // ---------------------------------------------------

  var rect = layers.get('label').selectAll('rect.flag')
    .data(nodes);

  rect.enter().append('rect')
    .classed('flag', true)
    .attr('x', function(d){ return d.currentPos - d.width/2; })
    .attr('y', function(d){ return d.y; })
    .attr('width', function(d){return d.width;})
    .attr('height', options.labelHeight)
    .style('opacity', function(d){return d.isStub() ? 0.6: 1;})
    .style('fill', color);

  // ---------------------------------------------------
  // Draw path from point on the timeline to the label rectangle
  // ---------------------------------------------------

  var path = layers.get('path').selectAll('path')
    .data(nodes);

  path.enter().append('path')
    .attr('d', function(d){return renderer.verticalPath(d);})
    .style('stroke', color)
    .style('stroke-width',2)
    .style('opacity', 0.6)
    .style('fill', 'none');

}

//---------------------------------------------------
// Labelling code here
//---------------------------------------------------

var force = new labella.Force({
  minPos: 0,
  maxPos: 960
});

force
  .nodes(nodes)
  // Listen when the nodes' positions are updated.
  .on('end', function(){
    // Each node.currentPos should be the position to place label
    // The rendering is independent from the library.
    // User can use canvas, svg or any library to draw the labels.
    // In this example, the draw() function is defined above
    // using the built-in utility labella.Renderer.
    draw(force.nodes());
  })
  // Run simulation at most 100 rounds. It may end earlier if equillibrium is reached.
  .start(100);