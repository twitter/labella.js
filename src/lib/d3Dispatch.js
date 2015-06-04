define([

],
function(){
//---------------------------------------------------
// BEGIN code for this module
//---------------------------------------------------

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
  if (object instanceof d3_Map)
    object.forEach(function (key, value) {
      map.set(key, value);
    });
  else
    for (var key in object)
      map.set(key, object[key]);
  return map;
};
function d3_Map() {
}
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
    for (var key in this)
      if (key.charCodeAt(0) === d3_map_prefixCode)
        f.call(this, key.substring(1), this[key]);
  }
});
var d3_map_prefix = '\0', d3_map_prefixCode = d3_map_prefix.charCodeAt(0);
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
  for (var key in this)
    if (key.charCodeAt(0) === d3_map_prefixCode)
      ++size;
  return size;
}
function d3_map_empty() {
  for (var key in this)
    if (key.charCodeAt(0) === d3_map_prefixCode)
      return false;
  return true;
}
d3.dispatch = function () {
  var dispatch = new d3_dispatch(), i = -1, n = arguments.length;
  while (++i < n)
    dispatch[arguments[i]] = d3_dispatch_event(dispatch);
  return dispatch;
};
function d3_dispatch() {
}
d3_dispatch.prototype.on = function (type, listener) {
  var i = type.indexOf('.'), name = '';
  if (i >= 0) {
    name = type.substring(i + 1);
    type = type.substring(0, i);
  }
  if (type)
    return arguments.length < 2 ? this[type].on(name) : this[type].on(name, listener);
  if (arguments.length === 2) {
    if (listener == null)
      for (type in this) {
        if (this.hasOwnProperty(type))
          this[type].on(name, null);
      }
    return this;
  }
};
function d3_dispatch_event(dispatch) {
  var listeners = [], listenerByName = new d3_Map();
  function event() {
    var z = listeners, i = -1, n = z.length, l;
    while (++i < n)
      if (l = z[i].on)
        l.apply(this, arguments);
    return dispatch;
  }
  event.on = function (name, listener) {
    var l = listenerByName.get(name), i;
    if (arguments.length < 2)
      return l && l.on;
    if (l) {
      l.on = null;
      listeners = listeners.slice(0, i = listeners.indexOf(l)).concat(listeners.slice(i + 1));
      listenerByName.remove(name);
    }
    if (listener)
      listeners.push(listenerByName.set(name, { on: listener }));
    return dispatch;
  };
  return event;
}

return d3.dispatch;

//---------------------------------------------------
// END code for this module
//---------------------------------------------------
});