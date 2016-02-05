'use strict';

class Node{
  constructor(idealPos, width, data){
    this.idealPos = idealPos;
    this.currentPos = idealPos;
    this.width = width;
    this.data = data;
    this.layerIndex = 0;
  }

  // return negative if overlap
  distanceFrom(node){
    const halfWidth = this.width/2;
    const nodeHalfWidth = node.width/2;
    // max(a[0], b[0]) - min(a[1], b[1])
    return Math.max(this.currentPos - halfWidth, node.currentPos - nodeHalfWidth) - Math.min(this.currentPos + halfWidth, node.currentPos + nodeHalfWidth);
  }

  moveToIdealPosition(){
    this.currentPos = this.idealPos;
    return this;
  }

  displacement(){
    return this.idealPos - this.currentPos;
  }

  overlapWithNode(node, buffer=0){
    return this.distanceFrom(node) - buffer < 0;
  }

  overlapWithPoint(pos){
    const halfWidth = this.width/2;
    return (pos >= this.currentPos - halfWidth) && (pos <= this.currentPos + halfWidth);
  }

  positionBefore(node, buffer=0){
    return node.currentLeft() - this.width/2 - buffer;
  }

  positionAfter(node, buffer=0){
    return node.currentRight() + this.width/2 + buffer;
  }

  currentRight(){
    return this.currentPos + this.width/2;
  }

  currentLeft(){
    return this.currentPos - this.width/2;
  }

  idealRight(){
    return this.idealPos + this.width/2;
  }

  idealLeft(){
    return this.idealPos - this.width/2;
  }

  createStub(width){
    const stub = new Node(this.idealPos, width, this.data);
    stub.currentPos = this.currentPos;
    stub.child = this;
    this.parent = stub;
    return stub;
  }

  removeStub(){
    if(this.parent){
      this.parent.child = null;
      this.parent = null;
    }
    return this;
  }

  isStub(){
    return !!this.child;
  }

  getPathToRoot(){
    const path = [];
    let current = this;
    while(current){
      path.push(current);
      current = current.parent;
    }
    return path;
  }

  getPathFromRoot(){
    return this.getPathToRoot().reverse();
  }

  getPathToRootLength(){
    let length = 0;
    let current = this;
    while(current){
      const targetPos = current.parent ? current.parent.currentPos : current.idealPos;
      length += Math.abs(current.currentPos - targetPos);
      current = current.parent;
    }

    return length;
  }

  // Trace back to the node without parent
  getRoot(){
    let previous = this;
    let current = this;
    while(current){
      previous = current;
      current = current.parent;
    }
    return previous;
  }

  getLayerIndex(){
    return this.layerIndex;
  }

  clone(){
    const node = new Node(this.idealPos, this.width, this.data);
    node.currentPos = this.currentPos;
    node.layerIndex = this.layerIndex;
    return node;
  }
}

module.exports = Node;