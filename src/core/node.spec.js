'use strict';

var Node = require('./node.js');

describe('Node', function(){
  describe('#distanceFrom(node)', function(){
    var n1 = new Node(10, 10);
    it('should return positive distance when two nodes do not overlap', function(){
      var n2 = new Node(30, 10);
      expect(n1.distanceFrom(n2)).toEqual(10);
    });
    it('should return zero distance when two nodes touch', function(){
      var n2 = new Node(20, 10);
      expect(n1.distanceFrom(n2)).toEqual(0);
    });
    it('should return negative distance when two nodes overlap', function(){
      var n2 = new Node(10, 10);
      expect(n1.distanceFrom(n2)).toEqual(-10);
    });
  });

  describe('#moveToIdealPosition()', function(){
    it('should change the current position to ideal position', function(){
      var n = new Node(10,10);
      n.currentPos = 20;
      expect(n.currentPos).not.toEqual(n.idealPos);
      n.moveToIdealPosition();
      expect(n.currentPos).toEqual(n.idealPos);
    });
  });

  describe('#displacement()', function(){
    it('should return correct distance from ideal position', function(){
      var n1 = new Node(10, 10);
      expect(n1.displacement()).toEqual(0);
      n1.currentPos = 20;
      expect(n1.displacement()).toEqual(-10);
      n1.currentPos = 0;
      expect(n1.displacement()).toEqual(10);
    });
  });

  describe('#overlapWithNode(node[, buffer])', function(){
    var n1 = new Node(10, 10);
    var n2 = new Node(19, 10);
    var n3 = new Node(20, 10);
    var n4 = new Node(21, 10);
    var n5 = new Node(22, 10);

    it('should return true only if this node overlap with the specified node', function(){
      expect(n1.overlapWithNode(n2)).toBe(true);
      expect(n1.overlapWithNode(n3)).toBe(false);
      expect(n1.overlapWithNode(n4)).toBe(false);
    });
    it('should return true only if this node overlap with the specified node within buffer range', function(){
      expect(n1.overlapWithNode(n2,2)).toBe(true);
      expect(n1.overlapWithNode(n3,2)).toBe(true);
      expect(n1.overlapWithNode(n4,2)).toBe(true);
      expect(n1.overlapWithNode(n5,2)).toBe(false);
    });
  });

  describe('overlapWithPoint(pos)', function(){
    var n1 = new Node(10, 10);
    it('should return true if the position is within this node', function(){
      expect(n1.overlapWithPoint(4)).toBe(false);
      expect(n1.overlapWithPoint(5)).toBe(true);
      expect(n1.overlapWithPoint(10)).toBe(true);
      expect(n1.overlapWithPoint(15)).toBe(true);
      expect(n1.overlapWithPoint(16)).toBe(false);
    });
  });

  describe('#positionBefore(node[, buffer])', function(){
    var n1 = new Node(10, 10);
    var n2 = new Node(19, 10);
    it('should return position to place node before the specified node', function(){
      expect(n1.positionBefore(n2)).toEqual(9);
      expect(n1.positionBefore(n2, 2)).toEqual(7);
    });
  });

  describe('#positionAfter(node[, buffer])', function(){
    var n1 = new Node(10, 10);
    var n2 = new Node(19, 10);
    it('should return position to place node after the specified node', function(){
      expect(n1.positionAfter(n2)).toEqual(29);
      expect(n1.positionAfter(n2, 2)).toEqual(31);
    });
  });

  describe('#currentRight()', function(){
    var n1 = new Node(10, 10);
    n1.currentPos = 20;
    it('should return right edge of this node', function(){
      expect(n1.currentRight()).toEqual(25);
    });
  });

  describe('#currentLeft()', function(){
    var n1 = new Node(10, 10);
    n1.currentPos = 20;
    it('should return left edge of this node', function(){
      expect(n1.currentLeft()).toEqual(15);
    });
  });

  describe('#idealRight()', function(){
    var n1 = new Node(10, 10);
    it('should return ideal right edge of this node', function(){
      expect(n1.idealRight()).toEqual(15);
    });
  });

  describe('#idealLeft()', function(){
    var n1 = new Node(10, 10);
    it('should return ideal left edge of this node', function(){
      expect(n1.idealLeft()).toEqual(5);
    });
  });

  describe('#createStub(width)', function(){
    var n1 = new Node(10, 10);
    var stub = n1.createStub(5);
    it('should create stub and return stub with the specified width.', function(){
      expect(stub).toBeDefined();
      expect(stub.width).toEqual(5);
    });
    it('should have the same idealPos and data', function(){
      expect(n1.idealPos).toEqual(stub.idealPos);
      expect(n1.data).toEqual(stub.data);
    });
  });

  describe('#removeStub()', function(){
    var n1 = new Node(10, 10);
    var stub = n1.createStub(5);
    n1.removeStub();
    it('should remove stub (parent)', function(){
      expect(n1.parent).toBeNull();
    });
    it('should remove this node (child) from stub', function(){
      expect(stub.child).toBeNull();
    });
  });

  describe('#isStub()', function(){
    var n1 = new Node(10, 10);
    var stub = n1.createStub(5);
    it('should return true if this node is stub', function(){
      expect(n1.isStub()).toBe(false);
      expect(stub.isStub()).toBe(true);
    });
  });

  describe('#getPathToRoot()', function(){
    var n1 = new Node(10, 10);
    it('should return path from this node up until there is no parent', function(){
      expect(n1.getPathToRoot()).toEqual([n1]);
      var n2 = n1.createStub(5);
      var n3 = n2.createStub(5);
      expect(n1.getPathToRoot()).toEqual([n1,n2,n3]);
    });
  });

  describe('#getPathFromRoot()', function(){
    var n1 = new Node(10, 10);
    it('should return path from the topmost stub down to this node', function(){
      expect(n1.getPathFromRoot()).toEqual([n1]);
      var n2 = n1.createStub(5);
      var n3 = n2.createStub(5);
      expect(n1.getPathFromRoot()).toEqual([n3,n2,n1]);
    });
  });

  describe('#getPathToRootLength', function(){
    it('should return sum of displacements from all levels', function(){
      var n4 = new Node(854, 50);
      n4.currentPos = 800;
      var stub4 = n4.createStub();
      stub4.currentPos = 700;
      expect(n4.getPathToRootLength()).toEqual(254);
    });
  });

  describe('#getRoot()', function(){
    it('should return the topmost stub of this node', function(){
      var n1 = new Node(10, 10);
      expect(n1.getRoot()).toEqual(n1);
      var n2 = n1.createStub(5);
      expect(n1.getRoot()).toEqual(n2);
      var n3 = n2.createStub(5);
      expect(n1.getRoot()).toEqual(n3);
    });
  });

  describe('#getLayerIndex()', function(){
    it('should return layer index', function(){
      var n1 = new Node(10, 10);
      expect(n1.getLayerIndex()).toEqual(0);
      n1.layerIndex = 10;
      expect(n1.getLayerIndex()).toEqual(10);
    });
  });

  describe('#clone()', function(){
    it('should copy the node with important fields', function(){
      var n1 = new Node(10, 11, 'a');
      n1.currentPos = 20;
      n1.layerIndex = 3;
      var n2 = n1.clone();
      expect(n2.idealPos).toEqual(10);
      expect(n2.width).toEqual(11);
      expect(n2.data).toEqual('a');
      expect(n2.currentPos).toEqual(20);
      expect(n2.layerIndex).toEqual(3);
    });
  });

});