define([
  'core/helper'
],
function(helper){
//---------------------------------------------------
// BEGIN code for this module
//---------------------------------------------------

var module = (function(){
  var metrics = {};

  function toLayers(nodes){
    return nodes.length===0 || Array.isArray(nodes[0]) ? nodes : [nodes];
  }

  metrics.displacement = function(nodes){
    if(nodes.length===0) return 0;
    var layers = toLayers(nodes);
    return helper.sum(layers, function(layer){
      return helper.sum(layer, function(node){
        return Math.abs(node.displacement());
      });
    });
  };

  metrics.overflow = function(nodes, minPos, maxPos){
    if(nodes.length===0 || (!helper.isDefined(minPos) && !helper.isDefined(maxPos))) return 0;
    var layers = toLayers(nodes);

    return helper.sum(layers, function(layer){
      return helper.sum(layer, function(node){
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

  metrics.overDensity = function(nodes, density, layerWidth, nodeSpacing){
    if(nodes.length===0) return 0;

    var limit = density * layerWidth;

    var layers = toLayers(nodes);
    return helper.sum(layers, function(layer){
      var width = helper.sum(layer, function(node){
        return node.width + nodeSpacing;
      }) - nodeSpacing;
      return width <= limit ? 0 : width - limit;
    });
  };

  metrics.overlapCount = function(nodes, buffer){
    if(nodes.length===0) return 0;
    var layers = toLayers(nodes);
    return helper.sum(layers, function(layer){
      var count = 0;
      for(var i=0; i<layer.length;i++){
        for(var j=i+1; j<layer.length; j++){
          if(layer[i].overlapWithNode(layer[j], buffer)){
            count++;
          }
        }
      }
      return count;
    });
  };

  metrics.overlapSpace = function(nodes){
    if(nodes.length===0) return 0;
    var layers = toLayers(nodes);
    return helper.sum(layers, function(layer){
      var count = 0;
      for(var i=0; i<layer.length;i++){
        for(var j=i+1; j<layer.length; j++){
          var distance = layer[i].distanceFrom(layer[j]);
          count += distance<0 ? Math.abs(distance) : 0;
        }
      }
      return count;
    });
  };

  metrics.weightedAllocatedSpace = function(nodes){
    if(nodes.length===0) return 0;
    var layers = toLayers(nodes);

    return helper.sum(layers, function(layer, layerIndex){
      return layerIndex * helper.sum(layer, function(d){return d.width;});
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