define([
  'core/helper'
],
function(helper){
//---------------------------------------------------
// BEGIN code for this module
//---------------------------------------------------

var module = (function(){
  var metrics = {};

  function convertNodesToRowsOfNodes(nodes){
    return nodes.length===0 || Array.isArray(nodes[0]) ? nodes : [nodes];
  }

  metrics.displacement = function(nodes){
    if(nodes.length===0) return 0;
    var rows = convertNodesToRowsOfNodes(nodes);
    return helper.sum(rows, function(row){
      return helper.sum(row, function(node){
        return Math.abs(node.displacement());
      });
    });
  };

  metrics.overflow = function(nodes, minPos, maxPos){
    if(nodes.length===0 || (!helper.isDefined(minPos) && !helper.isDefined(maxPos))) return 0;
    var rows = convertNodesToRowsOfNodes(nodes);

    return helper.sum(rows, function(row){
      return helper.sum(row, function(node){
        var l = node.currentLeft();
        var r = node.currentRight();

        if(helper.isDefined(minPos)){
          if(r<=minPos){
            return node.width;
          }
          else if(l<minPos){
            return minPos - l;
          }
        }

        if(helper.isDefined(maxPos)){
          if(l>=maxPos){
            return node.width;
          }
          else if(r>maxPos){
            return r - maxPos;
          }
        }

        return 0;
      });
    });

  };

  metrics.overDensity = function(nodes, density, rowWidth, nodeSpacing){
    if(nodes.length===0) return 0;

    var limit = density * rowWidth;

    var rows = convertNodesToRowsOfNodes(nodes);
    return helper.sum(rows, function(row){
      var width = helper.sum(row, function(node){
        return node.width + nodeSpacing;
      }) - nodeSpacing;
      return width <= limit ? 0 : width - limit;
    });
  };

  metrics.overlapCount = function(nodes, buffer){
    if(nodes.length===0) return 0;
    var rows = convertNodesToRowsOfNodes(nodes);
    return helper.sum(rows, function(row){
      var count = 0;
      for(var i=0; i<row.length;i++){
        for(var j=i+1; j<row.length; j++){
          if(row[i].overlapWithNode(row[j], buffer)){
            count++;
          }
        }
      }
      return count;
    });
  };

  metrics.overlapSpace = function(nodes){
    if(nodes.length===0) return 0;
    var rows = convertNodesToRowsOfNodes(nodes);
    return helper.sum(rows, function(row){
      var count = 0;
      for(var i=0; i<row.length;i++){
        for(var j=i+1; j<row.length; j++){
          var distance = row[i].distanceFrom(row[j]);
          count += distance<0 ? Math.abs(distance) : 0;
        }
      }
      return count;
    });
  };

  metrics.weightedAllocatedSpace = function(nodes){
    if(nodes.length===0) return 0;
    var rows = convertNodesToRowsOfNodes(nodes);
    console.log('nodes', nodes);

    return helper.sum(rows, function(row, rowIndex){
      console.log('rowIndex', rowIndex);
      return rowIndex * helper.sum(row, function(d){return d.width;});
    });
  };

  return metrics;
}());

// return module
return module;

//---------------------------------------------------
// END code for this module
//---------------------------------------------------
});