'use strict';

var _ = require('lodash');
var labella = require('../dist/labella-extra.min.js');
var util = labella.util;
var metrics = labella.metrics;

function applyTreatment(treatment, nodes){
  if(_.isFunction(treatment)){
    return treatment(nodes);
  }
  else{
    return (new labella.Force(treatment))
      .nodes(nodes)
      .compute();
  }
}

function computeMetrics(treatment, nodes){
  var inputNodes = nodes.map(function(d){return d.clone();});

  var t1 = process.hrtime();
  var force = applyTreatment(treatment, inputNodes);
  var time = process.hrtime(t1);
  time = time[0]*1000000000 + time[1];

  var outputNodes = force.nodes();
  var options = force.options();

  return {
    time: time,
    displacement: metrics.displacement(outputNodes),
    pathLength: metrics.pathLength(outputNodes),
    overflowSpace: metrics.overflowSpace(outputNodes, options.minPos, options.maxPos),
    overlapCount: metrics.overlapCount(outputNodes)
  };
}

function run(steps, round, treatments, nodeOptions){
  return _.flatMap(steps, function(step){
    var treatmentResults = treatments.map(function(){return [];});

    for(var i=0;i<round;i++){
      var nodes = util.generateNodes(step, _.extend({
        minWidth: 10,
        maxWidth: 50,
        minPos: null,
        maxPos: null
      }, nodeOptions));

      treatments.map(function(treatment, j){
        treatmentResults[j].push(computeMetrics(treatment, nodes));
      });
    }

    return treatmentResults.map(function(treatmentResult, j){
      var metricNames = Object.keys(treatmentResult[0]);
      var means = {
        numNodes: step,
        treatmentID: j
      };
      metricNames.forEach(function(name){
        means[name] = _.mean(treatmentResult.map(function(d){return d[name];}));
      });
      return means;
    });

    // return _.extend({
    //   numNodes: step
    // },_.mapValues(results, function(metric){
    //   return _.mean(metric);
    // }));
  });
}

var treatments = [function(inputNodes){
  return new labella.Force().nodes(inputNodes);
},{
  algorithm: 'none',
  roundsPerTick: 100
}];

var scores = run(_.range(1,10,1).concat(_.range(10,101,10)), 10, treatments);

console.log('scores', scores);