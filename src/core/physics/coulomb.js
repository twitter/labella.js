function CoulombForce(coulombK, minDistance){
  this.coulombK = coulombK ? coulombK : 100;
  this.minDistance = minDistance ? minDistance : 0.1;
}

CoulombForce.prototype.computeForce = function(distance){
  distance = Math.max(distance, this.minDistance);
  return this.coulombK / (distance * distance);
};

module.exports = CoulombForce;