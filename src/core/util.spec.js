var util = require('./util.js');

describe('util', function(){
  describe('#generateNodes(amount[, options])', function(){
    it('should return an array that contains the specified number of nodes', function(){
      var nodes = util.generateNodes(10);
      expect(nodes.length).toEqual(10);
    });
  });
});
