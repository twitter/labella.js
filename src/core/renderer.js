define([
  'core/helper'
],
function(helper){
//---------------------------------------------------
// BEGIN code for this module
//---------------------------------------------------

function Renderer(options){
  this.options = helper.extend({
    layerGap: 60,
    labelHeight: 10,
    direction: 'down'
  }, options);
}

function lineTo(point){
  return 'L ' + point.join(' ');
}

function moveTo(point){
  return 'M ' + point.join(' ');
}

function curveTo(c1, c2, point2){
  return 'C ' + c1.join(' ') + ' ' + c2.join(' ') + ' ' + point2.join(' ');
}

function vCurveBetween(point1, point2){
  var midY = (point1[1] + point2[1]) / 2;
  return curveTo(
    [point1[0], midY],
    [point2[0], midY],
    point2
  );
}

function hCurveBetween(point1, point2){
  var midY = (point1[0] + point2[0]) / 2;
  return curveTo(
    [midX, point1[1]],
    [midX, point2[1]],
    point2
  );
}

Renderer.prototype.getWaypoints = function(node){
  var options = this.options;
  var direction = options.direction;

  var hops = node.getPathFromRoot();
  var gap = options.labelHeight + options.layerGap;

  if(direction==='left'){
    return [[[0, hops[0].idealPos]]].concat(hops.map(function(hop, level){
      var xPos = gap * (level+1) * -1;
      return [
        [xPos + options.labelHeight, hop.currentPos],
        [xPos, hop.currentPos]
      ];
    }));
  }
  if(direction==='right'){
    return [[[0, hops[0].idealPos]]].concat(hops.map(function(hop, level){
      var xPos = gap * (level+1);
      return [
        [xPos - options.labelHeight, hop.currentPos],
        [xPos, hop.currentPos]
      ];
    }));
  }
  else if(direction==='up'){
    return [[[hops[0].idealPos, 0]]].concat(hops.map(function(hop, level){
      var yPos = gap * (level+1) * -1;
      return [
        [hop.currentPos, yPos + options.labelHeight],
        [hop.currentPos, yPos]
      ];
    }));
  }
  else{
    return [[[hops[0].idealPos, 0]]].concat(hops.map(function(hop, level){
      var yPos = gap * (level+1);
      return [
        [hop.currentPos, yPos - options.labelHeight],
        [hop.currentPos, yPos]
      ];
    }));
  }
};

Renderer.prototype.layout = function(nodes){
  var options = this.options;

  var gap = options.layerGap + options.labelHeight;

  switch(options.direction){
    case 'left':
      nodes.forEach(function(node){
        var pos = node.getLevel() * gap + options.layerGap;
        node.x = -pos - options.labelHeight;
        node.y = node.currentPos;
        node.dx = options.labelHeight;
        node.dy = node.width;
      });
      break;
    case 'right':
      nodes.forEach(function(node){
        var pos = node.getLevel() * gap + options.layerGap;
        node.x = pos;
        node.y = node.currentPos;
        node.dx = options.labelHeight;
        node.dy = node.width;
      });
      break;
    case 'up':
      nodes.forEach(function(node){
        var pos = node.getLevel() * gap + options.layerGap;
        node.x = node.currentPos;
        node.y = -pos - options.labelHeight;
        node.dx = node.width;
        node.dy = options.labelHeight;
      });
      break;
    default:
    case 'down':
      nodes.forEach(function(node){
        var pos = node.getLevel() * gap + options.layerGap;
        node.x = node.currentPos;
        node.y = pos;
        node.dx = node.width;
        node.dy = options.labelHeight;
      });
      break;
  }

  return nodes;
};

Renderer.prototype.generatePath = function(node){
  var options = this.options;
  var direction = options.direction;

  var waypoints = this.getWaypoints(node, direction);

  var steps = [moveTo(waypoints[0][0])];

  if(direction==='left' || direction==='right'){
    waypoints.reduce(function(prev, current, level){
      steps.push(hCurveBetween(prev[prev.length-1], current[0]));
      if(level < waypoints.length-1){
        steps.push(lineTo(current[1]));
      }
      return current;
    });
  }
  else{
    waypoints.reduce(function(prev, current, level){
      steps.push(vCurveBetween(prev[prev.length-1], current[0]));
      if(level < waypoints.length-1){
        steps.push(lineTo(current[1]));
      }
      return current;
    });
  }

  return steps.join(' ');
};

// return module
return Renderer;

//---------------------------------------------------
// END code for this module
//---------------------------------------------------
});