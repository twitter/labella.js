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
/***/ function(module, exports, __webpack_require__) {

	// Library for placing labels using the force
	// Author: Krist Wongsuphasawat

	module.exports = {
	  Node: __webpack_require__(1),
	  Force: __webpack_require__(6),
	  Simulator: __webpack_require__(14),
	  Distributor: __webpack_require__(7),
	  Renderer: __webpack_require__(16),

	  // metrics: require('./core/metrics.js'),
	  util: __webpack_require__(17)
	};

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var helper = __webpack_require__(2);

	var Node = function (idealPos, width, data) {
	  if (arguments.length === 1 && helper.isObject(idealPos)) {
	    var input = idealPos;
	    this.idealPos = input.idealPos;
	    this.currentPos = input.currentPos !== null && input.currentPos !== undefined ? input.currentPos : input.idealPos;
	    this.width = input.width;
	    this.data = input.data;
	  } else {
	    this.idealPos = idealPos;
	    this.currentPos = idealPos;
	    this.width = width;
	    this.data = data;
	  }

	  this.previousPos = this.currentPos;
	};

	var proto = Node.prototype;

	// return negative if overlap
	proto.distanceFrom = function (node) {
	  var halfWidth = this.width / 2;
	  var nodeHalfWidth = node.width / 2;

	  // max(a[0], b[0]) - min(a[1], b[1])
	  return Math.max(this.currentPos - halfWidth, node.currentPos - nodeHalfWidth) - Math.min(this.currentPos + halfWidth, node.currentPos + nodeHalfWidth);
	};

	proto.moveToIdealPosition = function () {
	  this.currentPos = this.idealPos;
	  return this;
	};

	proto.displacement = function () {
	  return this.idealPos - this.currentPos;
	};

	proto.overlapWithNode = function (node, buffer) {
	  buffer = buffer === null || buffer === undefined ? 0 : buffer;
	  return this.distanceFrom(node) - buffer < 0;
	};

	proto.overlapWithPoint = function (pos) {
	  var halfWidth = this.width / 2;
	  return pos >= this.currentPos - halfWidth && pos <= this.currentPos + halfWidth;
	};

	proto.positionBefore = function (node, buffer) {
	  buffer = buffer ? buffer : 0;
	  return node.currentLeft() - this.width / 2 - buffer;
	};

	proto.positionAfter = function (node, buffer) {
	  buffer = buffer ? buffer : 0;
	  return node.currentRight() + this.width / 2 + buffer;
	};

	proto.currentRight = function () {
	  return this.currentPos + this.width / 2;
	};

	proto.currentLeft = function () {
	  return this.currentPos - this.width / 2;
	};

	proto.idealRight = function () {
	  return this.idealPos + this.width / 2;
	};

	proto.idealLeft = function () {
	  return this.idealPos - this.width / 2;
	};

	proto.halfWidth = function () {
	  return this.width / 2;
	};

	proto.velocity = function (timeStep) {
	  timeStep = timeStep || 1;
	  return (this.currentPos - this.previousPos) / timeStep;
	};

	proto.kineticEnergy = function () {
	  var v = this.velocity();
	  return v * v;
	};

	proto.createStub = function (width) {
	  var stub = new Node({
	    idealPos: this.idealPos,
	    currentPos: this.currentPos,
	    width: width,
	    data: this.data
	  });
	  stub.child = this;
	  this.parent = stub;
	  return stub;
	};

	proto.isStub = function () {
	  return !!this.child;
	};

	proto.getPathToRoot = function () {
	  var path = [];
	  var current = this;
	  while (current) {
	    path.push(current);
	    current = current.parent;
	  }
	  return path;
	};

	proto.getPathFromRoot = function () {
	  return this.getPathToRoot().reverse();
	};

	// Trace back to the node without parent
	proto.getRoot = function () {
	  var previous = this;
	  var current = this;
	  while (current) {
	    previous = current;
	    current = current.parent;
	  }
	  return previous;
	};

	proto.getLevel = function () {
	  var level = 0;
	  var current = this.parent;
	  while (current) {
	    current = current.parent;
	    level++;
	  }
	  return level;
	};

	proto.clone = function () {
	  return new Node({
	    idealPos: this.idealPos,
	    currentPos: this.currentPos,
	    width: this.width,
	    data: this.data
	  });
	};

	/**
	 * Check if two adjacent objects are running into each other
	 * Either a hits b or b hits a.
	 * The false case are when both are running away from each other,
	 * or one runs away and another stops
	 * Object#1's position must be before Object#2
	 * @param  Number f1 Object#1's force
	 * @param  Number f2 Object#2's force
	 * @return Boolean true if both object are running into each other
	 */
	proto.isBumping = function (b, buffer) {
	  var f1 = this.force || 0;
	  var f2 = b.force || 0;
	  /* jshint ignore:start */
	  return this.overlapWithNode(b, buffer) && (f1 * f2 > 0 || f1 === 0 && f2 < 0 || f1 > 0 && f2 === 0 || f1 > 0 && f2 < 0);
	  /* jshint ignore:end */
	};

	// return module
	module.exports = Node;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var extend = __webpack_require__(3);
	var d3Dispatch = __webpack_require__(4);
	var d3Rebind = __webpack_require__(5);

	module.exports = function () {
	  var helper = {};

	  helper.sum = function (array, accessor) {
	    return array.map(accessor).reduce(function (prev, current) {
	      return prev + current;
	    }, 0);
	  };

	  helper.isObject = function (x) {
	    return typeof x === 'object' && x !== null;
	  };

	  helper.isDefined = function (x) {
	    return x !== null && x !== undefined;
	  };

	  helper.extend = extend;

	  helper.dispatch = d3Dispatch;

	  helper.rebind = d3Rebind;

	  helper.extractKeys = function (object, keys) {
	    return keys.reduce(function (prev, key) {
	      prev[key] = object[key];
	      return prev;
	    }, {});
	  };

	  return helper;
	}();

/***/ },
/* 3 */
/***/ function(module, exports) {

	/*
	This file is modified from https://github.com/justmoon/node-extend
	The MIT License (MIT)

	Copyright (c) 2014 Stefan Thomas

	Permission is hereby granted, free of charge, to any person obtaining
	a copy of this software and associated documentation files (the
	"Software"), to deal in the Software without restriction, including
	without limitation the rights to use, copy, modify, merge, publish,
	distribute, sublicense, and/or sell copies of the Software, and to
	permit persons to whom the Software is furnished to do so, subject to
	the following conditions:

	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
	LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
	OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
	WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
	*/

	var hasOwn = Object.prototype.hasOwnProperty;
	var toStr = Object.prototype.toString;

	var isArray = function isArray(arr) {
	  if (typeof Array.isArray === 'function') {
	    return Array.isArray(arr);
	  }

	  return toStr.call(arr) === '[object Array]';
	};

	var isPlainObject = function isPlainObject(obj) {
	  'use strict';

	  if (!obj || toStr.call(obj) !== '[object Object]') {
	    return false;
	  }

	  var has_own_constructor = hasOwn.call(obj, 'constructor');
	  var has_is_property_of_method = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	  // Not own constructor property must be Object
	  if (obj.constructor && !has_own_constructor && !has_is_property_of_method) {
	    return false;
	  }

	  // Own properties are enumerated firstly, so to speed up,
	  // if last one is own, then all properties are own.
	  var key;
	  for (key in obj) {}

	  return key === undefined || hasOwn.call(obj, key);
	};

	module.exports = function extend() {
	  'use strict';

	  var options,
	      name,
	      src,
	      copy,
	      copyIsArray,
	      clone,
	      target = arguments[0],
	      i = 1,
	      length = arguments.length,
	      deep = false;

	  // Handle a deep copy situation
	  if (typeof target === 'boolean') {
	    deep = target;
	    target = arguments[1] || {};
	    // skip the boolean and the target
	    i = 2;
	  } else if (typeof target !== 'object' && typeof target !== 'function' || target == null) {
	    target = {};
	  }

	  for (; i < length; ++i) {
	    options = arguments[i];
	    // Only deal with non-null/undefined values
	    if (options != null) {
	      // Extend the base object
	      for (name in options) {
	        src = target[name];
	        copy = options[name];

	        // Prevent never-ending loop
	        if (target === copy) {
	          continue;
	        }

	        // Recurse if we're merging plain objects or arrays
	        if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
	          if (copyIsArray) {
	            copyIsArray = false;
	            clone = src && isArray(src) ? src : [];
	          } else {
	            clone = src && isPlainObject(src) ? src : {};
	          }

	          // Never move original objects, clone them
	          target[name] = extend(deep, clone, copy);

	          // Don't bring in undefined values
	        } else if (copy !== undefined) {
	            target[name] = copy;
	          }
	      }
	    }
	  }

	  // Return the modified object
	  return target;
	};

