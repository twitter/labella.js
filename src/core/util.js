'use strict';

const Node = require('./node.js');
const helper = require('./helper.js');

module.exports = {
  generateNodes(amount, options){
    const nodes = [];
    options = helper.extend({}, {
      minWidth: 20,
      maxWidth: 20,
      minPos: 0,
      maxPos: 800
    }, options);
    const diffPos = options.maxPos - options.minPos;
    const diffWidth = options.maxWidth - options.minWidth;
    for(let i=0;i<amount;i++){
      nodes.push(new Node(
        Math.floor(Math.random()*diffPos) + options.minPos,
        Math.floor(Math.random()*diffWidth) + options.minWidth
      ));
    }
    return nodes;
  }
};