/* jshint esnext:true */

var Node = require('./node.js');
import helper from './helper';

export default {
  generateNodes(amount, options){
    var nodes = [];
    options = helper.extend({}, {
      minWidth: 20,
      maxWidth: 20,
      minPos: 0,
      maxPos: 800
    }, options);
    var diffPos = options.maxPos - options.minPos;
    var diffWidth = options.maxWidth - options.minWidth;
    for(var i=0;i<amount;i++){
      nodes.push(new Node(
        Math.floor(Math.random()*diffPos) + options.minPos,
        Math.floor(Math.random()*diffWidth) + options.minWidth
      ));
    }
    return nodes;
  }
};