'use strict';

var _ = require('lodash');
var json2csv = require('json2csv');
var fs = require('fs');

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

  var layers = force.getLayers();
  var options = force.options();

  return {
    time: time/1000000, // convert to ms
    layerCount: layers.length,
    displacement: metrics.displacement(layers),
    pathLength: metrics.pathLength(layers),
    overflowSpace: metrics.overflowSpace(layers, options.minPos, options.maxPos),
    overlapCount: metrics.overlapCount(layers),
    overlapSpace: metrics.overlapSpace(layers),
    overDensitySpace: metrics.overDensitySpace(layers, options.density, options.maxPos-options.minPos, options.nodeSpacing),
    weightedAllocation: metrics.weightedAllocation(layers),
    weightedAllocatedSpace: metrics.weightedAllocatedSpace(layers)
  };
}

function run(steps, round, treatments, nodeOptions){
  return _.flatMap(steps, function(step){
    var nodeSets = _.range(0,round,1).map(function(){
      return util.generateNodes(step, _.extend({
        minWidth: 20,
        maxWidth: 50,
        minPos: 0,
        maxPos: 500
      }, nodeOptions));
    });

    console.log('step', step);

    return treatments.map(function(treatment, index){
      var results = nodeSets.map(function(nodes){
        return computeMetrics(treatment, nodes);
      });

      return Object.keys(results[0]).reduce(function(agg, name){
        agg[name] = _.mean(results.map(function(d){return d[name];}));
        return agg;
      }, {
        numNodes: step,
        treatmentID: index,
        algorithm: treatment.algorithm,
        removeOverlap: treatment.removeOverlap
      });
    });
  });
}

var treatments = [
  {
    algorithm: 'none',
    removeOverlap: false,
    density: 0.85,
    minPos: 0,
    maxPos: 500
  },
  {
    algorithm: 'none',
    density: 0.85,
    minPos: 0,
    maxPos: 500
  },
  {
    algorithm: 'simple',
    density: 0.85,
    minPos: 0,
    maxPos: 500
  },
  {
    algorithm: 'simple',
    removeOverlap: false,
    density: 0.85,
    minPos: 0,
    maxPos: 500
  },
  {
    algorithm: 'overlap',
    density: 0.85,
    minPos: 0,
    maxPos: 500
  },
  {
    algorithm: 'overlap',
    removeOverlap: false,
    density: 0.85,
    minPos: 0,
    maxPos: 500
  }
];

var scores = run(_.range(1,10,1).concat(_.range(10,301,10)), 10, treatments);

json2csv({ data: scores }, function(err, csv) {
  if (err) console.log(err);
  // console.log(csv);

  fs.writeFileSync('output/metrics.csv', csv);
  console.log('done');
});

// console.log('scores', scores);