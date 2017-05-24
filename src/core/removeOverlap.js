const helper = require('./helper.js');
const vpsc = require('../lib/vpsc.js');

const DEFAULT_OPTIONS = {
  lineSpacing: 2,
  nodeSpacing: 3,
  minPos: 0,
  maxPos: null
};

function nodeToVariable(node){
  const v = new vpsc.Variable(node.targetPos);
  v.node = node;
  return v;
}

function removeOverlap(nodes, options){
  if(nodes.length>0){
    options = helper.extend(DEFAULT_OPTIONS, options);

    // For nodes with stub, set target position to stub's current position
    nodes.forEach(function (node, index) {
      node.targetPos = node.parent ? node.parent.currentPos : node.idealPos;
      node.index = index;
    });

    const variables = nodes.concat()
      .sort(function (a, b) {
        const diff = a.targetPos - b.targetPos;
        if (diff !== 0) return diff;
        const diff2 = a.isStub() - b.isStub();
        if (diff2!== 0) return diff2;
        // If same position, use original order
        return a.index-b.index;
      })
      .map(nodeToVariable);

    const constraints = [];
    for(let i=1;i<variables.length;i++){
      const v1 = variables[i-1];
      const v2 = variables[i];

      let gap;
      if(v1.node.isStub() && v2.node.isStub()){
        gap = (v1.node.width+v2.node.width)/2 + options.lineSpacing;
      }
      else{
        gap = (v1.node.width+v2.node.width)/2 + options.nodeSpacing;
      }
      constraints.push(new vpsc.Constraint(v1, v2, gap));
    }

    if(helper.isDefined(options.minPos)){
      const leftWall = new vpsc.Variable(options.minPos, 1e10);
      const v = variables[0];
      constraints.push(new vpsc.Constraint(leftWall, v, v.node.width/2));
      variables.unshift(leftWall);
    }

    if(helper.isDefined(options.maxPos)){
      const rightWall = new vpsc.Variable(options.maxPos, 1e10);
      const lastv = helper.last(variables);
      constraints.push(new vpsc.Constraint(lastv, rightWall, lastv.node.width/2));
      variables.push(rightWall);
    }

    (new vpsc.Solver(variables, constraints)).solve();

    variables
      .filter( v => v.node )
      .map(function(v){
        v.node.currentPos = Math.round(v.position());
        return v;
      });
  }

  return nodes;
}

removeOverlap.DEFAULT_OPTIONS = DEFAULT_OPTIONS;

module.exports = removeOverlap;