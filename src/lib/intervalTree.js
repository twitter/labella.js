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

var SortedList = require('./sortedList.js');

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

  this.startKey     = options.startKey || 0; // start key
  this.endKey       = options.endKey   || 1; // end key
  this.intervalHash = {};                    // id => interval object
  this.pointTree = new SortedList({          // b-tree of start, end points
    compare: function(a, b) {
      if (a == null) return -1;
      if (b == null) return  1;
      var c = a[0]- b[0];
      return (c > 0) ? 1 : (c == 0)  ? 0 : -1;
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
IntervalTree.prototype.add = function(data, id) {
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
  this.pointTree.insert([itvl.end,   id]);
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
IntervalTree.prototype.search = function(val1, val2) {
  var ret = [];
  if (typeof val1 != 'number') {
    throw new Error(val1 + ': invalid input');
  }

  if (val2 == undefined) {
    _pointSearch.call(this, this.root, val1, ret);
  }
  else if (typeof val2 == 'number') {
    _rangeSearch.call(this, val1, val2, ret);
  }
  else {
    throw new Error(val1 + ',' + val2 + ': invalid input');
  }
  return ret;
};


/**
 * remove:
 **/
IntervalTree.prototype.remove = function(interval_id) {
};



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
    node.starts.every(function(itvl) {
      var bool = (itvl.start <= idx);
      if (bool) arr.push(itvl.result());
      return bool;
    });
    return _pointSearch.call(this, node.left, idx, arr);
  }

  else if (idx > node.idx) {
    node.ends.every(function(itvl) {
      var bool = (itvl.end >= idx);
      if (bool) arr.push(itvl.result());
      return bool;
    });
    return _pointSearch.call(this, node.right, idx, arr);
  }
  // exact equal
  else {
    node.starts.map(function(itvl) { arr.push(itvl.result()); });
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
  _pointSearch.call(this, this.root, (start + end) >> 1, wholeWraps, true);

  wholeWraps.forEach(function(result) {
    resultHash[result.id] = true;
  });


  var idx1 = this.pointTree.bsearch([start, null]);
  var pointTreeArray = this.pointTree;
  while (idx1 >= 0 && pointTreeArray[idx1][0] == start) {
    idx1--;
  }

  var idx2 = this.pointTree.bsearch([end,   null]);
  if (idx2 >= 0)
  {
    var len = pointTreeArray.length -1;
    while (idx2 <= len && pointTreeArray[idx2][0] <= end) {
      idx2++;
    }

    pointTreeArray.slice(idx1 + 1, idx2).forEach(function(point) {
      var id = point[1];
      resultHash[id] = true;
    }, this);

    Object.keys(resultHash).forEach(function(id) {
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
    compare: function(a, b) {
      if (a == null) return -1;
      if (b == null) return  1;
      var c = a.start - b.start;
      return (c > 0) ? 1 : (c == 0)  ? 0 : -1;
    }
  });

  this.ends = new SortedList({
    compare: function(a, b) {
      if (a == null) return -1;
      if (b == null) return  1;
      var c = a.end - b.end;
      return (c < 0) ? 1 : (c == 0)  ? 0 : -1;
    }
  });
}

/**
 * insert an Interval object to this node
 **/
Node.prototype.insert = function(interval) {
  this.starts.insert(interval);
  this.ends.insert(interval);
};



/**
 * Interval : prototype of interval info
 **/
function Interval(data, id, s, e) {
  this.id     = id;
  this.start  = data[s];
  this.end    = data[e];
  this.data   = data;

  if (typeof this.start != 'number' || typeof this.end != 'number') {
    throw new Error('start, end must be number. start: ' + this.start + ', end: ' + this.end);
  }

  if ( this.start >= this.end) {
    throw new Error('start must be smaller than end. start: ' + this.start + ', end: ' + this.end);
  }
}

/**
 * get result object
 **/
Interval.prototype.result = function(start, end) {
  var ret = {
    id   : this.id,
    data : this.data
  };
  if (typeof start == 'number' && typeof end == 'number') {
    /**
     * calc overlapping rate
     **/
    var left  = Math.max(this.start, start);
    var right = Math.min(this.end,   end);
    var lapLn = right - left;
    ret.rate1 = lapLn / (end - start);
    ret.rate2 = lapLn / (this.end - this.start);
  }
  return ret;
};

module.exports = IntervalTree;