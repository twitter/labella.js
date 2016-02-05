var _ = require('lodash');
var labella = require('../dist/labella-extra.min.js');

function run(steps, round, treatments, nodeOptions){
  steps.map(function(step){
    var results = treatments.map(function(d){return [];});

    for(var i=0;i<round;i++){
      var nodes = util.generateNodes(step, _.extend({
        minWidth: 10,
        maxWidth: 50,
        minPos: null,
        maxPos: null
      }, nodeOptions));

      treatments.forEach(function(treatment, j){
        var force = treatment(nodes.map(function(d){return d.clone();}));

        // compute metrics
        var metrics = {
          displacement: labella.metrics.displacement(force.nodes())
        };

        results[j].push(metrics);
      });
    }

    return results.map(function(result){
      // compute average score
      return {};
    });
  });
}