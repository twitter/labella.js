var vpsc = require('../lib/vpsc.js');
var helper = require('./helper.js');

var DEFAULT_OPTIONS = {
  nodeSpacing: 3,
  minPos: 0,
  maxPos: null
};

function last(arr){
  return arr[arr.length-1];
}

module.exports = function removeOverlap(nodes, options){
  if(nodes.length>0){
    options = helper.extend(DEFAULT_OPTIONS, options);

    // For nodes with stub, set ideal position to stub's current position
    nodes.filter(function(node){
      return !!node.parent;
    })
    .forEach(function(node){
      node.idealPos = node.parent.currentPos;
    });

    nodes.sort(function(a,b){
      return a.idealPos - b.idealPos;
    });

    var variables = nodes.map(function(node){
      var v = new vpsc.Variable(node.idealPos);
      v.node = node;
      return v;
    });

    var constraints = [];
    for(var i=1;i<variables.length;i++){
      var v1 = variables[i-1];
      var v2 = variables[i];
      constraints.push(new vpsc.Constraint(v1, v2, (v1.node.width+v2.node.width)/2 + options.nodeSpacing));
    }

    if(helper.isDefined(options.minPos)){
      var leftWall = new vpsc.Variable(options.minPos, 1e10);
      var v = variables[0];
      constraints.push(new vpsc.Constraint(leftWall, v, v.node.width/2));
      variables.unshift(leftWall);
    }

    if(helper.isDefined(options.maxPos)){
      var rightWall = new vpsc.Variable(options.maxPos, 1e10);
      var lastv = last(variables);
      constraints.push(new vpsc.Constraint(lastv, rightWall, lastv.node.width/2));
      variables.push(rightWall);
    }

    var solver = new vpsc.Solver(variables, constraints);
    solver.solve();

    variables
      .filter(function(v){return v.node;})
      .map(function(v){
        v.node.currentPos = Math.round(v.position());
        return v;
      });
  }

  return nodes;
};