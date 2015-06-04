define([

],
function(){
//---------------------------------------------------
// BEGIN code for this module
//---------------------------------------------------

function SpringForce(springK){
  this.springK = springK;
}

SpringForce.prototype.computeForce = function(displacement){
  return this.springK * displacement;
};

return SpringForce;

//---------------------------------------------------
// END code for this module
//---------------------------------------------------
});