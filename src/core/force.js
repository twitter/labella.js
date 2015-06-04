define([
  'core/simulator',
  'core/distributor',
  'core/metrics',
  'core/helper',
  'core/physics/spring',
],
function(Simulator, Distributor, metrics, helper, Spring){
//---------------------------------------------------
// BEGIN code for this module
//---------------------------------------------------

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
  rowWidth: 1000,
  density: 0.85,
  // bundleStubs: false,
  stubWidth: 1
};

var Force = function(options){
  var force = {};
  var dispatch = helper.dispatch('start', 'tick', 'endRow', 'end');

  options = helper.extend({}, DEFAULT_OPTIONS, options);

  var distributor = new Distributor(helper.extractKeys(options, Object.keys(Distributor.DEFAULT_OPTIONS)));
  var simulators = [];
  var nodes = [];
  var rows = null;

  var isRunning = false;

  force.nodes = function(x) {
    if (!arguments.length) return nodes;
    nodes = x;
    rows = null;
    simulators = [];
    return force;
  };

  force.getRows = function(){
    return rows;
  };

  force.options = function(x){
    if (!arguments.length) return options;
    options = helper.extend(options, x);

    distributor.options(helper.extractKeys(x, Object.keys(Distributor.DEFAULT_OPTIONS)));
    var simOptions = helper.extractKeys(x, Object.keys(Simulator.DEFAULT_OPTIONS));
    simulators.forEach(function(sim){
      sim.options(simOptions);
    });

    return force;
  };

  force.distribute = function(){
    if(isRunning){
      throw 'This function cannot be called while the simulator is running. Stop it first.';
    }
    rows = distributor.distribute(nodes);
    var simOptions = helper.extractKeys(options, Object.keys(Simulator.DEFAULT_OPTIONS));
    simulators = rows.map(function(row){
      return new Simulator(simOptions)
        .nodes(row);
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
    if(!rows){
      force.distribute();
    }
    return force.initialize().resume(maxRound);
  };

  force.resume = function(additionalRound){
    if(rows.length===0) return force;

    if(!isRunning){
      var rowIndex = 0;
      dispatch.start({type: 'start'});

      var simulate = function(){
        var sim = simulators[rowIndex];
        if(!sim) return;

        sim.on('tick', function(event){
          dispatch.tick(helper.extend({}, event, {
            row: rowIndex
          }));
        });
        sim.on('end', function(event){
          dispatch.endRow(helper.extend({}, event, {
            type: 'endRow',
            row: rowIndex
          }));

          rowIndex++;

          // Still have row(s) left
          if(rowIndex < rows.length){
            simulate();
          }
          // really end
          else{
            dispatch.end({type: 'end'});
            isRunning = false;
          }
        });

        if(rowIndex>0){
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
        return metrics[name](rows, options.minPos, options.maxPos);
      case 'overDensity':
        return metrics[name](rows, options.density, options.rowWidth, options.nodeSpacing - 1);
      case 'overlapCount':
        return metrics[name](rows, options.nodeSpacing - 1);
      default:
        return metrics[name] ? metrics[name](rows) : null;
    }
  };

  helper.rebind(force, dispatch, 'on');

  return force;
};

Force.DEFAULT_OPTIONS = DEFAULT_OPTIONS;

return Force;

//---------------------------------------------------
// END code for this module
//---------------------------------------------------
});