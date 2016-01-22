(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["labella"] = factory();
	else
		root["labella"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	// Library for placing labels using the force
	// Author: Krist Wongsuphasawat

	module.exports = 1;

	// var Node = require('./core/node.js');
	// var NodeGroup = require('./core/nodeGroup.js');
	// var Force = require('./core/force.js');
	// var Simulator = require('./core/simulator.js');
	// var Distributor = require('./core/distributor.js');
	// var Renderer = require('./core/renderer.js');
	// var metrics = require('./core/metrics.js');
	// var util = require('./core/util.js');

	// module.exports = {
	//   Node: Node,
	//   NodeGroup: NodeGroup,
	//   Force: Force,
	//   Simulator: Simulator,
	//   Distributor: Distributor,
	//   Renderer: Renderer,

	//   metrics: metrics,
	//   util: util
	// };

/***/ }
/******/ ])
});
;