var helper = require('./helper.js');

var Node = function(idealPos, width, data){
  this.idealPos = idealPos;
  this.currentPos = idealPos;
  this.width = width;
  this.data = data;
  this.layerIndex = 0;
};

var proto = Node.prototype;

// return negative if overlap
proto.distanceFrom = function(node){
  var halfWidth = this.width/2;
  var nodeHalfWidth = node.width/2;

  // max(a[0], b[0]) - min(a[1], b[1])
  return Math.max(this.currentPos - halfWidth, node.currentPos - nodeHalfWidth) - Math.min(this.currentPos + halfWidth, node.currentPos + nodeHalfWidth);
};

proto.moveToIdealPosition = function(){
  this.currentPos = this.idealPos;
  return this;
};

proto.displacement = function(){
  return this.idealPos - this.currentPos;
};

proto.overlapWithNode = function(node, buffer){
  buffer = buffer===null||buffer===undefined ? 0 : buffer;
  return this.distanceFrom(node) - buffer < 0;
};

proto.overlapWithPoint = function(pos){
  var halfWidth = this.width/2;
  return (pos >= this.currentPos - halfWidth) && (pos <= this.currentPos + halfWidth);
};

proto.positionBefore = function(node, buffer){
  buffer = buffer ? buffer : 0;
  return node.currentLeft() - this.width/2 - buffer;
};

proto.positionAfter = function(node, buffer){
  buffer = buffer ? buffer : 0;
  return node.currentRight() + this.width/2 + buffer;
};

proto.currentRight = function(){
  return this.currentPos + this.width/2;
};

proto.currentLeft = function(){
  return this.currentPos - this.width/2;
};

proto.idealRight = function(){
  return this.idealPos + this.width/2;
};

proto.idealLeft = function(){
  return this.idealPos - this.width/2;
};

proto.createStub = function(width){
  var stub = new Node(this.idealPos, width, this.data);
  stub.currentPos = this.currentPos;
  stub.child = this;
  this.parent = stub;
  return stub;
};

proto.removeStub = function(){
  if(this.parent){
    this.parent.child = null;
    this.parent = null;
  }
  return this;
};

proto.isStub = function(){
  return !!this.child;
};

proto.getPathToRoot = function(){
  var path = [];
  var current = this;
  while(current){
    path.push(current);
    current = current.parent;
  }
  return path;
};

proto.getPathFromRoot = function(){
  return this.getPathToRoot().reverse();
};

// Trace back to the node without parent
proto.getRoot = function(){
  var previous = this;
  var current = this;
  while(current){
    previous = current;
    current = current.parent;
  }
  return previous;
};

proto.getLayerIndex = function(){
  return this.layerIndex;
};

proto.clone = function(){
  var node = new Node(this.idealPos, this.width, this.data);
  node.currentPos = this.currentPos;
  node.layerIndex = this.layerIndex;
  return node;
};

// return module
module.exports = Node;