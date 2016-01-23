angular.module('app', [])
  .controller('demoCtrl', function($scope, $timeout){
    $scope.distributorAlgorithms = [
      // 'fifo',
      'simple',
      'overlap',
      'none'
    ];

    $scope.autoLayout = true;

    $scope.options = {
      amount: 20,
      minWidth: 40,
      maxWidth: 60,

      lineSpacing: 2,
      nodeSpacing: 3,
      minPos: 0,
      maxPos: 960,

      density: 0.75,
      algorithm: 'overlap'
    };

    var chart = new HorizontalTimeline('#timeline')
      .width(1000);

    var nodes = [];

    function generate(options){
      nodes = labella.util.generateNodes(+options.amount, {
        minWidth: +options.minWidth,
        maxWidth: +options.maxWidth,
        maxPos: 960
      });
    }

    function layout(options, callback){
      // labella.debugging = true;
      inputNodes = nodes.map(function(d){return d.clone();});

      var force = new labella.Force({
        minPos: +options.minPos,
        maxPos: +options.maxPos,
        lineSpacing: +options.lineSpacing,
        nodeSpacing: +options.nodeSpacing,

        density: +options.density,
        algorithm: options.algorithm
      });

      force.nodes(inputNodes);

      var t1 = new Date().getTime();
      force.compute();
      var t2 = new Date().getTime();
      console.log('completed in ' + (t2 - t1) + 'ms');
      chart.data(force.nodes());
      // $scope.metrics = force.metrics();
    }

    $scope.regenerate = function(){
      generate($scope.options);
      chart.data(nodes);

      if($scope.autoLayout){
        $scope.updateLayout();
      }
    };

    $scope.updateLayout = function(){
      layout($scope.options);
    };

    $scope.regenerate();
  });