var extend = require('../lib/extend.js');

module.exports = (function(){
  var helper = {};

  helper.isDefined = function(x){
    return x!==null && x!==undefined;
  };

  helper.extend = extend;

  helper.pick = function(object, keys){
    return keys.reduce(function(prev, key){
      prev[key] = object[key];
      return prev;
    }, {});
  };

  helper.sum = function(array, accessor){
    return array.map(accessor)
      .reduce(function(prev, current){
        return prev + current;
      }, 0);
  };

  return helper;
}());
