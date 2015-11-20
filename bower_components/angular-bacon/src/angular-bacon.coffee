angular
    .module("angular-bacon", [])
    .run ["$rootScope", "$parse", ($rootScope, $parse) ->
        watcherBus = (scope, watchExp, objectEquality, watchMethod) ->
            bus = new Bacon.Bus
            scope[watchMethod] watchExp, (newValue) ->
                bus.push newValue
            , objectEquality
            scope.$on '$destroy', -> bus.end()
            initialValue = scope.$eval(watchExp)
            if typeof initialValue != "undefined"
                bus.toProperty(initialValue)
            else
                bus.toProperty()

        Object.getPrototypeOf($rootScope).$watchAsProperty = (watchExp, objectEquality) ->
            watcherBus this, watchExp, objectEquality, '$watch'

        Object.getPrototypeOf($rootScope).$watchCollectionAsProperty = (watchExp, objectEquality) ->
            watcherBus this, watchExp, objectEquality, '$watchCollection'

        Object.getPrototypeOf($rootScope).digestObservables = (observables) ->
            self = this
            angular.forEach observables, (observable, key) ->
                observable.digest self, key

        Bacon.Observable.prototype.digest = ($scope, prop) ->
            propSetter = $parse(prop).assign
            unsubscribe = this.subscribe (e) ->
                if (e.hasValue())
                    $scope.$evalAsync ->
                        propSetter($scope, e.value())

            $scope.$on '$destroy', unsubscribe
            this

        $rootScope.$asEventStream = (event) ->
            $scope = this;
            Bacon.fromBinder (sink) ->
                unsubscribe = $scope.$on event, (event) ->
                    event.args = Array.prototype.slice.call(arguments, 1)

                    ret = sink(event);
                    if (ret == Bacon.noMore)
                        unsubscribe()

                $scope.$on '$destroy', () ->
                    sink new Bacon.End()

                unsubscribe
    ]
