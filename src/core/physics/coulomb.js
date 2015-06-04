define([

],
function(){
//---------------------------------------------------
// BEGIN code for this module
//---------------------------------------------------

function CoulombForce(coulombK, minDistance){
  this.coulombK = coulombK ? coulombK : 100;
  this.minDistance = minDistance ? minDistance : 0.1;
}

CoulombForce.prototype.computeForce = function(distance){
  distance = Math.max(distance, this.minDistance);
  return this.coulombK / (distance * distance);
};

return CoulombForce;

//---------------------------------------------------
// END code for this module
//---------------------------------------------------
});