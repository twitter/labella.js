define([
  'core/node',
  'core/nodeGroup',
  'core/force',
  'core/simulator',
  'core/distributor',
  'core/renderer',
  'core/metrics',
  'core/util'
],
function(Node, NodeGroup, Force, Simulator, Distributor, Renderer, metrics, util){
//---------------------------------------------------
// BEGIN code for this module
//---------------------------------------------------

// Library for placing labels using the force
// Author: Krist Wongsuphasawat

return {
  Node: Node,
  NodeGroup: NodeGroup,
  Force: Force,
  Simulator: Simulator,
  Distributor: Distributor,
  Renderer: Renderer,

  metrics: metrics,
  util: util
};

//---------------------------------------------------
// END code for this module
//---------------------------------------------------
});