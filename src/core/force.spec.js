var Force = require('./force.js');
var Node = require('./node.js');

describe('Force', function(){
  describe('#nodes([nodes])', function(){
    var force = new Force();
    it('should return current value when called without argument', function(){
      expect(force.nodes()).toEqual([]);
      force.nodes([1]);
      expect(force.nodes()).toEqual([1]);
    });
    it('should set value when called with argument', function(){
      force.nodes([1]);
      expect(force.nodes()).toEqual([1]);
    });
  });

  describe('#options([options])', function(){
    var force = new Force();
    it('should return current value when called without argument', function(){
      expect(force.options()).toEqual(Force.DEFAULT_OPTIONS);
    });
    it('should set value when called with argument', function(){
      force.options({maxPos: 200});
      expect(force.options().maxPos).toEqual(200);
      force.options({maxPos: 400, stubWidth: 30});
      expect(force.options().maxPos).toEqual(400);
      expect(force.options().stubWidth).toEqual(30);
    });
  });

  describe('#compute()', function(){
    it('should find locations for the nodes that make them not overlap', function(){
      var nodes = [
        new Node(1,50),
        new Node(2,50),
        new Node(3,50),
        new Node(3,50),
        new Node(3,50),
        new Node(304,50),
        new Node(454,50),
        new Node(454,50),
        new Node(454,50),
        new Node(804,50),
        new Node(804,70),
        new Node(804,50),
        new Node(804,50),
        new Node(854,50),
        new Node(854,50)
      ];

      var force = new Force().nodes(nodes).compute();
      expect(nodes.map(function(d){return d.currentPos;})).toEqual([25, 78, 131, 184, 237, 304, 401, 454, 507, 673, 736, 799, 852, 905, 958]);
    });

    it('should respect the maxPos option', function(){
      var nodes = [
        new Node(1,50),
        new Node(2,50),
        new Node(3,50),
        new Node(3,50),
        new Node(3,50),
        new Node(304,50),
        new Node(454,50),
        new Node(454,50),
        new Node(454,50),
        new Node(804,50),
        new Node(804,70),
        new Node(804,50),
        new Node(804,50),
        new Node(854,50),
        new Node(854,50)
      ];
      var force = new Force({
        maxPos: 904
      }).nodes(nodes).compute();

      nodes.forEach(function(node){
        expect(node.currentRight()).not.toBeGreaterThan(904);
      });
    });

    it('should respect the minPos option', function(){
      var nodes = [
        new Node(1,50),
        new Node(2,50),
        new Node(3,50),
        new Node(3,50),
        new Node(3,50),
        new Node(304,50),
        new Node(454,50),
        new Node(454,50),
        new Node(454,50),
        new Node(804,50),
        new Node(804,70),
        new Node(804,50),
        new Node(804,50),
        new Node(854,50),
        new Node(854,50)
      ];
      var force = new Force({
        minPos: 30
      }).nodes(nodes).compute();

      nodes.forEach(function(node){
        expect(node.currentRight()).not.toBeLessThan(30);
      });
    });
  });
});
