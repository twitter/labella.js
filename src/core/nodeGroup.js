define([
],
function(){
//---------------------------------------------------
// BEGIN code for this module
//---------------------------------------------------

var NodeGroup = function(nodes){
  this.nodes = nodes || [];
  this.force = 0;
};

var proto = NodeGroup.prototype;

proto.push = function(node){
  this.nodes.push(node);
  return this;
};

proto.merge = function(another){
  var group = new NodeGroup(this.nodes.concat(another.nodes));
  group.force = this.force + another.force;
  return group;
};

proto.overlapWithGroup = function(group, buffer){
  return this.nodes.length > 0 && group.nodes.length > 0 && this.nodes[this.nodes.length-1].overlapWithNode(group.nodes[0], buffer);
};

proto.totalForce = function(){
  return this.nodes
    .map(function(node){
      return node.force;
    })
    .reduce(function(prev, current){
      return prev + current;
    }, 0);
};

proto.assignForceToChildren = function(){
  var self = this;
  this.nodes.forEach(function(node){
    node.force = self.force;
  });
};

/**
 * Check if two adjacent objects are running into each other
 * Either a hits b or b hits a.
 * The only false case is when both are running away from each other.
 * Object#1's position must be before Object#2
 * @param  Number f1 Object#1's force
 * @param  Number f2 Object#2's force
 * @return Boolean true if both object are running into each other
 */
proto.isBumping = function(b, buffer){
  var f1 = this.force || 0;
  var f2 = b.force || 0;
  /* jshint ignore:start */
  return this.overlapWithGroup(b, buffer)
    && (f1 * f2 > 0
    || f1 === 0 && f2 < 0
    || f1 > 0 && f2 === 0
    || f1 > 0 && f2 < 0);
  /* jshint ignore:end */
};

NodeGroup.groupAdjacentNodes = function(nodes, conditionFn){
  if(nodes && nodes.length > 0){
    var currentGroup = new NodeGroup([nodes[0]]);
    var groups = [currentGroup];

    for(var i=1; i<nodes.length; i++){
      var node = nodes[i];
      var prevNode = nodes[i-1];

      if(conditionFn(prevNode, node)){
        // add to the same group
        currentGroup.push(node);
      }
      else{
        // otherwise, create a new group
        currentGroup = new NodeGroup([node]);
        groups.push(currentGroup);
      }
    }
    return groups;
  }

  return [];
};

NodeGroup.mergeAdjacentGroups = function(groups, conditionFn){
  if(groups && groups.length>0){
    var mergedGroups = [];
    var currentGroup = groups[0];

    for(var i=1; i<groups.length; i++){
      var group = groups[i];
      var prevGroup = groups[i-1];

      if(conditionFn(prevGroup, group)){
        // add to the same group
        currentGroup = currentGroup.merge(group);
      }
      else{
        // otherwise, create a new group
        mergedGroups.push(currentGroup);
        currentGroup = group;
      }
    }
    mergedGroups.push(currentGroup);

    return mergedGroups;
  }
  return groups;
};

// return module
return NodeGroup;

//---------------------------------------------------
// END code for this module
//---------------------------------------------------
});