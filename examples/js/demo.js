angular.module('app', [])
  .controller('demoCtrl', function($scope, $timeout){
    $scope.distributorAlgorithms = [
      // 'fifo',
      'simple',
      'overlap'
    ];

    $scope.autoLayout = true;

    $scope.options = {
      amount: 30,
      minWidth: 50,
      maxWidth: 50,

      nodeSpacing: 3,
      roundsPerTick: 5,
      minPos: 0,
      maxPos: 900,
      maxRound: 100,

      density: 0.75,
      algorithm: 'overlap'
    };

    var chart = new HorizontalTimeline('#timeline')
      .width(1000);

    var nodes = [];

    function generate(options){
      nodes = labella.util.generateNodes(+options.amount, {
        minWidth: +options.minWidth,
        maxWidth: +options.maxWidth
      });
    }

    function layout(options, callback){
      // labella.debugging = true;
      inputNodes = nodes.map(function(d){return d.clone();});

      var force = new labella.Force({
        minPos: +options.minPos,
        maxPos: +options.maxPos,
        nodeSpacing: +options.nodeSpacing,
        roundsPerTick: +options.roundsPerTick,

        algorithm: options.algorithm
      });

      force.on('start', function(event){
        t1 = new Date().getTime();
      });
      force.on('tick', function(event){
        chart.data(force.nodes());
      });
      // force.on('endLayer', function(event){
      //   chart.data(force.getLayers());
      // });
      force.on('end', function(event){
        $timeout(function(){
          var t2 = new Date().getTime();
          console.log('completed in ' + (t2 - t1) + 'ms');
          chart.data(force.nodes());
          $scope.metrics = force.metrics();
        }, 0);
      });

      force
        .nodes(inputNodes)
        .start(+options.maxRound);
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