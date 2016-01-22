var vpsc = require('./src/lib/vpsc.js');
var labella = require('./dist/labella.js');

var labels = [
  [1,50],
  [2,50],
  [3,50],
  [3,50],
  [3,50],
  [304,50],
  [454,50],
  [454,50],
  [454,50],
  [804,50],
  [804,70],
  [804,50],
  [804,50],
  [854,50],
  [854,50]
];

var variables = labels.map(function(label){
  return new vpsc.Variable(label[0]);
});

var constraints = [];
for(var i=1;i<labels.length;i++){
  var l1 = labels[i-1];
  var l2 = labels[i];
  constraints.push(new vpsc.Constraint(variables[i-1], variables[i], (l1[1]+l2[1])/2 + 3));
}

var solver = new vpsc.Solver(variables, constraints);
solver.solve();

console.log(variables.map(function(d){return d.position();}));
