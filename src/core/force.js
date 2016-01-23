// var Simulator = require('./simulator.js');
var Distributor = require('./distributor.js');
var metrics = require('./metrics.js');
var helper = require('./helper.js');
var removeOverlap = require('./removeOverlap.js');

var DEFAULT_OPTIONS = {
  nodeSpacing: 3,
  minPos: 0,
  maxPos: null,

  algorithm: 'overlap',
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
    layers = null;
    return force;
  };

  force.getLayers = function(){
    return layers;
  };

  force.options = function(x){
    if (!arguments.length) return options;
    options = helper.extend(options, x);

    var disOptions = helper.extractKeys(options, Object.keys(Distributor.DEFAULT_OPTIONS));
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
    var simOptions = helper.extractKeys(options, Object.keys(removeOverlap.DEFAULT_OPTIONS));

    nodes.forEach(function(node){
      node.removeStub();
    });

    layers = distributor.distribute(nodes);
    layers.map(function(nodes, layerIndex){
      nodes.forEach(function(node){
        node.layerIndex = layerIndex;
      });
      removeOverlap(nodes, simOptions);
    });

    return force;
  };

  force.start = function(){
    console.log('[warning] force.start() is deprecated. Please use force.compute() instead.');
  };

  force.metrics = function(){
    return Object.keys(metrics).map(function(name){
      return {
        name: name,
        value: force.metric(name)
      };
    });
  };

  force.metric = function(name){
    switch(name){
      case 'overflow':
        return metrics[name](layers, options.minPos, options.maxPos);
      case 'overDensity':
        return metrics[name](layers, options.density, options.layerWidth, options.nodeSpacing - 1);
      case 'overlapCount':
        return metrics[name](layers, options.nodeSpacing - 1);
      default:
        return metrics[name] ? metrics[name](layers) : null;
    }
  };

  return force;
};

Force.DEFAULT_OPTIONS = DEFAULT_OPTIONS;

module.exports = Force;