'use strict';

const Distributor = require('./distributor.js');
const helper = require('./helper.js');
const removeOverlap = require('./removeOverlap.js');

const DEFAULT_OPTIONS = {
  nodeSpacing: 3,
  minPos: 0,
  maxPos: null,

  algorithm: 'overlap',
  removeOverlap: true,
  density: 0.85,
  stubWidth: 1
};

var Force = function(_options){
  var force = {};
  var options = helper.extend({}, DEFAULT_OPTIONS);
  var distributor = new Distributor();
  var nodes = [];
  var layers = null;

  force.nodes = function(x) {
    if (!arguments.length) return nodes;
    nodes = x;
    layers = [x.concat()];
    return force;
  };

  force.getLayers = function(){
    return layers;
  };

  force.options = function(x){
    if (!arguments.length) return options;
    options = helper.extend(options, x);

    var disOptions = helper.pick(options, Object.keys(Distributor.DEFAULT_OPTIONS));
    if(helper.isDefined(options.minPos)&&helper.isDefined(options.maxPos)){
      disOptions.layerWidth = options.maxPos - options.minPos;
    }
    else{
      disOptions.layerWidth = null;
    }
    distributor.options(disOptions);

    return force;
  };

  force.options(_options);

  force.compute = function(){
    var overlapOptions = helper.pick(options, Object.keys(removeOverlap.DEFAULT_OPTIONS));

    nodes.forEach(function(node){
      node.removeStub();
    });

    layers = distributor.distribute(nodes);
    layers.map(function(nodes, layerIndex){
      nodes.forEach(function(node){
        node.layerIndex = layerIndex;
      });
      if(options.removeOverlap){
        removeOverlap(nodes, overlapOptions);
      }
    });

    return force;
  };

  force.start = function(){
    console.log('[warning] force.start() is deprecated. Please use force.compute() instead.');
  };

  return force;
};

Force.DEFAULT_OPTIONS = DEFAULT_OPTIONS;

module.exports = Force;