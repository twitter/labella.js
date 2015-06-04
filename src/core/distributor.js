define([
  'core/helper',
  'lib/intervalTree'
],
function(helper, IntervalTree){
//---------------------------------------------------
// BEGIN code for this module
//---------------------------------------------------

var DEFAULT_OPTIONS = {
  algorithm: 'overlap',
  rowWidth: 1000,
  density: 0.75,
  nodeSpacing: 3,
  // bundleStubs: false,
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

  distributor.maxWidthPerRow = function(){
    return (options.density * options.rowWidth);
  };

  distributor.needToSplit = function(nodes){
    return distributor.estimateRequiredRows(nodes) > 1;
  };

  distributor.estimateRequiredRows = function(nodes){
    return Math.ceil(distributor.computeRequiredWidth(nodes) / distributor.maxWidthPerRow());
  };

  var algorithms = {
    simple: function(nodes){
      var rowsNeeded = distributor.estimateRequiredRows(nodes);

      var rows = [];
      for(var i=0;i<rowsNeeded;i++){
        rows.push([]);
      }

      nodes.forEach(function(node, i){
        var mod = i%rowsNeeded;
        rows[mod].push(node);

        var stub = node;
        for(var j=mod-1;j>=0;j--){
          stub = stub.createStub(options.stubWidth);
          rows[j].push(stub);
        }
      });

      return rows;
    },
    roundRobin: function(nodes){
      var rows = [];

      return rows;
    },
    overlap: function(nodes){
      var rows = [];
      var maxWidth = distributor.maxWidthPerRow();

      var puntedNodes = nodes.concat();
      var puntedWidth = distributor.computeRequiredWidth(puntedNodes);

      while(puntedWidth > maxWidth){
        distributor.countIdealOverlaps(puntedNodes);

        var nodesInCurrentRow = puntedNodes.concat();
        var currentRowWidth = puntedWidth;
        puntedNodes = [];

        while(nodesInCurrentRow.length > 2 && currentRowWidth > maxWidth){
          // Sort by overlaps
          nodesInCurrentRow.sort(function(a,b){
            return b.overlapCount - a.overlapCount;
          });

          // Remove the node with most overlap
          var first = nodesInCurrentRow.shift();

          // Update width
          currentRowWidth -= first.width;
          currentRowWidth += options.stubWidth;

          // Update overlap count for the remaining nodes
          first.overlaps.forEach(function(node){
            node.overlapCount--;
          });

          // Add removed node to the next row
          puntedNodes.push(first);
        }

        rows.push(nodesInCurrentRow);

        puntedWidth = distributor.computeRequiredWidth(puntedNodes);
      }

      if(puntedNodes.length>0){
        rows.push(puntedNodes);
      }

      // Create stubs
      // From last row
      for(var i=rows.length-1; i>=1; i--){
        var row = rows[i];
        // For each node in the row
        for(var k=0; k<row.length; k++){
          var node = row[k];
          // If it is not a stub
          if(node.isStub()) continue;
          // Create one stub for each row above it
          var stub = node;
          for(var j=i-1;j>=0;j--){
            stub = stub.createStub(options.stubWidth);
            rows[j].push(stub);
          }
        }
      }

      return rows;
    }
  };

  distributor.countIdealOverlaps = function(nodes){
    var iTree = new IntervalTree(options.rowWidth/2);
    nodes.forEach(function(node){
      iTree.add([node.idealLeft(), node.idealRight(), node]);
    });

    nodes.forEach(function(node){
      var overlaps = iTree.search(node.idealLeft(), node.idealRight());
      node.overlaps = overlaps;
      node.overlapCount = overlaps.length;
    });

    return nodes;
  };

  distributor.distribute = function(nodes){
    if(!nodes || nodes.length===0) return [];

    nodes = nodes.concat().sort(function(a,b){
      return a.idealPos - b.idealPos;
    });

    if(!distributor.needToSplit(nodes)){
      return [nodes];
    }

    if(typeof options.algorithm == 'function'){
      return options.algorithm(nodes, options);
    }
    else if(options.algorithm=='none'){
      return nodes;
    }
    else if(algorithms.hasOwnProperty(options.algorithm)){
      return algorithms[options.algorithm](nodes);
    }
    else{
      throw 'Unknown algorithm: ' + options.algorithm;
    }
  };

  return distributor;
};

Distributor.DEFAULT_OPTIONS = DEFAULT_OPTIONS;

// return module
return Distributor;

//---------------------------------------------------
// END code for this module
//---------------------------------------------------
});