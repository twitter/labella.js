var helper = require('./helper.js');
var IntervalTree = require('../lib/intervalTree.js');

var DEFAULT_OPTIONS = {
  algorithm: 'overlap',
  layerWidth: 1000,
  density: 0.75,
  nodeSpacing: 3,
  stubWidth: 1
};

var Distributor = function(options){
  var distributor = {};

  options = helper.extend({}, DEFAULT_OPTIONS, options);

  distributor.options = function(x){
    if (!arguments.length) return options;
    options = helper.extend(options, x);
    return distributor;
  };

  distributor.computeRequiredWidth = function(nodes){
    return helper.sum(nodes, function(d){
      return d.width + options.nodeSpacing;
    }) - options.nodeSpacing;
  };

  distributor.maxWidthPerLayer = function(){
    return (options.density * options.layerWidth);
  };

  distributor.needToSplit = function(nodes){
    return distributor.estimateRequiredLayers(nodes) > 1;
  };

  distributor.estimateRequiredLayers = function(nodes){
    return options.layerWidth ? Math.ceil(distributor.computeRequiredWidth(nodes) / distributor.maxWidthPerLayer()) : 1;
  };

  var algorithms = {
    simple: function(nodes){
      var numLayers = distributor.estimateRequiredLayers(nodes);

      var layers = [];
      for(var i=0;i<numLayers;i++){
        layers.push([]);
      }

      nodes.forEach(function(node, i){
        var mod = i%numLayers;
        layers[mod].push(node);

        var stub = node;
        for(var j=mod-1;j>=0;j--){
          stub = stub.createStub(options.stubWidth);
          layers[j].push(stub);
        }
      });

      return layers;
    },
    roundRobin: function(nodes){
      var layers = [];

      return layers;
    },
    overlap: function(nodes){
      var layers = [];
      var maxWidth = distributor.maxWidthPerLayer();

      var puntedNodes = nodes.concat();
      var puntedWidth = distributor.computeRequiredWidth(puntedNodes);

      while(puntedWidth > maxWidth){
        distributor.countIdealOverlaps(puntedNodes);

        var nodesInCurrentLayer = puntedNodes.concat();
        var currentlayerWidth = puntedWidth;
        puntedNodes = [];

        while(nodesInCurrentLayer.length > 2 && currentlayerWidth > maxWidth){
          // Sort by overlaps
          nodesInCurrentLayer.sort(function(a,b){
            return b.overlapCount - a.overlapCount;
          });

          // Remove the node with most overlap
          var first = nodesInCurrentLayer.shift();

          // Update width
          currentlayerWidth -= first.width;
          currentlayerWidth += options.stubWidth;

          // Update overlap count for the remaining nodes
          first.overlaps.forEach(function(node){
            node.overlapCount--;
          });

          // Add removed node to the next layer
          puntedNodes.push(first);
        }

        layers.push(nodesInCurrentLayer);

        puntedWidth = distributor.computeRequiredWidth(puntedNodes);
      }

      if(puntedNodes.length>0){
        layers.push(puntedNodes);
      }

      // Create stubs
      // From last layer
      for(var i=layers.length-1; i>=1; i--){
        var layer = layers[i];
        // For each node in the layer
        for(var k=0; k<layer.length; k++){
          var node = layer[k];
          // If it is not a stub
          if(node.isStub()) continue;
          // Create one stub for each layer above it
          var stub = node;
          for(var j=i-1;j>=0;j--){
            stub = stub.createStub(options.stubWidth);
            layers[j].push(stub);
          }
        }
      }

      return layers;
    }
  };

  distributor.countIdealOverlaps = function(nodes){
    var iTree = new IntervalTree(options.layerWidth/2);
    nodes.forEach(function(node){
      iTree.add([node.idealLeft(), node.idealRight(), node]);
    });

    nodes.forEach(function(node){
      var overlaps = iTree.search(node.idealLeft(), node.idealRight());
      node.overlaps = overlaps.map(function(x) { return x.data[2]; });
      node.overlapCount = overlaps.length;
    });

    return nodes;
  };

  distributor.distribute = function(nodes){
    if(!nodes || nodes.length===0) return [];

    if(options.algorithm=='none' || !helper.isDefined(options.algorithm)){
      return [nodes];
    }

    if(!distributor.needToSplit(nodes)){
      return [nodes];
    }

    const sortedNodes = nodes.concat().sort(function(a,b){
      return a.idealPos - b.idealPos;
    });

    if(typeof options.algorithm == 'function'){
      return options.algorithm(sortedNodes, options);
    }
    else if(algorithms.hasOwnProperty(options.algorithm)){
      return algorithms[options.algorithm](sortedNodes);
    }
    else{
      throw 'Unknown algorithm: ' + options.algorithm;
    }
  };

  return distributor;
};

Distributor.DEFAULT_OPTIONS = DEFAULT_OPTIONS;

// return module
module.exports = Distributor;
