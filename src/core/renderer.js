const helper = require('./helper.js');

const DEFAULT_NODE_HEIGHT = 10;

function Renderer(options){
  if(typeof options.nodeHeight === "function"){
    var currentNodeHeightFunction = options.nodeHeight;
    options.nodeHeight = function(nodeData){
      var retValue = currentNodeHeightFunction(nodeData);
      if(typeof retValue !== "number"){
        console.error('It seems like your nodeHeight function does NOT ' + 
          'return a number. Instead it returns ' + retValue + '. A fallback ' +
          'value has been used instead. The following console.log shows ' +
          'the input data of a node: ');
        console.log(nodeData);
        return DEFAULT_NODE_HEIGHT;
      }
      else return retValue;
    };
  }
  this.options = helper.extend({
    layerGap: 60,
    nodeHeight: DEFAULT_NODE_HEIGHT,
    direction: 'down'
  }, options);
  console.log(this.options);
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
  const midY = (point1[1] + point2[1]) / 2;
  return curveTo(
    [point1[0], midY],
    [point2[0], midY],
    point2
  );
}

function hCurveBetween(point1, point2){
  const midX = (point1[0] + point2[0]) / 2;
  return curveTo(
    [midX, point1[1]],
    [midX, point2[1]],
    point2
  );
}

Renderer.lineTo = lineTo;
Renderer.moveTo = moveTo;
Renderer.curveTo = curveTo;
Renderer.vCurveBetween = vCurveBetween;
Renderer.hCurveBetween = hCurveBetween;

Renderer.prototype.getWaypoints = function(node){
  var options = this.options;
  var nodeHeight = (typeof options.nodeHeight === "function")
    ? options.nodeHeight(node.data)
    : options.nodeHeight;
  var direction = options.direction;

  var hops = node.getPathFromRoot();
  var gap = nodeHeight + options.layerGap;

  if(direction==='left'){
    return [[[0, hops[0].idealPos]]].concat(hops.map(function(hop, level){
      var xPos = gap * (level+1) * -1;
      return [
        [xPos + nodeHeight, hop.currentPos],
        [xPos, hop.currentPos]
      ];
    }));
  }
  else if(direction==='right'){
    return [[[0, hops[0].idealPos]]].concat(hops.map(function(hop, level){
      var xPos = gap * (level+1);
      return [
        [xPos - nodeHeight, hop.currentPos],
        [xPos, hop.currentPos]
      ];
    }));
  }
  else if(direction==='up'){
    return [[[hops[0].idealPos, 0]]].concat(hops.map(function(hop, level){
      var yPos = gap * (level+1) * -1;
      return [
        [hop.currentPos, yPos + nodeHeight],
        [hop.currentPos, yPos]
      ];
    }));
  }
  else{
    return [[[hops[0].idealPos, 0]]].concat(hops.map(function(hop, level){
      var yPos = gap * (level+1);
      return [
        [hop.currentPos, yPos - nodeHeight],
        [hop.currentPos, yPos]
      ];
    }));
  }
};

Renderer.prototype.layout = function(nodes){
  var options = this.options;

  if(typeof options.nodeHeight === 'function'){
    var gaps = [];
    nodes.forEach(function(node, index){
      gaps[index] = options.layerGap + options.nodeHeight(node.data);
    });
  }

  var gap = options.layerGap + options.nodeHeight;

  switch(options.direction){
    case 'left':
      nodes.forEach(function(node, index){
        var pos = 0;
        if(gaps){ //if the nodeHeight is a function
          pos = node.getLayerIndex() * gaps[index] + options.layerGap;
        }
        else{
          pos = node.getLayerIndex() * gap + options.layerGap;
        }
        if(typeof options.nodeHeight === 'function'){
          node.x = -pos - options.nodeHeight(node.data);
        }
        else{
          node.x = -pos - options.nodeHeight;
        }
        node.y = node.currentPos;
        node.dx = (typeof options.nodeHeight === 'function')
          ? options.nodeHeight(node.data)
          : options.nodeHeight;
        node.dy = node.width;
      });
      break;
    case 'right':
      nodes.forEach(function(node, index){
        var pos = 0;
        if(gaps){ //if the nodeHeight is a function
          pos = node.getLayerIndex() * gaps[index] + options.layerGap;
        }
        else{
          pos = node.getLayerIndex() * gap + options.layerGap;
        }
        node.x = pos;
        node.y = node.currentPos;
        node.dx = (typeof options.nodeHeight === 'function')
          ? options.nodeHeight(node.data)
          : options.nodeHeight;
        node.dy = node.width;
      });
      break;
    case 'up':
      nodes.forEach(function(node, index){
        var pos = 0;
        if(gaps){ //if the nodeHeight is a function
          pos = node.getLayerIndex() * gaps[index] + options.layerGap;
        }
        else{
          pos = node.getLayerIndex() * gap + options.layerGap;
        }
        node.x = node.currentPos;
        if(typeof options.nodeHeight === 'function'){
          node.y = - pos - options.nodeHeight(node.data);
        }
        else{
          node.y = -pos - options.nodeHeight;
        }
        node.dx = node.width;
        node.dy = (typeof options.nodeHeight === 'function')
          ? options.nodeHeight(node.data)
          : options.nodeHeight;
      });
      break;
    default:
    case 'down':
      nodes.forEach(function(node, index){
        var pos = 0;
        if(gaps){ //if the nodeHeight is a function
          pos = node.getLayerIndex() * gaps[index] + options.layerGap;
        }
        else{
          pos = node.getLayerIndex() * gap + options.layerGap;
        }
        node.x = node.currentPos;
        node.y = pos;
        node.dx = node.width;
        node.dy = (typeof options.nodeHeight === 'function')
          ? options.nodeHeight(node.data)
          : options.nodeHeight;
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
module.exports = Renderer;