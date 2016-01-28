var Node = require('./node.js');

describe('Node', function(){
  describe('#distanceFrom(node)', function(){
    it('should return positive distance when two nodes do not overlap', function(){
      var n1 = new Node(10, 10);
      var n2 = new Node(30, 10);
      expect(n1.distanceFrom(n2)).toEqual(10);
    });
    it('should return zero distance when two nodes touch', function(){
      var n1 = new Node(10, 10);
      var n2 = new Node(20, 10);
      expect(n1.distanceFrom(n2)).toEqual(0);
    });
    it('should return negative distance when two nodes overlap', function(){
      var n1 = new Node(10, 10);
      var n2 = new Node(10, 10);
      expect(n1.distanceFrom(n2)).toEqual(-10);
    });
  });

  describe('moveToIdealPosition()', function(){
    it('should change the current position to ideal position', function(){
      var n = new Node(10,10);
      n.currentPos = 20;
      expect(n.currentPos).not.toEqual(n.idealPos);
      n.moveToIdealPosition();
      expect(n.currentPos).toEqual(n.idealPos);
    });
  });


  describe('#displacement()', function(){
    it('should return distance from ideal position', function(){
      var n1 = new Node(10, 10);
      expect(n1.displacement()).toEqual(0);
      n1.currentPos = 20;
      expect(n1.displacement()).toEqual(-10);
      n1.currentPos = 0;
      expect(n1.displacement()).toEqual(10);
    });
  });

  describe('#overlapWithNode(node, buffer)', function(){

  });

  describe('overlapWithPoint(pos)', function(){

  });


});