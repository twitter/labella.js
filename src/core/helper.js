'use strict';

const helper = {
  isDefined(x){
    return x!==null && x!==undefined;
  },
  last(array){
    return array.length > 0 ? array[array.length-1] : null;
  },
  pick(object, keys){
    return keys.reduce((prev, key) => {
      prev[key] = object[key];
      return prev;
    }, {});
  },
  sum(array, accessor){
    return array.map(accessor)
      .reduce(((prev, current) => prev + current), 0);
  },
  functor(v) {
    return typeof v === "function"
      ? function(nodeData){
        var result = v(nodeData);
        if(typeof result !== "number"){
          console.warn('Your nodeHeight function does not return a number.');
          return 10; //10 because it is a default node height
        }
        else return result;
      }
      : function() {
        return v;
      };
  }
};

helper.extend = require('../lib/extend.js');

module.exports = helper;