/***/ },
/* 4 */
/***/ function(module, exports) {

	var d3 = { version: '3.4.4' };
	function d3_class(ctor, properties) {
	  try {
	    for (var key in properties) {
	      Object.defineProperty(ctor.prototype, key, {
	        value: properties[key],
	        enumerable: false
	      });
	    }
	  } catch (e) {
	    ctor.prototype = properties;
	  }
	}
	d3.map = function (object) {
	  var map = new d3_Map();
	  if (object instanceof d3_Map) object.forEach(function (key, value) {
	    map.set(key, value);
	  });else for (var key in object) map.set(key, object[key]);
	  return map;
	};
	function d3_Map() {}
	d3_class(d3_Map, {
	  has: d3_map_has,
	  get: function (key) {
	    return this[d3_map_prefix + key];
	  },
	  set: function (key, value) {
	    return this[d3_map_prefix + key] = value;
	  },
	  remove: d3_map_remove,
	  keys: d3_map_keys,
	  values: function () {
	    var values = [];
	    this.forEach(function (key, value) {
	      values.push(value);
	    });
	    return values;
	  },
	  entries: function () {
	    var entries = [];
	    this.forEach(function (key, value) {
	      entries.push({
	        key: key,
	        value: value
	      });
	    });
	    return entries;
	  },
	  size: d3_map_size,
	  empty: d3_map_empty,
	  forEach: function (f) {
	    for (var key in this) if (key.charCodeAt(0) === d3_map_prefixCode) f.call(this, key.substring(1), this[key]);
	  }
	});
	var d3_map_prefix = '\0',
	    d3_map_prefixCode = d3_map_prefix.charCodeAt(0);
	function d3_map_has(key) {
	  return d3_map_prefix + key in this;
	}
	function d3_map_remove(key) {
	  key = d3_map_prefix + key;
	  return key in this && delete this[key];
	}
	function d3_map_keys() {
	  var keys = [];
	  this.forEach(function (key) {
	    keys.push(key);
	  });
	  return keys;
	}
	function d3_map_size() {
	  var size = 0;
	  for (var key in this) if (key.charCodeAt(0) === d3_map_prefixCode) ++size;
	  return size;
	}
	function d3_map_empty() {
	  for (var key in this) if (key.charCodeAt(0) === d3_map_prefixCode) return false;
	  return true;
	}
	d3.dispatch = function () {
	  var dispatch = new d3_dispatch(),
	      i = -1,
	      n = arguments.length;
	  while (++i < n) dispatch[arguments[i]] = d3_dispatch_event(dispatch);
	  return dispatch;
	};
	function d3_dispatch() {}
	d3_dispatch.prototype.on = function (type, listener) {
	  var i = type.indexOf('.'),
	      name = '';
	  if (i >= 0) {
	    name = type.substring(i + 1);
	    type = type.substring(0, i);
	  }
	  if (type) return arguments.length < 2 ? this[type].on(name) : this[type].on(name, listener);
	  if (arguments.length === 2) {
	    if (listener == null) for (type in this) {
	      if (this.hasOwnProperty(type)) this[type].on(name, null);
	    }
	    return this;
	  }
	};
	function d3_dispatch_event(dispatch) {
	  var listeners = [],
	      listenerByName = new d3_Map();
	  function event() {
	    var z = listeners,
	        i = -1,
	        n = z.length,
	        l;
	    while (++i < n) if (l = z[i].on) l.apply(this, arguments);
	    return dispatch;
	  }
	  event.on = function (name, listener) {
	    var l = listenerByName.get(name),
	        i;
	    if (arguments.length < 2) return l && l.on;
	    if (l) {
	      l.on = null;
	      listeners = listeners.slice(0, i = listeners.indexOf(l)).concat(listeners.slice(i + 1));
	      listenerByName.remove(name);
	    }
	    if (listener) listeners.push(listenerByName.set(name, { on: listener }));
	    return dispatch;
	  };
	  return event;
	}

	module.exports = d3.dispatch;

/***/ },
/* 5 */
/***/ function(module, exports) {

	var rebind = function (target, source) {
	  var i = 1,
	      n = arguments.length,
	      method;
	  while (++i < n) target[method = arguments[i]] = d3_rebind(target, source, source[method]);
	  return target;
	};

	function d3_rebind(target, source, method) {
	  return function () {
	    var value = method.apply(source, arguments);
	    return value === source ? target : value;
	  };
	}

	// return module
	module.exports = rebind;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	// var Simulator = require('./simulator.js');
	var Distributor = __webpack_require__(7);
	var metrics = __webpack_require__(10);
	var helper = __webpack_require__(2);
	var Spring = __webpack_require__(11);
	var removeOverlap = __webpack_require__(12);

	var DEFAULT_OPTIONS = {
	  damping: 0.1,
	  epsilon: 0.003,
	  timestep: 1,
	  nodeSpacing: 3,
	  minPos: 0,
	  maxPos: null,
	  pullForce: new Spring(1),
	  roundsPerTick: 100,

	  algorithm: 'overlap',
	  density: 0.85,
	  stubWidth: 1
	};

	var Force = function (_options) {
	  var force = {};
	  var dispatch = helper.dispatch('start', 'tick', 'endLayer', 'end');
	  var options = helper.extend({}, DEFAULT_OPTIONS);
	  var distributor = new Distributor();
	  // var simulators = [];
	  var nodes = [];
	  var layers = null;
	  var isRunning = false;

	  force.nodes = function (x) {
	    if (!arguments.length) return nodes;
	    nodes = x;
	    layers = null;
	    // simulators = [];
	    return force;
	  };

	  force.getLayers = function () {
	    return layers;
	  };

	  force.options = function (x) {
	    if (!arguments.length) return options;
	    options = helper.extend(options, x);

	    var disOptions = helper.extractKeys(options, Object.keys(Distributor.DEFAULT_OPTIONS));
	    if (helper.isDefined(options.minPos) && helper.isDefined(options.maxPos)) {
	      disOptions.layerWidth = options.maxPos - options.minPos;
	    } else {
	      disOptions.layerWidth = null;
	    }
	    distributor.options(disOptions);

	    // var simOptions = helper.extractKeys(options, Object.keys(Simulator.DEFAULT_OPTIONS));
	    // simulators.forEach(function(sim){
	    //   sim.options(simOptions);
	    // });

	    return force;
	  };

	  force.options(_options);

	  force.distribute = function () {
	    if (isRunning) {
	      throw 'This function cannot be called while the simulator is running. Stop it first.';
	    }
	    layers = distributor.distribute(nodes);
	    var simOptions = helper.extractKeys(options, Object.keys(Simulator.DEFAULT_OPTIONS));
	    simulators = layers.map(function (layer) {
	      return new Simulator(simOptions).nodes(layer);
	    });
	    return force;
	  };

	  force.initialize = function () {
	    if (isRunning) {
	      throw 'This function cannot be called while the simulator is running. Stop it first.';
	    }
	    simulators.forEach(function (sim) {
	      sim.initialize();
	    });
	    return force;
	  };

	  force.step = function () {
	    simulators.forEach(function (sim) {
	      sim.step();
	    });
	    return force;
	  };

	  force.stop = function () {
	    simulators.forEach(function (sim) {
	      sim.stop();
	    });
	    return force;
	  };

	  force.start = function (maxRound) {
	    var opt = {
	      nodeSpacing: options.nodeSpacing,
	      minPos: options.minPos,
	      maxPos: options.maxPos
	    };

	    setTimeout(function () {
	      dispatch.start({ type: 'start' });
	      layers = distributor.distribute(nodes);
	      layers.map(function (layer, index) {
	        removeOverlap(layer, opt);
	        dispatch.endLayer({
	          type: 'endLayer',
	          layerIndex: index
	        });
	      });
	      dispatch.end({ type: 'end' });
	    });

	    // if(isRunning){
	    //   throw 'This function cannot be called while the simulator is running. Stop it first.';
	    // }
	    // setTimeout(function(){
	    //   if(!layers){
	    //     force.distribute();
	    //   }
	    //   force.initialize().resume(maxRound);
	    // }, 0);
	    return force;
	  };

	  force.resume = function (additionalRound) {
	    if (layers.length === 0) return force;

	    if (!isRunning) {
	      var layerIndex = 0;
	      dispatch.start({ type: 'start' });

	      var simulate = function () {
	        var sim = simulators[layerIndex];
	        if (!sim) return;

	        sim.on('tick', function (event) {
	          dispatch.tick(helper.extend({}, event, {
	            layerIndex: layerIndex
	          }));
	        });
	        sim.on('end', function (event) {
	          dispatch.endLayer(helper.extend({}, event, {
	            type: 'endLayer',
	            layerIndex: layerIndex
	          }));

	          layerIndex++;

	          // Still have layer(s) left
	          if (layerIndex < layers.length) {
	            simulate();
	          }
	          // really end
	          else {
	              dispatch.end({ type: 'end' });
	              isRunning = false;
	            }
	        });

	        if (layerIndex > 0) {
	          sim.start(additionalRound);
	        } else {
	          sim.resume(additionalRound);
	        }
	      };

	      simulate();
	    }

	    return force;
	  };

	  force.energy = function () {
	    return helper.sum(simulators, function (sim) {
	      return sim.energy();
	    });
	  };

	  force.isStable = function () {
	    return simulators.every(function (d) {
	      return d.isStable();
	    });
	  };

	  force.reset = force.initialize;

	  force.metrics = function () {
	    return Object.keys(metrics).map(function (name) {
	      return {
	        name: name,
	        value: force.metric(name)
	      };
	    });
	  };

	  force.metric = function (name) {
	    switch (name) {
	      case 'overflow':
	        return metrics[name](layers, options.minPos, options.maxPos);
	      case 'overDensity':
	        return metrics[name](layers, options.density, options.layerWidth, options.nodeSpacing - 1);
	      case 'overlapCount':
	        return metrics[name](layers, options.nodeSpacing - 1);
	      default:
	        return metrics[name] ? metrics[name](layers) : null;
	    }
	  };

	  helper.rebind(force, dispatch, 'on');

	  return force;
	};

	Force.DEFAULT_OPTIONS = DEFAULT_OPTIONS;

	module.exports = Force;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var helper = __webpack_require__(2);
	var IntervalTree = __webpack_require__(8);

	var DEFAULT_OPTIONS = {
	  algorithm: 'overlap',
	  layerWidth: 1000,
	  density: 0.75,
	  nodeSpacing: 3,
	  // bundleStubs: false,
	  stubWidth: 1
	};

	var Distributor = function (options) {
	  var distributor = {};

	  options = helper.extend({}, DEFAULT_OPTIONS, options);

	  distributor.options = function (x) {
	    if (!arguments.length) return options;
	    options = helper.extend(options, x);
	    return distributor;
	  };

	  distributor.computeRequiredWidth = function (nodes) {
	    return helper.sum(nodes, function (d) {
	      return d.width + options.nodeSpacing;
	    }) - options.nodeSpacing;
	  };

	  distributor.maxWidthPerLayer = function () {
	    return options.density * options.layerWidth;
	  };

	  distributor.needToSplit = function (nodes) {
	    return distributor.estimateRequiredLayers(nodes) > 1;
	  };

	  distributor.estimateRequiredLayers = function (nodes) {
	    return options.layerWidth ? Math.ceil(distributor.computeRequiredWidth(nodes) / distributor.maxWidthPerLayer()) : 1;
	  };

	  var algorithms = {
	    simple: function (nodes) {
	      var numLayers = distributor.estimateRequiredLayers(nodes);

	      var layers = [];
	      for (var i = 0; i < numLayers; i++) {
	        layers.push([]);
	      }

	      nodes.forEach(function (node, i) {
	        var mod = i % numLayers;
	        layers[mod].push(node);

	        var stub = node;
	        for (var j = mod - 1; j >= 0; j--) {
	          stub = stub.createStub(options.stubWidth);
	          layers[j].push(stub);
	        }
	      });

	      return layers;
	    },
	    roundRobin: function (nodes) {
	      var layers = [];

	      return layers;
	    },
	    overlap: function (nodes) {
	      var layers = [];
	      var maxWidth = distributor.maxWidthPerLayer();

	      var puntedNodes = nodes.concat();
	      var puntedWidth = distributor.computeRequiredWidth(puntedNodes);

	      while (puntedWidth > maxWidth) {
	        distributor.countIdealOverlaps(puntedNodes);

	        var nodesInCurrentLayer = puntedNodes.concat();
	        var currentlayerWidth = puntedWidth;
	        puntedNodes = [];

	        while (nodesInCurrentLayer.length > 2 && currentlayerWidth > maxWidth) {
	          // Sort by overlaps
	          nodesInCurrentLayer.sort(function (a, b) {
	            return b.overlapCount - a.overlapCount;
	          });

	          // Remove the node with most overlap
	          var first = nodesInCurrentLayer.shift();

	          // Update width
	          currentlayerWidth -= first.width;
	          currentlayerWidth += options.stubWidth;

	          // Update overlap count for the remaining nodes
	          first.overlaps.forEach(function (node) {
	            node.overlapCount--;
	          });

	          // Add removed node to the next layer
	          puntedNodes.push(first);
	        }

	        layers.push(nodesInCurrentLayer);

	        puntedWidth = distributor.computeRequiredWidth(puntedNodes);
	      }

	      if (puntedNodes.length > 0) {
	        layers.push(puntedNodes);
	      }

	      // Create stubs
	      // From last layer
	      for (var i = layers.length - 1; i >= 1; i--) {
	        var layer = layers[i];
	        // For each node in the layer
	        for (var k = 0; k < layer.length; k++) {
	          var node = layer[k];
	          // If it is not a stub
	          if (node.isStub()) continue;
	          // Create one stub for each layer above it
	          var stub = node;
	          for (var j = i - 1; j >= 0; j--) {
	            stub = stub.createStub(options.stubWidth);
	            layers[j].push(stub);
	          }
	        }
	      }

	      return layers;
	    }
	  };

	  distributor.countIdealOverlaps = function (nodes) {
	    var iTree = new IntervalTree(options.layerWidth / 2);
	    nodes.forEach(function (node) {
	      iTree.add([node.idealLeft(), node.idealRight(), node]);
	    });

	    nodes.forEach(function (node) {
	      var overlaps = iTree.search(node.idealLeft(), node.idealRight());
	      node.overlaps = overlaps;
	      node.overlapCount = overlaps.length;
	    });

	    return nodes;
	  };

	  distributor.distribute = function (nodes) {
	    if (!nodes || nodes.length === 0) return [];

	    nodes = nodes.concat().sort(function (a, b) {
	      return a.idealPos - b.idealPos;
	    });

	    if (!distributor.needToSplit(nodes)) {
	      return [nodes];
	    }

	    if (typeof options.algorithm == 'function') {
	      return options.algorithm(nodes, options);
	    } else if (options.algorithm == 'none') {
	      return nodes;
	    } else if (algorithms.hasOwnProperty(options.algorithm)) {
	      return algorithms[options.algorithm](nodes);
	    } else {
	      throw 'Unknown algorithm: ' + options.algorithm;
	    }
	  };

	  return distributor;
	};

	Distributor.DEFAULT_OPTIONS = DEFAULT_OPTIONS;

	// return module
	module.exports = Distributor;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/*
	This file is modified from https://github.com/shinout/interval-tree

	(The MIT License)

	Copyright (c) 2012 SHIN Suzuki <shinout310@gmail.com>

	Permission is hereby granted, free of charge, to any person obtaining
	a copy of this software and associated documentation files (the
	'Software'), to deal in the Software without restriction, including
	without limitation the rights to use, copy, modify, merge, publish,
	distribute, sublicense, and/or sell copies of the Software, and to
	permit persons to whom the Software is furnished to do so, subject to
	the following conditions:

	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
	IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
	CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
	TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
	SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
	*/

	var SortedList = __webpack_require__(9);

	/**
	 * IntervalTree
	 *
	 * @param (object) data:
	 * @param (number) center:
	 * @param (object) options:
	 *   center:
	 *
	 **/
	function IntervalTree(center, options) {
	  options || (options = {});

	  this.startKey = options.startKey || 0; // start key
	  this.endKey = options.endKey || 1; // end key
	  this.intervalHash = {}; // id => interval object
	  this.pointTree = new SortedList({ // b-tree of start, end points
	    compare: function (a, b) {
	      if (a == null) return -1;
	      if (b == null) return 1;
	      var c = a[0] - b[0];
	      return c > 0 ? 1 : c == 0 ? 0 : -1;
	    }
	  });

	  this._autoIncrement = 0;

	  // index of the root node
	  if (!center || typeof center != 'number') {
	    throw new Error('you must specify center index as the 2nd argument.');
	  }

	  this.root = new Node(center, this);
	}

	/**
	 * publid methods
	 **/

	/**
	 * add new range
	 **/
	IntervalTree.prototype.add = function (data, id) {
	  if (this.intervalHash[id]) {
	    throw new Error('id ' + id + ' is already registered.');
	  }

	  if (id == undefined) {
	    while (this.intervalHash[this._autoIncrement]) {
	      this._autoIncrement++;
	    }
	    id = this._autoIncrement;
	  }

	  var itvl = new Interval(data, id, this.startKey, this.endKey);
	  this.pointTree.insert([itvl.start, id]);
	  this.pointTree.insert([itvl.end, id]);
	  this.intervalHash[id] = itvl;
	  this._autoIncrement++;
	  _insert.call(this, this.root, itvl);
	};

	/**
	 * search
	 *
	 * @param (integer) val:
	 * @return (array)
	 **/
	IntervalTree.prototype.search = function (val1, val2) {
	  var ret = [];
	  if (typeof val1 != 'number') {
	    throw new Error(val1 + ': invalid input');
	  }

	  if (val2 == undefined) {
	    _pointSearch.call(this, this.root, val1, ret);
	  } else if (typeof val2 == 'number') {
	    _rangeSearch.call(this, val1, val2, ret);
	  } else {
	    throw new Error(val1 + ',' + val2 + ': invalid input');
	  }
	  return ret;
	};

	/**
	 * remove:
	 **/
	IntervalTree.prototype.remove = function (interval_id) {};

	/**
	 * private methods
	 **/

	/**
	 * _insert
	 **/
	function _insert(node, itvl) {
	  if (itvl.end < node.idx) {
	    if (!node.left) {
	      node.left = new Node(itvl.start + itvl.end >> 1, this);
	    }
	    return _insert.call(this, node.left, itvl);
	  }

	  if (node.idx < itvl.start) {
	    if (!node.right) {
	      node.right = new Node(itvl.start + itvl.end >> 1, this);
	    }
	    return _insert.call(this, node.right, itvl);
	  }
	  return node.insert(itvl);
	}

	/**
	 * _pointSearch
	 * @param (Node) node
	 * @param (integer) idx
	 * @param (Array) arr
	 **/
	function _pointSearch(node, idx, arr) {
	  if (!node) return;

	  if (idx < node.idx) {
	    node.starts.every(function (itvl) {
	      var bool = itvl.start <= idx;
	      if (bool) arr.push(itvl.result());
	      return bool;
	    });
	    return _pointSearch.call(this, node.left, idx, arr);
	  } else if (idx > node.idx) {
	    node.ends.every(function (itvl) {
	      var bool = itvl.end >= idx;
	      if (bool) arr.push(itvl.result());
	      return bool;
	    });
	    return _pointSearch.call(this, node.right, idx, arr);
	  }
	  // exact equal
	  else {
	      node.starts.map(function (itvl) {
	        arr.push(itvl.result());
	      });
	    }
	}

	/**
	 * _rangeSearch
	 * @param (integer) start
	 * @param (integer) end
	 * @param (Array) arr
	 **/
	function _rangeSearch(start, end, arr) {
	  if (end - start <= 0) {
	    throw new Error('end must be greater than start. start: ' + start + ', end: ' + end);
	  }
	  var resultHash = {};

	  var wholeWraps = [];
	  _pointSearch.call(this, this.root, start + end >> 1, wholeWraps, true);

	  wholeWraps.forEach(function (result) {
	    resultHash[result.id] = true;
	  });

	  var idx1 = this.pointTree.bsearch([start, null]);
	  var pointTreeArray = this.pointTree;
	  while (idx1 >= 0 && pointTreeArray[idx1][0] == start) {
	    idx1--;
	  }

	  var idx2 = this.pointTree.bsearch([end, null]);
	  if (idx2 >= 0) {
	    var len = pointTreeArray.length - 1;
	    while (idx2 <= len && pointTreeArray[idx2][0] <= end) {
	      idx2++;
	    }

	    pointTreeArray.slice(idx1 + 1, idx2).forEach(function (point) {
	      var id = point[1];
	      resultHash[id] = true;
	    }, this);

	    Object.keys(resultHash).forEach(function (id) {
	      var itvl = this.intervalHash[id];
	      arr.push(itvl.result(start, end));
	    }, this);
	  }
	}

	/**
	 * subclasses
	 *
	 **/

	/**
	 * Node : prototype of each node in a interval tree
	 *
	 **/
	function Node(idx) {
	  this.idx = idx;
	  this.starts = new SortedList({
	    compare: function (a, b) {
	      if (a == null) return -1;
	      if (b == null) return 1;
	      var c = a.start - b.start;
	      return c > 0 ? 1 : c == 0 ? 0 : -1;
	    }
	  });

	  this.ends = new SortedList({
	    compare: function (a, b) {
	      if (a == null) return -1;
	      if (b == null) return 1;
	      var c = a.end - b.end;
	      return c < 0 ? 1 : c == 0 ? 0 : -1;
	    }
	  });
	}

	/**
	 * insert an Interval object to this node
	 **/
	Node.prototype.insert = function (interval) {
	  this.starts.insert(interval);
	  this.ends.insert(interval);
	};

	/**
	 * Interval : prototype of interval info
	 **/
	function Interval(data, id, s, e) {
	  this.id = id;
	  this.start = data[s];
	  this.end = data[e];
	  this.data = data;

	  if (typeof this.start != 'number' || typeof this.end != 'number') {
	    throw new Error('start, end must be number. start: ' + this.start + ', end: ' + this.end);
	  }

	  if (this.start >= this.end) {
	    throw new Error('start must be smaller than end. start: ' + this.start + ', end: ' + this.end);
	  }
	}

	/**
	 * get result object
	 **/
	Interval.prototype.result = function (start, end) {
	  var ret = {
	    id: this.id,
	    data: this.data
	  };
	  if (typeof start == 'number' && typeof end == 'number') {
	    /**
	     * calc overlapping rate
	     **/
	    var left = Math.max(this.start, start);
	    var right = Math.min(this.end, end);
	    var lapLn = right - left;
	    ret.rate1 = lapLn / (end - start);
	    ret.rate2 = lapLn / (this.end - this.start);
	  }
	  return ret;
	};

	module.exports = IntervalTree;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
	This file is modified from https://github.com/shinout/SortedList

	(The MIT License)

	Copyright (c) 2012 SHIN Suzuki <shinout310@gmail.com>

	Permission is hereby granted, free of charge, to any person obtaining
	a copy of this software and associated documentation files (the
	'Software'), to deal in the Software without restriction, including
	without limitation the rights to use, copy, modify, merge, publish,
	distribute, sublicense, and/or sell copies of the Software, and to
	permit persons to whom the Software is furnished to do so, subject to
	the following conditions:

	The above copyright notice and this permission notice shall be
	included in all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
	EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
	IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
	CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
	TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
	SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
	*/

	(function (root, factory) {
	  if (true) !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));else if (typeof module == 'object' && module.exports) module.exports = factory();else root.SortedList = factory();
	})(this, function () {

	  /**
	   * SortedList : constructor
	   */
	  var SortedList = function SortedList() {
	    var arr = null,
	        options = {},
	        args = arguments;

	    ["0", "1"].forEach(function (n) {
	      var val = args[n];
	      if (Array.isArray(val)) {
	        arr = val;
	      } else if (val && typeof val == "object") {
	        options = val;
	      }
	    });

	    if (typeof options.filter == 'function') {
	      this._filter = options.filter;
	    }

	    if (typeof options.compare == 'function') {
	      this._compare = options.compare;
	    } else if (typeof options.compare == 'string' && SortedList.compares[options.compare]) {
	      this._compare = SortedList.compares[options.compare];
	    }

	    this._unique = !!options.unique;

	    if (options.resume && arr) {
	      arr.forEach(function (v, i) {
	        this.push(v);
	      }, this);
	    } else if (arr) this.insert.apply(this, arr);
	  };

	  /**
	   * SortedList.create(val1, val2)
	   * creates an instance
	   **/
	  SortedList.create = function (val1, val2) {
	    return new SortedList(val1, val2);
	  };

	  SortedList.prototype = new Array();
	  SortedList.prototype.constructor = Array.prototype.constructor;

	  /**
	   * sorted.insertOne(val)
	   * insert one value
	   * returns false if failed, inserted position if succeed
	   **/
	  SortedList.prototype.insertOne = function (val) {
	    var pos = this.bsearch(val);
	    if (this._unique && this.key(val, pos) != null) return false;
	    if (!this._filter(val, pos)) return false;
	    this.splice(pos + 1, 0, val);
	    return pos + 1;
	  };

	  /**
	   * sorted.insert(val1, val2, ...)
	   * insert multi values
	   * returns the list of the results of insertOne()
	   **/
	  SortedList.prototype.insert = function () {
	    return Array.prototype.map.call(arguments, function (val) {
	      return this.insertOne(val);
	    }, this);
	  };

	  /**
	   * sorted.remove(pos)
	   * remove the value in the given position
	   **/
	  SortedList.prototype.remove = function (pos) {
	    this.splice(pos, 1);
	    return this;
	  };

	  /**
	   * sorted.bsearch(val)
	   * @returns position of the value
	   **/
	  SortedList.prototype.bsearch = function (val) {
	    if (!this.length) return -1;
	    var mpos,
	        spos = 0,
	        epos = this.length;
	    while (epos - spos > 1) {
	      mpos = Math.floor((spos + epos) / 2);
	      mval = this[mpos];
	      var comp = this._compare(val, mval);
	      if (comp == 0) return mpos;
	      if (comp > 0) spos = mpos;else epos = mpos;
	    }
	    return spos == 0 && this._compare(this[0], val) > 0 ? -1 : spos;
	  };

	  /**
	   * sorted.key(val)
	   * @returns first index if exists, null if not
	   **/
	  SortedList.prototype.key = function (val, bsResult) {
	    if (bsResult == null) bsResult = this.bsearch(val);
	    var pos = bsResult;
	    if (pos == -1 || this._compare(this[pos], val) < 0) return pos + 1 < this.length && this._compare(this[pos + 1], val) == 0 ? pos + 1 : null;
	    while (pos >= 1 && this._compare(this[pos - 1], val) == 0) pos--;
	    return pos;
	  };

	  /**
	   * sorted.key(val)
	   * @returns indexes if exists, null if not
	   **/
	  SortedList.prototype.keys = function (val, bsResult) {
	    var ret = [];
	    if (bsResult == null) bsResult = this.bsearch(val);
	    var pos = bsResult;
	    while (pos >= 0 && this._compare(this[pos], val) == 0) {
	      ret.push(pos);
	      pos--;
	    }

	    var len = this.length;
	    pos = bsResult + 1;
	    while (pos < len && this._compare(this[pos], val) == 0) {
	      ret.push(pos);
	      pos++;
	    }
	    return ret.length ? ret : null;
	  };

	  /**
	   * sorted.unique()
	   * @param createNew : create new instance
	   * @returns first index if exists, null if not
	   **/
	  SortedList.prototype.unique = function (createNew) {
	    if (createNew) return this.filter(function (v, k) {
	      return k == 0 || this._compare(this[k - 1], v) != 0;
	    }, this);
	    var total = 0;
	    this.map(function (v, k) {
	      if (k == 0 || this._compare(this[k - 1], v) != 0) return null;
	      return k - total++;
	    }, this).forEach(function (k) {
	      if (k != null) this.remove(k);
	    }, this);
	    return this;
	  };

	  /**
	   * sorted.toArray()
	   * get raw array
	   **/
	  SortedList.prototype.toArray = function () {
	    return this.slice();
	  };

	  /**
	   * default filtration function
	   **/
	  SortedList.prototype._filter = function (val, pos) {
	    return true;
	  };

	  /**
	   * comparison functions
	   **/
	  SortedList.compares = {
	    "number": function (a, b) {
	      var c = a - b;
	      return c > 0 ? 1 : c == 0 ? 0 : -1;
	    },

	    "string": function (a, b) {
	      return a > b ? 1 : a == b ? 0 : -1;
	    }
	  };

	  /**
	   * sorted.compare(a, b)
	   * default comparison function
	   **/
	  SortedList.prototype._compare = SortedList.compares["string"];

	  return SortedList;
	});

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var helper = __webpack_require__(2);

	var module = function () {
	  var metrics = {};

	  function toLayers(nodes) {
	    return nodes.length === 0 || Array.isArray(nodes[0]) ? nodes : [nodes];
	  }

	  metrics.displacement = function (nodes) {
	    if (nodes.length === 0) return 0;
	    var layers = toLayers(nodes);
	    return helper.sum(layers, function (layer) {
	      return helper.sum(layer, function (node) {
	        return Math.abs(node.displacement());
	      });
	    });
	  };

	  metrics.overflow = function (nodes, minPos, maxPos) {
	    if (nodes.length === 0 || !helper.isDefined(minPos) && !helper.isDefined(maxPos)) return 0;
	    var layers = toLayers(nodes);

	    return helper.sum(layers, function (layer) {
	      return helper.sum(layer, function (node) {
	        var l = node.currentLeft();
	        var r = node.currentRight();

	        if (helper.isDefined(minPos)) {
	          if (r <= minPos) {
	            return node.width;
	          } else if (l < minPos) {
	            return minPos - l;
	          }
	        }

	        if (helper.isDefined(maxPos)) {
	          if (l >= maxPos) {
	            return node.width;
	          } else if (r > maxPos) {
	            return r - maxPos;
	          }
	        }

	        return 0;
	      });
	    });
	  };

	  metrics.overDensity = function (nodes, density, layerWidth, nodeSpacing) {
	    if (nodes.length === 0) return 0;

	    var limit = density * layerWidth;

	    var layers = toLayers(nodes);
	    return helper.sum(layers, function (layer) {
	      var width = helper.sum(layer, function (node) {
	        return node.width + nodeSpacing;
	      }) - nodeSpacing;
	      return width <= limit ? 0 : width - limit;
	    });
	  };

	  metrics.overlapCount = function (nodes, buffer) {
	    if (nodes.length === 0) return 0;
	    var layers = toLayers(nodes);
	    return helper.sum(layers, function (layer) {
	      var count = 0;
	      for (var i = 0; i < layer.length; i++) {
	        for (var j = i + 1; j < layer.length; j++) {
	          if (layer[i].overlapWithNode(layer[j], buffer)) {
	            count++;
	          }
	        }
	      }
	      return count;
	    });
	  };

	  metrics.overlapSpace = function (nodes) {
	    if (nodes.length === 0) return 0;
	    var layers = toLayers(nodes);
	    return helper.sum(layers, function (layer) {
	      var count = 0;
	      for (var i = 0; i < layer.length; i++) {
	        for (var j = i + 1; j < layer.length; j++) {
	          var distance = layer[i].distanceFrom(layer[j]);
	          count += distance < 0 ? Math.abs(distance) : 0;
	        }
	      }
	      return count;
	    });
	  };

	  metrics.weightedAllocatedSpace = function (nodes) {
	    if (nodes.length === 0) return 0;
	    var layers = toLayers(nodes);

	    return helper.sum(layers, function (layer, layerIndex) {
	      return layerIndex * helper.sum(layer, function (d) {
	        return d.width;
	      });
	    });
	  };

	  return metrics;
	}();

	// return module
	module.exports = module;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
	  //---------------------------------------------------
	  // BEGIN code for this module
	  //---------------------------------------------------

	  function SpringForce(springK) {
	    this.springK = springK;
	  }

	  SpringForce.prototype.computeForce = function (displacement) {
	    return this.springK * displacement;
	  };

	  return SpringForce;

	  //---------------------------------------------------
	  // END code for this module
	  //---------------------------------------------------
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var vpsc = __webpack_require__(13);
	var helper = __webpack_require__(2);

	var DEFAULT_OPTIONS = {
	  nodeSpacing: 3,
	  minPos: 0,
	  maxPos: null
	};

	function last(arr) {
	  return arr[arr.length - 1];
	}

	module.exports = function removeOverlap(nodes, options) {
	  if (nodes.length > 0) {
	    options = helper.extend(DEFAULT_OPTIONS, options);

	    // For nodes with stub, set ideal position to stub's current position
	    nodes.filter(function (node) {
	      return !!node.parent;
	    }).forEach(function (node) {
	      node.idealPos = node.parent.currentPos;
	    });

	    nodes.sort(function (a, b) {
	      return a.idealPos - b.idealPos;
	    });

	    var variables = nodes.map(function (node) {
	      var v = new vpsc.Variable(node.idealPos);
	      v.node = node;
	      return v;
	    });

	    var constraints = [];
	    for (var i = 1; i < variables.length; i++) {
	      var v1 = variables[i - 1];
	      var v2 = variables[i];
	      constraints.push(new vpsc.Constraint(v1, v2, (v1.node.width + v2.node.width) / 2 + options.nodeSpacing));
	    }

	    if (helper.isDefined(options.minPos)) {
	      var leftWall = new vpsc.Variable(options.minPos, 1e10);
	      var v = variables[0];
	      constraints.push(new vpsc.Constraint(leftWall, v, v.node.width / 2));
	      variables.unshift(leftWall);
	    }

	    if (helper.isDefined(options.maxPos)) {
	      var rightWall = new vpsc.Variable(options.maxPos, 1e10);
	      var lastv = last(variables);
	      constraints.push(new vpsc.Constraint(lastv, rightWall, lastv.node.width / 2));
	      variables.push(rightWall);
	    }

	    var solver = new vpsc.Solver(variables, constraints);
	    solver.solve();

	    variables.filter(function (v) {
	      return v.node;
	    }).map(function (v) {
	      v.node.currentPos = Math.round(v.position());
	      return v;
	    });
	  }

	  return nodes;
	};

