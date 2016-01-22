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
});
