'use strict';

var Promise = require('promise');
var _ = require('lodash');
var fs = require('fs');
var labella0 = require('./labella-0.1.1.min.js');
var labella1 = require('./labella-extra.min.js');
var metrics = labella1.metrics;
var util = labella1.util;

function layout(lib, version, nodes, options){
  nodes = nodes.map(function(n){
    var n2 = new lib.Node();
    n2.idealPos = n.idealPos;
    n2.width = n.width;
    n2.currentPos = n.currentPos;
    return n2;
  });

  var force = new lib.Force(options).nodes(nodes);

  if(version===0){
    return new Promise(function (resolve, reject) {
      var t1 = process.hrtime();
      force.on('end', function(){
          resolve({
            force: force,
            time: process.hrtime(t1)
          });
        })
        .start();
    });
  }
  else if(version===1){
    var t1 = process.hrtime();
    force.compute();
    return Promise.resolve({
      force: force,
      time: process.hrtime(t1)
    });
  }
}

function run(steps, times, options){
  var queue = [];
  steps.map(function(numNodes){
    for(var i=0;i<times;i++){
      queue.push([numNodes, i]);
    }
  });

  var index = 0;
  var results = queue.map(function(){
    return [null, null];
  });

  function iter(item, options){
    var nodes = util.generateNodes(item[0], {
      minWidth: 10,
      maxWidth: 50,
      minPos: null,
      maxPos: null
    });

    layout(labella1, 1, nodes, options)
      .then(function(result1){
        results[index][1] = {
          time: result1.time,
          displacement: metrics.displacement(result1.force.nodes())
        };
        layout(labella0, 0, nodes, options)
          .then(function(result0){
            results[index][0] = {
              time: result0.time,
              displacement: metrics.displacement(result0.force.nodes())
            };
            index++;
            if(index<queue.length){
              iter(queue[index]);
            }
            else{
              var output = _.zip(queue, results).map(function(d){
                return {
                  numNodes: d[0][0],
                  index: d[0][1],
                  r0: d[1][0].time[0] * 1000000000 + d[1][0].time[1],
                  r1: d[1][1].time[0] * 1000000000 + d[1][1].time[1],
                  d0: d[1][0].displacement,
                  d1: d[1][1].displacement
                };
              });

              summarize(output);
            }
          });
      });
  }

  if(queue.length>0){
    iter(queue[0], options);
  }
}

function summarize(results){
  var summary = _.mapValues(_.groupBy(results, function(d){return d.numNodes;}), function(trials){
    return {
      r0: _.mean(trials.map(function(d){return d.r0;})),
      r1: _.mean(trials.map(function(d){return d.r1;})),
      d0: _.mean(trials.map(function(d){return d.d0;})),
      d1: _.mean(trials.map(function(d){return d.d1;}))
    };
  });
  console.log('summarizing');

  var rows = [];
  _.each(summary, function(value, key){
    rows.push([+key, 'v0', value.r0/100000, value.d0]);
    rows.push([+key, 'v1', value.r1/100000, value.d1]);
  });
  fs.writeFileSync('output/0vs1.csv', [['numNodes','version','ms', 'displacement']].concat(rows).map(function(d){return d.join(',');}).join('\n'));
  console.log('done');
}

var options = {
  algorithm: 'none',
  roundsPerTick: 100
};

run(_.range(1,10,1).concat(_.range(10,101,10)), 10, options);