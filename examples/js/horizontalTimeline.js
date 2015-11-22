var HorizontalTimeline = d3Kit.factory.createChart({
  margin: {left: 20, right: 20, top: 20, bottom: 30},
  initialHeight: 100,
  layerGap: 60,
  nodeHeight: 12
}, [], function(skeleton){

  var options = skeleton.options();
  var layers = skeleton.getLayerOrganizer();
  layers.create(['line', 'path', 'label', 'dot']);
  var colorScale = d3.scale.category10();
  var renderer = new labella.Renderer({
    layerGap: options.layerGap,
    nodeHeight: options.nodeHeight
  });

  skeleton.on('data', visualize);

  var mainLine = layers.get('line').append('line')
    .style('stroke-width', 2)
    .style('stroke', '#222');

  function visualize(){
    if(!skeleton.hasData()) return;

    var nodes = skeleton.data();
    renderer.layout(nodes);

    var height = d3.max(nodes, function(d){return d.y;});

    skeleton.height(height + options.margin.top + options.margin.bottom);
    mainLine.attr('x2', skeleton.getInnerWidth());

    // ---------------------------------------------------
    // Draw dots on the timeline
    // ---------------------------------------------------

    var dots = layers.get('dot').selectAll('circle.dot')
      .data(nodes);

    dots.exit().remove();
    dots.enter().append('circle')
      .classed('dot', true)
      .style('fill', '#222')
      .attr('r', 3);
    dots
      .attr('cx', function(d){return d.getRoot().idealPos;});

    // ---------------------------------------------------
    // Draw label rectangles
    // ---------------------------------------------------

    var rect = layers.get('label').selectAll('rect.flag')
      .data(nodes);

    rect.exit().remove();

    rect.enter().append('rect')
      .classed('flag', true)
      .attr('height', options.nodeHeight)
      .on('click', function(d){return console.log(d);})
      .style('opacity', function(d){return d.isStub() ? 0.6: 1;})
      .style('fill', color);

    rect
      .attr('x', function(d){ return d.x - d.width/2; })
      .attr('y', function(d){ return d.y; })
      .attr('width', function(d){return d.width;});

    // ---------------------------------------------------
    // Draw path from point on the timeline to the label rectangle
    // ---------------------------------------------------

    var path = layers.get('path').selectAll('path')
      .data(nodes);

    path.exit().remove();

    path.enter().append('path')
      .style('stroke', color)
      .style('stroke-width',2)
      .style('opacity', 0.6)
      .style('fill', 'none');

    path.attr('d', pathFn);
  }

  function color(d,i){
    return colorScale(i);
  }

  function pathFn(d){
    return renderer.generatePath(d);
  }

  return skeleton;
});