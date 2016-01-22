var Node = require('./node.js');
var helper = require('./helper.js');

module.exports = (function(){
  var util = {};

  var OPTIONS = {
    minWidth: 20,
    maxWidth: 20,
    minPos: 0,
    maxPos: 800
  };

  util.generateNodes = function(amount, options){
    var nodes = [];
    options = helper.extend({}, OPTIONS, options);
    var diffPos = options.maxPos - options.minPos;
    var diffWidth = options.maxWidth - options.minWidth;
    for(var i=0;i<amount;i++){
      nodes.push(new Node(
        Math.floor(Math.random()*diffPos) + options.minPos,
        Math.floor(Math.random()*diffWidth) + options.minWidth
      ));
    }
    return nodes;
  };

  util.convertNodesToGraph = function(nodes){
    yGap = 60;
    var graph = {
      nodes: [],
      links: [],
      constraints: []
    };

    var alignmentConstraint1 = {
      type: 'alignment',
      axis: 'y',
      offsets: []
    };

    var alignmentConstraint2 = {
      type: 'alignment',
      axis: 'y',
      offsets: []
    };

    // graph.constraints.push(alignmentConstraint1);
    graph.constraints.push(alignmentConstraint2);

    // minPos
    graph.nodes.push({
      index: 0,
      x: 1,
      y: yGap,
      width: 1,
      height: 1,
      fixed: true
    });

    // maxPos
    graph.nodes.push({
      index: 0,
      x: 900 + 25,
      y: yGap,
      width: 1,
      height: 1,
      fixed: true
    });

    nodes.forEach(function(node){
      var node1 = {
        index: graph.nodes.length,
        x: node.idealPos,
        y: 0,
        width: 1,
        height: 1,
        fixed: true
      };

      // alignmentConstraint1.offsets.push({
      //   node: node1.index,
      //   offset: 0
      // });
      graph.nodes.push(node1);

      var node2 = {
        index: graph.nodes.length,
        x: node.currentPos,
        y: yGap,
        width: node.width,
        height: 12,
        originalNode: node
      };

      alignmentConstraint2.offsets.push({
        node: node2.index,
        offset: 0
      });
      graph.nodes.push(node2);

      graph.links.push({
        source: node1.index,
        target: node2.index
      });

      graph.constraints.push({
        axis: 'y',
        left: node1.index,
        right: node2.index,
        gap: yGap,
        equality: true
      });

      // min pos constraint
      graph.constraints.push({
        axis: 'x',
        left: 0,
        right: node2.index,
        gap: 0
      });

      // max pos constraint
      graph.constraints.push({
        axis: 'x',
        left: node2.index,
        right: 1,
        gap: 0
      });

    });

    return graph;
  };

  util.updateNodesInGraph = function(group){
    return graph.nodes
      .filter(function(d){return d.originalNode;})
      .map(function(d){
        d.originalNode.currentPos = d.x;
        return d.originalNode;
      });
  };

  return util;
}());