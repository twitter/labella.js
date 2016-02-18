var helper = require('./helper.js');

describe('helper', function(){
  describe('#isDefined(x)', function(){
    it('should return true if value is not null and not undefined', function(){
      expect(helper.isDefined(0)).toBe(true);
      expect(helper.isDefined(1)).toBe(true);
      expect(helper.isDefined('test')).toBe(true);
      expect(helper.isDefined([])).toBe(true);
      expect(helper.isDefined({})).toBe(true);
      expect(helper.isDefined({a:1})).toBe(true);
    });
    it('should return false otherwise', function(){
      expect(helper.isDefined(null)).toBe(false);
      expect(helper.isDefined(undefined)).toBe(false);
    });
  });

  describe('#last(array)', function(){
    it('should return last item in the array', function(){
      expect(helper.last([1,2])).toEqual(2);
      expect(helper.last([3])).toEqual(3);
    });
    it('should return null if the array is empty', function(){
      expect(helper.last([])).toEqual(null);
    });
  });


  describe('#pick(object, keys)', function(){
    it('should create an object composed of the picked keys.', function(){
      var source = {
        a:1,
        b:2,
        c:3
      };
      expect(helper.pick(source, ['a','b'])).toEqual({a:1, b:2});
      expect(helper.pick(source, ['c','b'])).toEqual({b:2, c:3});
    });
  });

  describe('#sum(array, accessor)', function(){
    it('should return sum of the array', function(){
      var sum = helper.sum([1,2,3], function(d){return d;});
      expect(sum).toEqual(6);
    });
  });

});