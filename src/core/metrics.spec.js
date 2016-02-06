var metrics = require('./metrics.js');
var Node = require('./node.js');

describe('metrics', function(){
  describe('#displacement(nodes)', function(){
    it('should return 0 if the input is empty', function(){
      expect(metrics.displacement([])).toEqual(0);
    });
    it('should return sum of the displacements', function(){
      var nodes = [
        new Node(1,50),
        new Node(2,50),
        new Node(804,50),
        new Node(854,50)
      ];
      expect(metrics.displacement(nodes)).toEqual(0);
      nodes[0].currentPos = 10;
      nodes[1].currentPos = 10;
      expect(metrics.displacement([nodes])).toEqual(17 / 4);
    });
  });

  describe('#pathLength(nodes)', function(){
    it('should return 0 if the input is empty', function(){
      expect(metrics.pathLength([])).toEqual(0);
    });
    it('should return sum of the displacements from leaves to stubs up to root', function(){
      var n1 = new Node(1,50);
      n1.currentPos = 20;
      var n2 = new Node(2,50);
      var n3 = new Node(804, 50);
      var stub = n3.createStub();
      n3.currentPos = 810;
      var n4 = new Node(854, 50);
      n4.currentPos = 800;
      var stub4 = n4.createStub();
      stub4.currentPos = 700;
      var stub4_2 = stub4.createStub();
      var nodes = [
        n1,
        n2,
        n3,
        new Node(854,50)
      ];
      expect(metrics.pathLength([n1])).toEqual(19);
      expect(metrics.pathLength([n2])).toEqual(0);
      expect(metrics.pathLength([n3])).toEqual(6);
      expect(metrics.pathLength([n4, stub4, stub4_2])).toEqual(254);
      expect(metrics.pathLength([[n1, n2, n3, stub4_2], [stub4], [n4]])).toEqual(279/4);
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
    it('should return space that nodes on the same layer overlaps on average', function(){
      expect(metrics.overlapSpace(nodes)).toEqual(49 / 4);
      expect(metrics.overlapSpace([nodes,nodes])).toEqual(49*2 / 8);
    });
  });

  describe('#weightedAllocation(nodes)', function(){
    var nodes = [
      new Node(0,50),
      new Node(50,50),
      new Node(800,50),
      new Node(801,50)
    ];
    it('should return 0 if the input is empty', function(){
      expect(metrics.weightedAllocation([])).toEqual(0);
    });
    it('should return 0 if the output is in one row', function(){
      expect(metrics.weightedAllocation(nodes)).toEqual(0);
    });
    it('should return number of nodes weight by layer index', function(){
      expect(metrics.weightedAllocation([nodes, nodes])).toEqual(4);
      expect(metrics.weightedAllocation([nodes, nodes, nodes])).toEqual(4 + 8);
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
