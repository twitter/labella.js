'use strict';

const helper = {
  isDefined(x){
    return x!==null && x!==undefined;
  },
  pick(object, keys){
    return keys.reduce((prev, key) => {
      prev[key] = object[key];
      return prev;
    }, {});
  },
  sum(array, accessor){
    return array.map(accessor)
      .reduce((prev, current) => {
        return prev + current;
      }, 0);
  }
};

helper.extend = require('../lib/extend.js');

module.exports = helper;