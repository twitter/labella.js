var util = require('./util.js');

describe('util', function(){
  describe('#generateNodes()', function(){
    it('should return the specified number of nodes', function(){
      var nodes = util.generateNodes(10);
      expect(nodes.length).toEqual(10);
    });
  });
});
