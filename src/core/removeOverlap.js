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

    var variables = nodes.map(function(node){
      var v = new vpsc.Variable(node.idealPos);
      v.node = node;
      return v;
    });

    var constraints = [];
    for(var i=1;i<variables.length;i++){
      var v1 = variables[i-1];
      var v2 = variables[i];
      var n1 = nodes[i-1];
      var n2 = nodes[i];
      constraints.push(new vpsc.Constraint(v1, v2, (n1.width+n2.width)/2 + options.nodeSpacing));
    }

    if(helper.isDefined(options.minPos)){
      var leftWall = new vpsc.Variable(options.minPos, 1e10);
      constraints.push(new vpsc.Constraint(leftWall, variables[0], nodes[0].width/2));
      variables.unshift(leftWall);
    }

    if(helper.isDefined(options.maxPos)){
      var rightWall = new vpsc.Variable(options.maxPos, 1e10);
      constraints.push(new vpsc.Constraint(last(variables), rightWall, last(nodes).width/2));
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