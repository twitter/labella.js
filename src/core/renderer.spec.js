'use strict';

var Renderer = require('./renderer.js');
var Node = require('./node.js');

describe('Renderer', function(){
  describe('Render.lineTo(point)', function(){
    it('should return the correct path command', function(){
      expect(Renderer.lineTo([1,2])).toEqual('L 1 2');
    });
  });

  describe('Render.moveTo(point)', function(){
    it('should return the correct path command', function(){
      expect(Renderer.moveTo([1,2])).toEqual('M 1 2');
    });
  });

  describe('Render.curveTo(c1, c2, point)', function(){
    it('should return the correct path command', function(){
      expect(Renderer.curveTo([0,0], [1,1], [1,2])).toEqual('C 0 0 1 1 1 2');
    });
  });

  describe('Render.vCurveBetween(point1, point2)', function(){
    it('should return the correct path command', function(){
      expect(Renderer.vCurveBetween([0,0], [4,4])).toEqual('C 0 2 4 2 4 4');
    });
  });

  describe('Render.hCurveBetween(point1, point2)', function(){
    it('should return the correct path command', function(){
      expect(Renderer.hCurveBetween([0,0], [4,4])).toEqual('C 2 0 2 4 4 4');
    });
  });

  describe('#getWaypoints(node)', function(){
    describe('should return the list of waypoints', function(){
      var node = new Node(1,10);
      var stub1 = node.createStub();
      stub1.currentPos = 10;
      it('for left direction', function(){
        var r = new Renderer({
          layerGap: 20,
          nodeHeight: 10,
          direction: 'left'
        });
        expect(r.getWaypoints(node)).toEqual([ [ [ 0, 1 ] ], [ [ -20, 10 ], [ -30, 10 ] ], [ [ -50, 1 ], [ -60, 1 ] ] ]);
      });
      it('for right direction', function(){
        var r = new Renderer({
          layerGap: 20,
          nodeHeight: 10,
          direction: 'right'
        });
        expect(r.getWaypoints(node)).toEqual([ [ [ 0, 1 ] ], [ [ 20, 10 ], [ 30, 10 ] ], [ [ 50, 1 ], [ 60, 1 ] ] ]);
      });
      it('for up direction', function(){
        var r = new Renderer({
          layerGap: 20,
          nodeHeight: 10,
          direction: 'up'
        });
        expect(r.getWaypoints(node)).toEqual([ [ [ 1, 0 ] ], [ [ 10, -20 ], [ 10, -30 ] ], [ [ 1, -50 ], [ 1, -60 ] ] ]);
      });
      it('for down direction', function(){
        var r = new Renderer({
          layerGap: 20,
          nodeHeight: 10,
          direction: 'down'
        });
        expect(r.getWaypoints(node)).toEqual([ [ [ 1, 0 ] ], [ [ 10, 20 ], [ 10, 30 ] ], [ [ 1, 50 ], [ 1, 60 ] ] ]);
      });
    });
  });

});