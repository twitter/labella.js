var labella = require('./dist/labella.js');
var removeOverlap = require('./src/core/removeOverlap.js');

var nodes = removeOverlap([
  new labella.Node(1,50),
  new labella.Node(2,50),
  new labella.Node(3,50),
  new labella.Node(3,50),
  new labella.Node(3,50),
  new labella.Node(304,50),
  new labella.Node(454,50),
  new labella.Node(454,50),
  new labella.Node(454,50),
  new labella.Node(804,50),
  new labella.Node(804,70),
  new labella.Node(804,50),
  new labella.Node(804,50),
  new labella.Node(854,50),
  new labella.Node(854,50)
]);

console.log('nodes', nodes);