var metrics = require('./metrics.js');
var Node = require('./node.js');

describe('metrics', function(){
  describe('#displacement(nodes)', function(){
    it('should return sum of the displacements', function(){
      expect(metrics.displacement([])).toEqual(0);
      var nodes = [
        new Node(1,50),
        new Node(2,50),
        new Node(804,50),
        new Node(854,50)
      ];
      expect(metrics.displacement(nodes)).toEqual(0);
      nodes[0].currentPos = 10;
      nodes[1].currentPos = 10;
      expect(metrics.displacement([nodes])).toEqual(17);
    });
  });

  describe('#overflowSpace(nodes, minPos, maxPos)', function(){
    var nodes = [
      new Node(1,50),
      new Node(-30,50),
      new Node(804,50),
      new Node(854,50)
    ];
    it('should return 0 if both minPos and maxPos are not set', function(){
      expect(metrics.overflowSpace(nodes)).toEqual(0);
    });
    it('should return the amount of pixels that exceed boundary', function(){
      expect(metrics.overflowSpace(nodes, 0)).toEqual(74);
      expect(metrics.overflowSpace(nodes, null, 800)).toEqual(79);
      expect(metrics.overflowSpace(nodes, 0, 800)).toEqual(74 + 79);
    });
  });

  describe('#overDensitySpace(nodes, density, layerWidth[, nodeSpacing])', function(){
    var nodes = [
      new Node(1,50),
      new Node(2,50),
      new Node(804,50),
      new Node(854,50)
    ];
    it('should return 0 if the density or layerWidth is not defined', function(){
      expect(metrics.overDensitySpace([])).toEqual(0);
      expect(metrics.overDensitySpace(nodes)).toEqual(0);
      expect(metrics.overDensitySpace(nodes, 0.75)).toEqual(0);
      expect(metrics.overDensitySpace(nodes, null, 1000)).toEqual(0);
    });
    it('should return the amount of pixels exceeding specified density', function(){
      expect(metrics.overDensitySpace(nodes, 0.75, 1000)).toEqual(0);
      expect(metrics.overDensitySpace(nodes, 0.1, 1000)).toEqual(100);
      expect(metrics.overDensitySpace([nodes, nodes], 0.1, 1000)).toEqual(200);
    });
  });

  describe('#overlapCount(nodes[, buffer])', function(){
    var nodes = [
      new Node(0,50),
      new Node(50,50),
      new Node(800,50),
      new Node(801,50)
    ];
    it('should return 0 if the input is empty', function(){
      expect(metrics.overlapCount([])).toEqual(0);
    });
    it('should return number of times nodes on the same layer overlaps', function(){
      expect(metrics.overlapCount(nodes)).toEqual(1);
      expect(metrics.overlapCount([nodes,nodes])).toEqual(2);
    });
    it('should take buffer into consideration', function(){
      expect(metrics.overlapCount(nodes, 2)).toEqual(2);
      expect(metrics.overlapCount([nodes,nodes], 3)).toEqual(4);
    });
  });

  describe('#overlapSpace(nodes)', function(){
    var nodes = [
      new Node(0,50),
      new Node(50,50),
      new Node(800,50),
      new Node(801,50)
    ];
    it('should return 0 if the input is empty', function(){
      expect(metrics.overlapSpace([])).toEqual(0);
    });
    it('should return number of times nodes on the same layer overlaps', function(){
      expect(metrics.overlapSpace(nodes)).toEqual(49);
      expect(metrics.overlapSpace([nodes,nodes])).toEqual(49*2);
    });
  });

  describe('#weightedAllocatedSpace(nodes)', function(){
    var nodes = [
      new Node(0,50),
      new Node(50,50),
      new Node(800,50),
      new Node(801,50)
    ];
    it('should return 0 if the input is empty', function(){
      expect(metrics.weightedAllocatedSpace([])).toEqual(0);
    });
    it('should return 0 if the output is in one row', function(){
      expect(metrics.weightedAllocatedSpace(nodes)).toEqual(0);
    });
    it('should return width of the nodes weight by layer index', function(){
      expect(metrics.weightedAllocatedSpace([nodes, nodes])).toEqual(200);
      expect(metrics.weightedAllocatedSpace([nodes, nodes, nodes])).toEqual(200 + 400);
    });
  });

});
