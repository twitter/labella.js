var Simulator = require('./simulator.js');
var Distributor = require('./distributor.js');
var metrics = require('./metrics.js');
var helper = require('./helper.js');
var Spring = require('./physics/spring.js');

var DEFAULT_OPTIONS = {
  damping: 0.1,
  epsilon: 0.003,
  timestep: 1,
  nodeSpacing: 3,
  minPos: 0,
  maxPos: null,
  pullForce: new Spring(1),
  roundsPerTick: 100,

  algorithm: 'overlap',
  density: 0.85,
  stubWidth: 1
};

var Force = function(_options){
  var force = {};
  var dispatch = helper.dispatch('start', 'tick', 'endLayer', 'end');
  var options = helper.extend({}, DEFAULT_OPTIONS);
  var distributor = new Distributor();
  var simulators = [];
  var nodes = [];
  var layers = null;
  var isRunning = false;

  force.nodes = function(x) {
    if (!arguments.length) return nodes;
    nodes = x;
    layers = null;
    simulators = [];
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

    var simOptions = helper.extractKeys(options, Object.keys(Simulator.DEFAULT_OPTIONS));
    simulators.forEach(function(sim){
      sim.options(simOptions);
    });

    return force;
  };

  force.options(_options);

  force.distribute = function(){
    if(isRunning){
      throw 'This function cannot be called while the simulator is running. Stop it first.';
    }
    layers = distributor.distribute(nodes);
    var simOptions = helper.extractKeys(options, Object.keys(Simulator.DEFAULT_OPTIONS));
    simulators = layers.map(function(layer){
      return new Simulator(simOptions).nodes(layer);
    });
    return force;
  };

  force.initialize = function(){
    if(isRunning){
      throw 'This function cannot be called while the simulator is running. Stop it first.';
    }
    simulators.forEach(function(sim){
      sim.initialize();
    });
    return force;
  };

  force.step = function(){
    simulators.forEach(function(sim){
      sim.step();
    });
    return force;
  };

  force.stop = function(){
    simulators.forEach(function(sim){
      sim.stop();
    });
    return force;
  };

  force.start = function(maxRound){
    if(isRunning){
      throw 'This function cannot be called while the simulator is running. Stop it first.';
    }
    setTimeout(function(){
      if(!layers){
        force.distribute();
      }
      force.initialize().resume(maxRound);
    }, 0);
    return force;
  };

  force.resume = function(additionalRound){
    if(layers.length===0) return force;

    if(!isRunning){
      var layerIndex = 0;
      dispatch.start({type: 'start'});

      var simulate = function(){
        var sim = simulators[layerIndex];
        if(!sim) return;

        sim.on('tick', function(event){
          dispatch.tick(helper.extend({}, event, {
            layerIndex: layerIndex
          }));
        });
        sim.on('end', function(event){
          dispatch.endLayer(helper.extend({}, event, {
            type: 'endLayer',
            layerIndex: layerIndex
          }));

          layerIndex++;

          // Still have layer(s) left
          if(layerIndex < layers.length){
            simulate();
          }
          // really end
          else{
            dispatch.end({type: 'end'});
            isRunning = false;
          }
        });

        if(layerIndex>0){
          sim.start(additionalRound);
        }
        else{
          sim.resume(additionalRound);
        }
      };

      simulate();
    }

    return force;
  };

  force.energy = function(){
    return helper.sum(simulators, function(sim){ return sim.energy(); });
  };

  force.isStable = function(){
    return simulators.every(function(d){return d.isStable();});
  };

  force.reset = force.initialize;

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

  helper.rebind(force, dispatch, 'on');

  return force;
};

Force.DEFAULT_OPTIONS = DEFAULT_OPTIONS;

module.exports = Force;