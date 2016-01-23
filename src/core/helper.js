var extend = require('../lib/extend.js');

module.exports = (function(){
  var helper = {};

  helper.sum = function(array, accessor){
    return array.map(accessor)
      .reduce(function(prev, current){
        return prev + current;
      }, 0);
  };

  helper.isObject = function(x) {
    return typeof x === 'object' && x !== null;
  };

  helper.isDefined = function(x){
    return x!==null && x!==undefined;
  };

  helper.extend = extend;

  helper.extractKeys = function(object, keys){
    return keys.reduce(function(prev, key){
      prev[key] = object[key];
      return prev;
    }, {});
  };

  return helper;
}());