/***/ },
/* 13 */
/***/ function(module, exports) {

	var vpsc = {};

	var PositionStats = function () {
	    function PositionStats(scale) {
	        this.scale = scale;
	        this.AB = 0;
	        this.AD = 0;
	        this.A2 = 0;
	    }
	    PositionStats.prototype.addVariable = function (v) {
	        var ai = this.scale / v.scale;
	        var bi = v.offset / v.scale;
	        var wi = v.weight;
	        this.AB += wi * ai * bi;
	        this.AD += wi * ai * v.desiredPosition;
	        this.A2 += wi * ai * ai;
	    };
	    PositionStats.prototype.getPosn = function () {
	        return (this.AD - this.AB) / this.A2;
	    };
	    return PositionStats;
	}();
	vpsc.PositionStats = PositionStats;
	var Constraint = function () {
	    function Constraint(left, right, gap, equality) {
	        if (equality === void 0) {
	            equality = false;
	        }
	        this.left = left;
	        this.right = right;
	        this.gap = gap;
	        this.equality = equality;
	        this.active = false;
	        this.unsatisfiable = false;
	        this.left = left;
	        this.right = right;
	        this.gap = gap;
	        this.equality = equality;
	    }
	    Constraint.prototype.slack = function () {
	        return this.unsatisfiable ? Number.MAX_VALUE : this.right.scale * this.right.position() - this.gap - this.left.scale * this.left.position();
	    };
	    return Constraint;
	}();
	vpsc.Constraint = Constraint;
	var Variable = function () {
	    function Variable(desiredPosition, weight, scale) {
	        if (weight === void 0) {
	            weight = 1;
	        }
	        if (scale === void 0) {
	            scale = 1;
	        }
	        this.desiredPosition = desiredPosition;
	        this.weight = weight;
	        this.scale = scale;
	        this.offset = 0;
	    }
	    Variable.prototype.dfdv = function () {
	        return 2.0 * this.weight * (this.position() - this.desiredPosition);
	    };
	    Variable.prototype.position = function () {
	        return (this.block.ps.scale * this.block.posn + this.offset) / this.scale;
	    };
	    // visit neighbours by active constraints within the same block
	    Variable.prototype.visitNeighbours = function (prev, f) {
	        var ff = function (c, next) {
	            return c.active && prev !== next && f(c, next);
	        };
	        this.cOut.forEach(function (c) {
	            return ff(c, c.right);
	        });
	        this.cIn.forEach(function (c) {
	            return ff(c, c.left);
	        });
	    };
	    return Variable;
	}();
	vpsc.Variable = Variable;
	var Block = function () {
	    function Block(v) {
	        this.vars = [];
	        v.offset = 0;
	        this.ps = new PositionStats(v.scale);
	        this.addVariable(v);
	    }
	    Block.prototype.addVariable = function (v) {
	        v.block = this;
	        this.vars.push(v);
	        this.ps.addVariable(v);
	        this.posn = this.ps.getPosn();
	    };
	    // move the block where it needs to be to minimize cost
	    Block.prototype.updateWeightedPosition = function () {
	        this.ps.AB = this.ps.AD = this.ps.A2 = 0;
	        for (var i = 0, n = this.vars.length; i < n; ++i) this.ps.addVariable(this.vars[i]);
	        this.posn = this.ps.getPosn();
	    };
	    Block.prototype.compute_lm = function (v, u, postAction) {
	        var _this = this;
	        var dfdv = v.dfdv();
	        v.visitNeighbours(u, function (c, next) {
	            var _dfdv = _this.compute_lm(next, v, postAction);
	            if (next === c.right) {
	                dfdv += _dfdv * c.left.scale;
	                c.lm = _dfdv;
	            } else {
	                dfdv += _dfdv * c.right.scale;
	                c.lm = -_dfdv;
	            }
	            postAction(c);
	        });
	        return dfdv / v.scale;
	    };
	    Block.prototype.populateSplitBlock = function (v, prev) {
	        var _this = this;
	        v.visitNeighbours(prev, function (c, next) {
	            next.offset = v.offset + (next === c.right ? c.gap : -c.gap);
	            _this.addVariable(next);
	            _this.populateSplitBlock(next, v);
	        });
	    };
	    // traverse the active constraint tree applying visit to each active constraint
	    Block.prototype.traverse = function (visit, acc, v, prev) {
	        var _this = this;
	        if (v === void 0) {
	            v = this.vars[0];
	        }
	        if (prev === void 0) {
	            prev = null;
	        }
	        v.visitNeighbours(prev, function (c, next) {
	            acc.push(visit(c));
	            _this.traverse(visit, acc, next, v);
	        });
	    };
	    // calculate lagrangian multipliers on constraints and
	    // find the active constraint in this block with the smallest lagrangian.
	    // if the lagrangian is negative, then the constraint is a split candidate.
	    Block.prototype.findMinLM = function () {
	        var m = null;
	        this.compute_lm(this.vars[0], null, function (c) {
	            if (!c.equality && (m === null || c.lm < m.lm)) m = c;
	        });
	        return m;
	    };
	    Block.prototype.findMinLMBetween = function (lv, rv) {
	        this.compute_lm(lv, null, function () {});
	        var m = null;
	        this.findPath(lv, null, rv, function (c, next) {
	            if (!c.equality && c.right === next && (m === null || c.lm < m.lm)) m = c;
	        });
	        return m;
	    };
	    Block.prototype.findPath = function (v, prev, to, visit) {
	        var _this = this;
	        var endFound = false;
	        v.visitNeighbours(prev, function (c, next) {
	            if (!endFound && (next === to || _this.findPath(next, v, to, visit))) {
	                endFound = true;
	                visit(c, next);
	            }
	        });
	        return endFound;
	    };
	    // Search active constraint tree from u to see if there is a directed path to v.
	    // Returns true if path is found.
	    Block.prototype.isActiveDirectedPathBetween = function (u, v) {
	        if (u === v) return true;
	        var i = u.cOut.length;
	        while (i--) {
	            var c = u.cOut[i];
	            if (c.active && this.isActiveDirectedPathBetween(c.right, v)) return true;
	        }
	        return false;
	    };
	    // split the block into two by deactivating the specified constraint
	    Block.split = function (c) {
	        /* DEBUG
	                    console.log("split on " + c);
	                    console.assert(c.active, "attempt to split on inactive constraint");
	        DEBUG */
	        c.active = false;
	        return [Block.createSplitBlock(c.left), Block.createSplitBlock(c.right)];
	    };
	    Block.createSplitBlock = function (startVar) {
	        var b = new Block(startVar);
	        b.populateSplitBlock(startVar, null);
	        return b;
	    };
	    // find a split point somewhere between the specified variables
	    Block.prototype.splitBetween = function (vl, vr) {
	        /* DEBUG
	                    console.assert(vl.block === this);
	                    console.assert(vr.block === this);
	        DEBUG */
	        var c = this.findMinLMBetween(vl, vr);
	        if (c !== null) {
	            var bs = Block.split(c);
	            return { constraint: c, lb: bs[0], rb: bs[1] };
	        }
	        // couldn't find a split point - for example the active path is all equality constraints
	        return null;
	    };
	    Block.prototype.mergeAcross = function (b, c, dist) {
	        c.active = true;
	        for (var i = 0, n = b.vars.length; i < n; ++i) {
	            var v = b.vars[i];
	            v.offset += dist;
	            this.addVariable(v);
	        }
	        this.posn = this.ps.getPosn();
	    };
	    Block.prototype.cost = function () {
	        var sum = 0,
	            i = this.vars.length;
	        while (i--) {
	            var v = this.vars[i],
	                d = v.position() - v.desiredPosition;
	            sum += d * d * v.weight;
	        }
	        return sum;
	    };
	    return Block;
	}();
	vpsc.Block = Block;
	var Blocks = function () {
	    function Blocks(vs) {
	        this.vs = vs;
	        var n = vs.length;
	        this.list = new Array(n);
	        while (n--) {
	            var b = new Block(vs[n]);
	            this.list[n] = b;
	            b.blockInd = n;
	        }
	    }
	    Blocks.prototype.cost = function () {
	        var sum = 0,
	            i = this.list.length;
	        while (i--) sum += this.list[i].cost();
	        return sum;
	    };
	    Blocks.prototype.insert = function (b) {
	        /* DEBUG
	                    console.assert(!this.contains(b), "blocks error: tried to reinsert block " + b.blockInd)
	        DEBUG */
	        b.blockInd = this.list.length;
	        this.list.push(b);
	        /* DEBUG
	                    console.log("insert block: " + b.blockInd);
	                    this.contains(b);
	        DEBUG */
	    };
	    Blocks.prototype.remove = function (b) {
	        /* DEBUG
	                    console.log("remove block: " + b.blockInd);
	                    console.assert(this.contains(b));
	        DEBUG */
	        var last = this.list.length - 1;
	        var swapBlock = this.list[last];
	        this.list.length = last;
	        if (b !== swapBlock) {
	            this.list[b.blockInd] = swapBlock;
	            swapBlock.blockInd = b.blockInd;
	        }
	    };
	    // merge the blocks on either side of the specified constraint, by copying the smaller block into the larger
	    // and deleting the smaller.
	    Blocks.prototype.merge = function (c) {
	        var l = c.left.block,
	            r = c.right.block;
	        /* DEBUG
	                    console.assert(l!==r, "attempt to merge within the same block");
	        DEBUG */
	        var dist = c.right.offset - c.left.offset - c.gap;
	        if (l.vars.length < r.vars.length) {
	            r.mergeAcross(l, c, dist);
	            this.remove(l);
	        } else {
	            l.mergeAcross(r, c, -dist);
	            this.remove(r);
	        }
	        /* DEBUG
	                    console.assert(Math.abs(c.slack()) < 1e-6, "Error: Constraint should be at equality after merge!");
	                    console.log("merged on " + c);
	        DEBUG */
	    };
	    Blocks.prototype.forEach = function (f) {
	        this.list.forEach(f);
	    };
	    // useful, for example, after variable desired positions change.
	    Blocks.prototype.updateBlockPositions = function () {
	        this.list.forEach(function (b) {
	            return b.updateWeightedPosition();
	        });
	    };
	    // split each block across its constraint with the minimum lagrangian
	    Blocks.prototype.split = function (inactive) {
	        var _this = this;
	        this.updateBlockPositions();
	        this.list.forEach(function (b) {
	            var v = b.findMinLM();
	            if (v !== null && v.lm < Solver.LAGRANGIAN_TOLERANCE) {
	                b = v.left.block;
	                Block.split(v).forEach(function (nb) {
	                    return _this.insert(nb);
	                });
	                _this.remove(b);
	                inactive.push(v);
	            }
	        });
	    };
	    return Blocks;
	}();
	vpsc.Blocks = Blocks;
	var Solver = function () {
	    function Solver(vs, cs) {
	        this.vs = vs;
	        this.cs = cs;
	        this.vs = vs;
	        vs.forEach(function (v) {
	            v.cIn = [], v.cOut = [];
	            /* DEBUG
	                            v.toString = () => "v" + vs.indexOf(v);
	            DEBUG */
	        });
	        this.cs = cs;
	        cs.forEach(function (c) {
	            c.left.cOut.push(c);
	            c.right.cIn.push(c);
	            /* DEBUG
	                            c.toString = () => c.left + "+" + c.gap + "<=" + c.right + " slack=" + c.slack() + " active=" + c.active;
	            DEBUG */
	        });
	        this.inactive = cs.map(function (c) {
	            c.active = false;return c;
	        });
	        this.bs = null;
	    }
	    Solver.prototype.cost = function () {
	        return this.bs.cost();
	    };
	    // set starting positions without changing desired positions.
	    // Note: it throws away any previous block structure.
	    Solver.prototype.setStartingPositions = function (ps) {
	        this.inactive = this.cs.map(function (c) {
	            c.active = false;return c;
	        });
	        this.bs = new Blocks(this.vs);
	        this.bs.forEach(function (b, i) {
	            return b.posn = ps[i];
	        });
	    };
	    Solver.prototype.setDesiredPositions = function (ps) {
	        this.vs.forEach(function (v, i) {
	            return v.desiredPosition = ps[i];
	        });
	    };
	    /* DEBUG
	            private getId(v: Variable): number {
	                return this.vs.indexOf(v);
	            }
	             // sanity check of the index integrity of the inactive list
	            checkInactive(): void {
	                var inactiveCount = 0;
	                this.cs.forEach(c=> {
	                    var i = this.inactive.indexOf(c);
	                    console.assert(!c.active && i >= 0 || c.active && i < 0, "constraint should be in the inactive list if it is not active: " + c);
	                    if (i >= 0) {
	                        inactiveCount++;
	                    } else {
	                        console.assert(c.active, "inactive constraint not found in inactive list: " + c);
	                    }
	                });
	                console.assert(inactiveCount === this.inactive.length, inactiveCount + " inactive constraints found, " + this.inactive.length + "in inactive list");
	            }
	            // after every call to satisfy the following should check should pass
	            checkSatisfied(): void {
	                this.cs.forEach(c=>console.assert(c.slack() >= vpsc.Solver.ZERO_UPPERBOUND, "Error: Unsatisfied constraint! "+c));
	            }
	    DEBUG */
	    Solver.prototype.mostViolated = function () {
	        var minSlack = Number.MAX_VALUE,
	            v = null,
	            l = this.inactive,
	            n = l.length,
	            deletePoint = n;
	        for (var i = 0; i < n; ++i) {
	            var c = l[i];
	            if (c.unsatisfiable) continue;
	            var slack = c.slack();
	            if (c.equality || slack < minSlack) {
	                minSlack = slack;
	                v = c;
	                deletePoint = i;
	                if (c.equality) break;
	            }
	        }
	        if (deletePoint !== n && (minSlack < Solver.ZERO_UPPERBOUND && !v.active || v.equality)) {
	            l[deletePoint] = l[n - 1];
	            l.length = n - 1;
	        }
	        return v;
	    };
	    // satisfy constraints by building block structure over violated constraints
	    // and moving the blocks to their desired positions
	    Solver.prototype.satisfy = function () {
	        if (this.bs == null) {
	            this.bs = new Blocks(this.vs);
	        }
	        /* DEBUG
	                    console.log("satisfy: " + this.bs);
	        DEBUG */
	        this.bs.split(this.inactive);
	        var v = null;
	        while ((v = this.mostViolated()) && (v.equality || v.slack() < Solver.ZERO_UPPERBOUND && !v.active)) {
	            var lb = v.left.block,
	                rb = v.right.block;
	            /* DEBUG
	                            console.log("most violated is: " + v);
	                            this.bs.contains(lb);
	                            this.bs.contains(rb);
	            DEBUG */
	            if (lb !== rb) {
	                this.bs.merge(v);
	            } else {
	                if (lb.isActiveDirectedPathBetween(v.right, v.left)) {
	                    // cycle found!
	                    v.unsatisfiable = true;
	                    continue;
	                }
	                // constraint is within block, need to split first
	                var split = lb.splitBetween(v.left, v.right);
	                if (split !== null) {
	                    this.bs.insert(split.lb);
	                    this.bs.insert(split.rb);
	                    this.bs.remove(lb);
	                    this.inactive.push(split.constraint);
	                } else {
	                    /* DEBUG
	                                            console.log("unsatisfiable constraint found");
	                    DEBUG */
	                    v.unsatisfiable = true;
	                    continue;
	                }
	                if (v.slack() >= 0) {
	                    /* DEBUG
	                                            console.log("violated constraint indirectly satisfied: " + v);
	                    DEBUG */
	                    // v was satisfied by the above split!
	                    this.inactive.push(v);
	                } else {
	                    /* DEBUG
	                                            console.log("merge after split:");
	                    DEBUG */
	                    this.bs.merge(v);
	                }
	            }
	        }
	        /* DEBUG
	                    this.checkSatisfied();
	        DEBUG */
	    };
	    // repeatedly build and split block structure until we converge to an optimal solution
	    Solver.prototype.solve = function () {
	        this.satisfy();
	        var lastcost = Number.MAX_VALUE,
	            cost = this.bs.cost();
	        while (Math.abs(lastcost - cost) > 0.0001) {
	            this.satisfy();
	            lastcost = cost;
	            cost = this.bs.cost();
	        }
	        return cost;
	    };
	    Solver.LAGRANGIAN_TOLERANCE = -1e-4;
	    Solver.ZERO_UPPERBOUND = -1e-10;
	    return Solver;
	}();
	vpsc.Solver = Solver;

	module.exports = vpsc;

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var NodeGroup = __webpack_require__(15);
	var Spring = __webpack_require__(11);
	var helper = __webpack_require__(2);

	var DEFAULT_OPTIONS = {
	  damping: 0.1,
	  epsilon: 0.003,
	  timestep: 1,
	  nodeSpacing: 3,
	  minPos: 0,
	  maxPos: null,
	  pullForce: new Spring(1),
	  roundsPerTick: 100
	};

	var Simulator = function (options) {
	  var simulator = {};
	  var nodes = [];
	  var dispatch = helper.dispatch('start', 'tick', 'end');

	  var isRunning = false;
	  var maxRound = 0;

	  options = helper.extend({}, DEFAULT_OPTIONS, options);

	  simulator.nodes = function (x) {
	    if (!arguments.length) return nodes;
	    nodes = x;
	    return simulator;
	  };

	  simulator.options = function (x) {
	    if (!arguments.length) return options;
	    options = helper.extend(options, x);
	    return simulator;
	  };

	  simulator.pushRightToIdealPositions = function () {
	    // quickly move nodes to ideal position if possible
	    // iterate from right to left
	    for (var i = nodes.length - 1; i >= 0; i--) {
	      var node = nodes[i];
	      if (node.currentPos < node.idealPos) {
	        var nextNode = i === nodes.length - 1 ? null : nodes[i + 1];

	        // if there is enough gap for it to move to its ideal position immediately
	        if (!nextNode || node.idealRight() < nextNode.currentLeft()) {
	          node.moveToIdealPosition();
	        }
	        // otherwise
	        else {
	            // push node next to the node on its right, if that is closer to ideal position
	            var newPos = node.positionBefore(nextNode, options.nodeSpacing);
	            if (Math.abs(node.idealPos - newPos) < Math.abs(node.displacement())) {
	              node.currentPos = newPos;
	            }
	          }
	      }
	    }

	    return simulator;
	  };

	  simulator.pushLeftToIdealPositions = function () {
	    // quickly move nodes to ideal position if possible
	    // iterate from left to right
	    for (var i = 0; i < nodes.length; i++) {
	      var node = nodes[i];
	      if (node.currentPos > node.idealPos) {
	        var prevNode = i === 0 ? null : nodes[i - 1];

	        // if there is enough gap for it to move to its ideal position immediately
	        if (!prevNode || node.idealLeft() > prevNode.currentRight()) {
	          node.moveToIdealPosition();
	        }
	        // otherwise
	        else {
	            // move node next to the node on its left, if that is closer to ideal position
	            var newPos = node.positionAfter(prevNode, options.nodeSpacing);
	            if (Math.abs(node.idealPos - newPos) < Math.abs(node.displacement())) {
	              node.currentPos = newPos;
	            }
	          }
	      }
	    }

	    return simulator;
	  };

	  simulator.pushToIdealPositions = function (reverse) {
	    return reverse ? simulator.pushRightToIdealPositions().pushLeftToIdealPositions() : simulator.pushLeftToIdealPositions().pushRightToIdealPositions();
	  };

	  simulator.initialize = function () {
	    if (isRunning) {
	      throw 'This function cannot be called while the simulator is running. Stop it first.';
	    }

	    // For nodes with stub, set ideal position to stub's current position
	    nodes.filter(function (node) {
	      return !!node.parent;
	    }).forEach(function (node) {
	      node.idealPos = node.parent.currentPos;
	    });

	    nodes.sort(function (a, b) {
	      return a.idealPos - b.idealPos;
	    }).forEach(function (node, index) {
	      // align nodes to the left by default
	      node.currentPos = index === 0 ? node.halfWidth() : node.positionAfter(nodes[index - 1], options.nodeSpacing);
	      node.previousPos = node.currentPos;
	    });

	    return simulator;
	  };

	  function isBumping(a, b) {
	    return a.isBumping(b, options.nodeSpacing);
	  }

	  simulator.step = function () {
	    // Reset force to pure pull force
	    nodes.forEach(function (node) {
	      node.force = options.pullForce.computeForce(node.displacement());
	    });

	    var groups = NodeGroup.groupAdjacentNodes(nodes, isBumping);

	    // Compute force for each group
	    groups.forEach(function (group) {
	      group.force = group.totalForce();

	      // If moving left and minPos is set
	      if (group.force < 0 && helper.isDefined(options.minPos)) {
	        var distanceFromBoundary = group.nodes[0].currentLeft() - options.minPos;
	        if (distanceFromBoundary === 0) {
	          group.force = 0;
	        } else if (distanceFromBoundary < 0) {
	          group.force = options.pullForce.computeForce(-distanceFromBoundary);
	        }
	      }
	    });

	    // Merge adjacent groups if possible
	    while (groups.length > 1) {
	      var mg = NodeGroup.mergeAdjacentGroups(groups, isBumping);
	      // If the groups were not changed, stop
	      if (mg.length === groups.length) break;
	      // Otherwise, continue merging
	      groups = mg;
	    }

	    // Then reassign each group's total force back to the nodes within
	    groups.forEach(function (group) {
	      group.assignForceToChildren();
	    });

	    // Add repulsion
	    // for(var i=1;i<nodes.length;i++){
	    //   var node1 = nodes[i-1];
	    //   var node2 = nodes[i];

	    //   var distance = node1.distanceFrom(node2);
	    //   // no repulsion is necessary if enough space already
	    //   if(distance <= options.nodeSpacing){
	    //     var diff = options.nodeSpacing - distance;
	    //     var repulsion = (diff/(options.timestep * options.timestep))/2;
	    //     node1.force += -repulsion;
	    //     node2.force += repulsion;
	    //   }
	    // }

	    // Move nodes
	    for (var index = nodes.length - 1; index >= 0; index--) {
	      var node = nodes[index];

	      var newPos = node.currentPos + node.force * options.damping * options.timestep * options.timestep;

	      // Boundary constraint: minPos and maxPos (if set)
	      if (helper.isDefined(options.minPos)) newPos = Math.max(options.minPos + node.halfWidth(), newPos);
	      if (helper.isDefined(options.maxPos)) newPos = Math.min(options.maxPos - node.halfWidth(), newPos);

	      // Rigid body constraint: Do not penetrate + a bit of gap
	      if (index > 0) {
	        var prevNode = nodes[index - 1];
	        newPos = Math.max(node.positionAfter(prevNode, options.nodeSpacing - 1), newPos);
	      }
	      if (index < nodes.length - 1) {
	        var nextNode = nodes[index + 1];
	        newPos = Math.min(node.positionBefore(nextNode, options.nodeSpacing - 1), newPos);
	      }

	      // Set new position and update velocity from real movement
	      node.previousPos = node.currentPos;
	      node.currentPos = newPos;
	    }

	    return simulator;
	  };

	  simulator.start = function (maxRound) {
	    if (isRunning) {
	      throw 'This function cannot be called while the simulator is running. Stop it first.';
	    }
	    return simulator.initialize().resume(maxRound);
	  };

	  simulator.increaseMaxRound = function (additionalRound) {
	    if (additionalRound) {
	      // If round is set, add to maximum round
	      maxRound += additionalRound;
	    } else {
	      // Otherwise, clear maximum round
	      // (Allow it to run indefinitely until it is stable.)
	      maxRound = 0;
	    }
	  };

	  simulator.resume = function (additionalRound) {
	    simulator.increaseMaxRound(additionalRound);

	    // If not already running
	    if (!isRunning) {
	      isRunning = true;
	      dispatch.start({ type: 'start' });

	      var round = 0;

	      var step = function () {
	        if (!isRunning) {
	          return 'stopped';
	        } else if (round > 0 && simulator.isStable()) {
	          return 'simulation stable, energy: ' + simulator.energy();
	        } else if (maxRound && round >= maxRound) {
	          return 'maximum number of rounds reached: ' + maxRound;
	        } else {
	          simulator.step();
	          round++;
	          return false;
	        }
	      };

	      var tick = function () {
	        for (var i = 0; i < options.roundsPerTick; i++) {
	          var done = step();
	          if (done) {
	            dispatch.end({
	              type: 'end',
	              round: round,
	              maxRound: maxRound,
	              reason: done
	            });
	            isRunning = false;
	            maxRound = 0;
	            return;
	          }
	        }
	        dispatch.tick({
	          type: 'tick',
	          round: round,
	          maxRound: maxRound
	        });

	        setTimeout(tick, 0);
	      };

	      tick();
	    }

	    return simulator;
	  };

	  simulator.stop = function () {
	    isRunning = false;
	    return simulator;
	  };

	  simulator.energy = function () {
	    return helper.sum(nodes, function (d) {
	      return d.kineticEnergy();
	    });
	  };

	  simulator.isStable = function () {
	    return simulator.energy() < options.epsilon;
	  };

	  // alias
	  simulator.reset = simulator.initialize;

	  helper.rebind(simulator, dispatch, 'on');

	  return simulator;
	};

	Simulator.DEFAULT_OPTIONS = DEFAULT_OPTIONS;

	module.exports = Simulator;

/***/ },
/* 15 */
/***/ function(module, exports) {

	var NodeGroup = function (nodes) {
	  this.nodes = nodes || [];
	  this.force = 0;
	};

	var proto = NodeGroup.prototype;

	proto.push = function (node) {
	  this.nodes.push(node);
	  return this;
	};

	proto.merge = function (another) {
	  var group = new NodeGroup(this.nodes.concat(another.nodes));
	  group.force = this.force + another.force;
	  return group;
	};

	proto.overlapWithGroup = function (group, buffer) {
	  return this.nodes.length > 0 && group.nodes.length > 0 && this.nodes[this.nodes.length - 1].overlapWithNode(group.nodes[0], buffer);
	};

	proto.totalForce = function () {
	  return this.nodes.map(function (node) {
	    return node.force;
	  }).reduce(function (prev, current) {
	    return prev + current;
	  }, 0);
	};

	proto.assignForceToChildren = function () {
	  var self = this;
	  this.nodes.forEach(function (node) {
	    node.force = self.force;
	  });
	};

	/**
	 * Check if two adjacent objects are running into each other
	 * Either a hits b or b hits a.
	 * The only false case is when both are running away from each other.
	 * Object#1's position must be before Object#2
	 * @param  Number f1 Object#1's force
	 * @param  Number f2 Object#2's force
	 * @return Boolean true if both object are running into each other
	 */
	proto.isBumping = function (b, buffer) {
	  var f1 = this.force || 0;
	  var f2 = b.force || 0;
	  /* jshint ignore:start */
	  return this.overlapWithGroup(b, buffer) && (f1 * f2 > 0 || f1 === 0 && f2 < 0 || f1 > 0 && f2 === 0 || f1 > 0 && f2 < 0);
	  /* jshint ignore:end */
	};

	NodeGroup.groupAdjacentNodes = function (nodes, conditionFn) {
	  if (nodes && nodes.length > 0) {
	    var currentGroup = new NodeGroup([nodes[0]]);
	    var groups = [currentGroup];

	    for (var i = 1; i < nodes.length; i++) {
	      var node = nodes[i];
	      var prevNode = nodes[i - 1];

	      if (conditionFn(prevNode, node)) {
	        // add to the same group
	        currentGroup.push(node);
	      } else {
	        // otherwise, create a new group
	        currentGroup = new NodeGroup([node]);
	        groups.push(currentGroup);
	      }
	    }
	    return groups;
	  }

	  return [];
	};

	NodeGroup.mergeAdjacentGroups = function (groups, conditionFn) {
	  if (groups && groups.length > 0) {
	    var mergedGroups = [];
	    var currentGroup = groups[0];

	    for (var i = 1; i < groups.length; i++) {
	      var group = groups[i];
	      var prevGroup = groups[i - 1];

	      if (conditionFn(prevGroup, group)) {
	        // add to the same group
	        currentGroup = currentGroup.merge(group);
	      } else {
	        // otherwise, create a new group
	        mergedGroups.push(currentGroup);
	        currentGroup = group;
	      }
	    }
	    mergedGroups.push(currentGroup);

	    return mergedGroups;
	  }
	  return groups;
	};

	// return module
	module.exports = NodeGroup;

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var helper = __webpack_require__(2);

	function Renderer(options) {
	  this.options = helper.extend({
	    layerGap: 60,
	    nodeHeight: 10,
	    direction: 'down'
	  }, options);
	}

	function lineTo(point) {
	  return 'L ' + point.join(' ');
	}

	function moveTo(point) {
	  return 'M ' + point.join(' ');
	}

	function curveTo(c1, c2, point2) {
	  return 'C ' + c1.join(' ') + ' ' + c2.join(' ') + ' ' + point2.join(' ');
	}

	function vCurveBetween(point1, point2) {
	  var midY = (point1[1] + point2[1]) / 2;
	  return curveTo([point1[0], midY], [point2[0], midY], point2);
	}

	function hCurveBetween(point1, point2) {
	  var midX = (point1[0] + point2[0]) / 2;
	  return curveTo([midX, point1[1]], [midX, point2[1]], point2);
	}

	Renderer.prototype.getWaypoints = function (node) {
	  var options = this.options;
	  var direction = options.direction;

	  var hops = node.getPathFromRoot();
	  var gap = options.nodeHeight + options.layerGap;

	  if (direction === 'left') {
	    return [[[0, hops[0].idealPos]]].concat(hops.map(function (hop, level) {
	      var xPos = gap * (level + 1) * -1;
	      return [[xPos + options.nodeHeight, hop.currentPos], [xPos, hop.currentPos]];
	    }));
	  }
	  if (direction === 'right') {
	    return [[[0, hops[0].idealPos]]].concat(hops.map(function (hop, level) {
	      var xPos = gap * (level + 1);
	      return [[xPos - options.nodeHeight, hop.currentPos], [xPos, hop.currentPos]];
	    }));
	  } else if (direction === 'up') {
	    return [[[hops[0].idealPos, 0]]].concat(hops.map(function (hop, level) {
	      var yPos = gap * (level + 1) * -1;
	      return [[hop.currentPos, yPos + options.nodeHeight], [hop.currentPos, yPos]];
	    }));
	  } else {
	    return [[[hops[0].idealPos, 0]]].concat(hops.map(function (hop, level) {
	      var yPos = gap * (level + 1);
	      return [[hop.currentPos, yPos - options.nodeHeight], [hop.currentPos, yPos]];
	    }));
	  }
	};

	Renderer.prototype.layout = function (nodes) {
	  var options = this.options;

	  var gap = options.layerGap + options.nodeHeight;

	  switch (options.direction) {
	    case 'left':
	      nodes.forEach(function (node) {
	        var pos = node.getLevel() * gap + options.layerGap;
	        node.x = -pos - options.nodeHeight;
	        node.y = node.currentPos;
	        node.dx = options.nodeHeight;
	        node.dy = node.width;
	      });
	      break;
	    case 'right':
	      nodes.forEach(function (node) {
	        var pos = node.getLevel() * gap + options.layerGap;
	        node.x = pos;
	        node.y = node.currentPos;
	        node.dx = options.nodeHeight;
	        node.dy = node.width;
	      });
	      break;
	    case 'up':
	      nodes.forEach(function (node) {
	        var pos = node.getLevel() * gap + options.layerGap;
	        node.x = node.currentPos;
	        node.y = -pos - options.nodeHeight;
	        node.dx = node.width;
	        node.dy = options.nodeHeight;
	      });
	      break;
	    default:
	    case 'down':
	      nodes.forEach(function (node) {
	        var pos = node.getLevel() * gap + options.layerGap;
	        node.x = node.currentPos;
	        node.y = pos;
	        node.dx = node.width;
	        node.dy = options.nodeHeight;
	      });
	      break;
	  }

	  return nodes;
	};

	Renderer.prototype.generatePath = function (node) {
	  var options = this.options;
	  var direction = options.direction;

	  var waypoints = this.getWaypoints(node, direction);

	  var steps = [moveTo(waypoints[0][0])];

	  if (direction === 'left' || direction === 'right') {
	    waypoints.reduce(function (prev, current, level) {
	      steps.push(hCurveBetween(prev[prev.length - 1], current[0]));
	      if (level < waypoints.length - 1) {
	        steps.push(lineTo(current[1]));
	      }
	      return current;
	    });
	  } else {
	    waypoints.reduce(function (prev, current, level) {
	      steps.push(vCurveBetween(prev[prev.length - 1], current[0]));
	      if (level < waypoints.length - 1) {
	        steps.push(lineTo(current[1]));
	      }
	      return current;
	    });
	  }

	  return steps.join(' ');
	};

	// return module
	module.exports = Renderer;

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var Node = __webpack_require__(1);
	var helper = __webpack_require__(2);

	module.exports = function () {
	  var util = {};

	  var OPTIONS = {
	    minWidth: 20,
	    maxWidth: 20,
	    minPos: 0,
	    maxPos: 800
	  };

	  util.generateNodes = function (amount, options) {
	    var nodes = [];
	    options = helper.extend({}, OPTIONS, options);
	    var diffPos = options.maxPos - options.minPos;
	    var diffWidth = options.maxWidth - options.minWidth;
	    for (var i = 0; i < amount; i++) {
	      nodes.push(new Node(Math.floor(Math.random() * diffPos) + options.minPos, Math.floor(Math.random() * diffWidth) + options.minWidth));
	    }
	    return nodes;
	  };

	  util.convertNodesToGraph = function (nodes) {
	    yGap = 60;
	    var graph = {
	      nodes: [],
	      links: [],
	      constraints: []
	    };

	    var alignmentConstraint1 = {
	      type: 'alignment',
	      axis: 'y',
	      offsets: []
	    };

	    var alignmentConstraint2 = {
	      type: 'alignment',
	      axis: 'y',
	      offsets: []
	    };

	    // graph.constraints.push(alignmentConstraint1);
	    graph.constraints.push(alignmentConstraint2);

	    // minPos
	    graph.nodes.push({
	      index: 0,
	      x: 1,
	      y: yGap,
	      width: 1,
	      height: 1,
	      fixed: true
	    });

	    // maxPos
	    graph.nodes.push({
	      index: 0,
	      x: 900 + 25,
	      y: yGap,
	      width: 1,
	      height: 1,
	      fixed: true
	    });

	    nodes.forEach(function (node) {
	      var node1 = {
	        index: graph.nodes.length,
	        x: node.idealPos,
	        y: 0,
	        width: 1,
	        height: 1,
	        fixed: true
	      };

	      // alignmentConstraint1.offsets.push({
	      //   node: node1.index,
	      //   offset: 0
	      // });
	      graph.nodes.push(node1);

	      var node2 = {
	        index: graph.nodes.length,
	        x: node.currentPos,
	        y: yGap,
	        width: node.width,
	        height: 12,
	        originalNode: node
	      };

	      alignmentConstraint2.offsets.push({
	        node: node2.index,
	        offset: 0
	      });
	      graph.nodes.push(node2);

	      graph.links.push({
	        source: node1.index,
	        target: node2.index
	      });

	      graph.constraints.push({
	        axis: 'y',
	        left: node1.index,
	        right: node2.index,
	        gap: yGap,
	        equality: true
	      });

	      // min pos constraint
	      graph.constraints.push({
	        axis: 'x',
	        left: 0,
	        right: node2.index,
	        gap: 0
	      });

	      // max pos constraint
	      graph.constraints.push({
	        axis: 'x',
	        left: node2.index,
	        right: 1,
	        gap: 0
	      });
	    });

	    return graph;
	  };

	  util.updateNodesInGraph = function (group) {
	    return graph.nodes.filter(function (d) {
	      return d.originalNode;
	    }).map(function (d) {
	      d.originalNode.currentPos = d.x;
	      return d.originalNode;
	    });
	  };

	  return util;
	}();

/***/ }
/******/ ])
});
;