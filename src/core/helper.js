/* jshint esnext:true */

var extend = require('../lib/extend.js');

export default {
  extend(){
    return extend.apply(this, arguments);
  },
  isDefined(x){
    return x!==null && x!==undefined;
  },
  pick(object, keys){
    return keys.reduce(function(prev, key){
      prev[key] = object[key];
      return prev;
    }, {});
  },
  sum(array, accessor){
    return array.map(accessor)
      .reduce(function(prev, current){
        return prev + current;
      }, 0);
  }
};