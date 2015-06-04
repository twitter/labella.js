/*
Copyright 2015 Twitter, Inc.
Licensed under the Apache License, Version 2.0
http://www.apache.org/licenses/LICENSE-2.0
*/

// Define module using Universal Module Definition pattern
// https://github.com/umdjs/umd/blob/master/amdWeb.js

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // Support AMD. Register as an anonymous module.
    // EDIT: List all dependencies in AMD style
    define([], factory);
  } else if (typeof exports === 'object'){
    // Support CommonJS
    // EDIT: List all dependencies in CommonJS style
    module.exports = factory();
  } else {
    // No AMD. Set module as a global variable
    // EDIT: Pass dependencies to factory function
    root.labella = factory();
  }
}(this,
//EDIT: The dependencies are passed to this function
function () {
  //---------------------------------------------------
  // BEGIN code for this module
  //---------------------------------------------------

