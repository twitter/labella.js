define([
  'core/nodeGroup',
  'core/physics/spring',
  'core/helper'
],
function(NodeGroup, Spring, helper){
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
  roundsPerTick: 100
};

var Simulator = function(options){
  var simulator = {};
  var nodes = [];
  var dispatch = helper.dispatch('start', 'tick', 'end');

  var isRunning = false;
  var maxRound = 0;

  options = helper.extend({}, DEFAULT_OPTIONS, options);

  simulator.nodes = function(x) {
    if (!arguments.length) return nodes;
    nodes = x;
    return simulator;
  };

  simulator.options = function(x){
    if (!arguments.length) return options;
    options = helper.extend(options, x);
    return simulator;
  };

  simulator.pushRightToIdealPositions = function(){
    // quickly move nodes to ideal position if possible
    // iterate from right to left
    for(var i=nodes.length-1; i>=0; i--){
      var node = nodes[i];
      if(node.currentPos < node.idealPos){
        var nextNode = i===nodes.length-1 ? null : nodes[i+1];

        // if there is enough gap for it to move to its ideal position immediately
        if(!nextNode || node.idealRight() < nextNode.currentLeft()){
          node.moveToIdealPosition();
        }
        // otherwise
        else{
          // push node next to the node on its right, if that is closer to ideal position
          var newPos = node.positionBefore(nextNode, options.nodeSpacing);
          if(Math.abs(node.idealPos - newPos) < Math.abs(node.displacement())){
            node.currentPos = newPos;
          }
        }
      }
    }

    return simulator;
  };

  simulator.pushLeftToIdealPositions = function(){
    // quickly move nodes to ideal position if possible
    // iterate from left to right
    for(var i=0; i<nodes.length; i++){
      var node = nodes[i];
      if(node.currentPos > node.idealPos){
        var prevNode = i===0 ? null : nodes[i-1];

        // if there is enough gap for it to move to its ideal position immediately
        if(!prevNode || node.idealLeft() > prevNode.currentRight()){
          node.moveToIdealPosition();
        }
        // otherwise
        else{
          // move node next to the node on its left, if that is closer to ideal position
          var newPos = node.positionAfter(prevNode, options.nodeSpacing);
          if(Math.abs(node.idealPos - newPos) < Math.abs(node.displacement())){
            node.currentPos = newPos;
          }
        }
      }
    }

    return simulator;
  };

  simulator.pushToIdealPositions = function(reverse){
    return reverse ?
      simulator
        .pushRightToIdealPositions()
        .pushLeftToIdealPositions():
      simulator
        .pushLeftToIdealPositions()
        .pushRightToIdealPositions();
  };

  simulator.initialize = function(){
    if(isRunning){
      throw 'This function cannot be called while the simulator is running. Stop it first.';
    }

    // For nodes with stub, set ideal position to stub's current position
    nodes.filter(function(node){
      return !!node.parent;
    })
    .forEach(function(node){
      node.idealPos = node.parent.currentPos;
    });

    nodes.sort(function(a,b){
        return a.idealPos - b.idealPos;
      })
      .forEach(function(node, index){
        // align nodes to the left by default
        node.currentPos = index===0 ? node.halfWidth() : node.positionAfter(nodes[index-1], options.nodeSpacing);
        node.previousPos = node.currentPos;
      });

    return simulator;
  };

  function isBumping(a, b){
    return a.isBumping(b, options.nodeSpacing);
  }

  simulator.step = function(){
    // Reset force to pure pull force
    nodes.forEach(function(node){
      node.force = options.pullForce.computeForce(node.displacement());
    });

    var groups = NodeGroup.groupAdjacentNodes(nodes, isBumping);

    // Compute force for each group
    groups.forEach(function(group){
      group.force = group.totalForce();

      // If moving left and minPos is set
      if(group.force < 0 && helper.isDefined(options.minPos)){
        var distanceFromBoundary = group.nodes[0].currentLeft() - options.minPos;
        if(distanceFromBoundary === 0){
          group.force = 0;
        }
        else if(distanceFromBoundary < 0){
          group.force = options.pullForce.computeForce(-distanceFromBoundary);
        }
      }
    });

    // Merge adjacent groups if possible
    while(groups.length > 1){
      var mg = NodeGroup.mergeAdjacentGroups(groups, isBumping);
      // If the groups were not changed, stop
      if(mg.length === groups.length) break;
      // Otherwise, continue merging
      groups = mg;
    }

    // Then reassign each group's total force back to the nodes within
    groups.forEach(function(group){
      group.assignForceToChildren();
    });

    // Add repulsion
    // for(var i=1;i<nodes.length;i++){
    //   var node1 = nodes[i-1];
    //   var node2 = nodes[i];

    //   var distance = node1.distanceFrom(node2);
    //   // no repulsion is necessary if enough space already
    //   if(distance <= options.nodeSpacing){
    //     var diff = options.nodeSpacing - distance;
    //     var repulsion = (diff/(options.timestep * options.timestep))/2;
    //     node1.force += -repulsion;
    //     node2.force += repulsion;
    //   }
    // }

    // Move nodes
    for(var index=nodes.length-1; index>=0; index--){
      var node = nodes[index];

      var newPos = node.currentPos + node.force * options.damping * options.timestep*options.timestep;

      // Boundary constraint: minPos and maxPos (if set)
      if(helper.isDefined(options.minPos)) newPos = Math.max(options.minPos + node.halfWidth(), newPos);
      if(helper.isDefined(options.maxPos)) newPos = Math.min(options.maxPos - node.halfWidth(), newPos);

      // Rigid body constraint: Do not penetrate + a bit of gap
      if(index>0){
        var prevNode = nodes[index-1];
        newPos = Math.max(node.positionAfter(prevNode, options.nodeSpacing-1), newPos);
      }
      if(index<nodes.length-1){
        var nextNode = nodes[index+1];
        newPos = Math.min(node.positionBefore(nextNode, options.nodeSpacing-1), newPos);
      }

      // Set new position and update velocity from real movement
      node.previousPos = node.currentPos;
      node.currentPos = newPos;
    }

    return simulator;
  };

  simulator.start = function(maxRound){
    if(isRunning){
      throw 'This function cannot be called while the simulator is running. Stop it first.';
    }
    return simulator.initialize().resume(maxRound);
  };

  simulator.increaseMaxRound = function(additionalRound){
    if (additionalRound){
      // If round is set, add to maximum round
      maxRound += additionalRound;
    }
    else{
      // Otherwise, clear maximum round
      // (Allow it to run indefinitely until it is stable.)
      maxRound = 0;
    }
  };

  simulator.resume = function(additionalRound){
    simulator.increaseMaxRound(additionalRound);

    // If not already running
    if(!isRunning){
      isRunning = true;
      dispatch.start({type: 'start'});

      var round = 0;

      var step = function(){
        if(!isRunning){
          return 'stopped';
        }
        else if(round > 0 && simulator.isStable()){
          return 'simulation stable, energy: '+simulator.energy();
        }
        else if(maxRound && round >= maxRound){
          return 'maximum number of rounds reached: ' + maxRound;
        }
        else{
          simulator.step();
          round++;
          return false;
        }
      };

      var tick = function(){
        for(var i=0;i<options.roundsPerTick;i++){
          var done = step();
          if(done){
            dispatch.end({
              type: 'end',
              round: round,
              maxRound: maxRound,
              reason: done
            });
            isRunning = false;
            maxRound = 0;
            return;
          }
        }
        dispatch.tick({
          type: 'tick',
          round: round,
          maxRound: maxRound
        });

        setTimeout(tick, 0);
      };

      tick();
    }

    return simulator;
  };

  simulator.stop = function(){
    isRunning = false;
    return simulator;
  };

  simulator.energy = function(){
    return helper.sum(nodes, function(d){return d.kineticEnergy();});
  };

  simulator.isStable = function(){
    return simulator.energy() < options.epsilon;
  };

  // alias
  simulator.reset = simulator.initialize;

  helper.rebind(simulator, dispatch, 'on');

  return simulator;
};

Simulator.DEFAULT_OPTIONS = DEFAULT_OPTIONS;

return Simulator;

//---------------------------------------------------
// END code for this module
//---------------------------------------------------
});