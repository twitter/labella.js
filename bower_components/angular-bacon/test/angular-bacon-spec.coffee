beforeEach module 'angular-bacon'

describe "rootScope", ->
    it "gets augmented with $watchAsProperty", ->
        inject ($rootScope) ->
            expect(typeof $rootScope.$watchAsProperty).toEqual 'function'

    it "gets augmented with $watchCollectionAsProperty", ->
        inject ($rootScope) ->
            expect(typeof $rootScope.$watchCollectionAsProperty).toEqual 'function'

    it "augmentations are available in isolate scopes", ->
        inject ($rootScope) ->
            scope = $rootScope.$new true
            expect(typeof scope.$watchAsProperty).toEqual 'function'
            expect(typeof scope.$watchCollectionAsProperty).toEqual 'function'
            expect(typeof scope.digestObservables).toEqual 'function'

    it "can create properties out of watch expressions", ->
        inject ($rootScope) ->
            $rootScope.foo = true
            values = []
            $rootScope.$watchAsProperty('foo').onValue (val) ->
                values.push val

            $rootScope.$apply ->
                $rootScope.foo = 'bar'

            expect(values[0]).toEqual true
            expect(values[1]).toEqual 'bar'

    it "will not push an initial value if one isn't defined", ->
        inject ($rootScope) ->
            values = []
            $rootScope.$watchAsProperty('foo').onValue (val) ->
                values.push val

            $rootScope.$apply ->
                $rootScope.foo = 'bar'

            expect(values[0]).toEqual 'bar'

    it "can create collection properties out of watch expressions", ->
        inject ($rootScope) ->
            $rootScope.coll = [1]
            values = []
            $rootScope.$watchCollectionAsProperty('coll').onValue (val) ->
                values.push val

            $rootScope.$apply ->
                $rootScope.coll = [1,2]

            expect(values[0]).toEqual [1]
            expect(values[1]).toEqual [1,2]

    it "will not push an initial collection value if one isn't defined", ->
        inject ($rootScope) ->
            values = []
            $rootScope.$watchAsProperty('coll').onValue (val) ->
                values.push val

            $rootScope.$apply ->
                $rootScope.coll = [1,2]

            expect(values[0]).toEqual [1,2]


    it "can digest observables back to scope", ->
        inject ($rootScope) ->
            bus = new Bacon.Bus

            bus.digest $rootScope, 'foo'

            $rootScope.$evalAsync ->
                expect($rootScope.foo).toBeUndefined()

                bus.push 'bar'

            $rootScope.$evalAsync ->
                expect($rootScope.foo).toEqual 'bar'

    it "can chain on digest", ->
        inject ($rootScope) ->
            bus = new Bacon.Bus

            bus.digest($rootScope, 'foo').digest($rootScope, 'bar')

            $rootScope.$evalAsync ->
                expect($rootScope.foo).toBeUndefined()
                expect($rootScope.bar).toBeUndefined()
                bus.push 'baz'

            $rootScope.$evalAsync ->
                expect($rootScope.foo).toEqual 'baz'
                expect($rootScope.bar).toEqual 'baz'

    it "can digest even if $apply already in process", ->
        inject ($rootScope) ->
            bus = new Bacon.Bus
            bus.digest $rootScope, 'foo'
            $rootScope.$apply ->
                bus.push 'bar'
            expect($rootScope.foo).toEqual 'bar'


    it "can digest multiple observables at once", ->
        inject ($rootScope) ->
            bus = new Bacon.Bus
            bus2 = new Bacon.Bus
            bus3 = new Bacon.Bus

            $rootScope.digestObservables 
                first: bus
                second: bus2
                third: bus3

            $rootScope.$evalAsync ->
                bus.push 'foo'
                bus2.push 'bar'

            $rootScope.$evalAsync ->
                expect($rootScope.first).toEqual 'foo'
                expect($rootScope.second).toEqual 'bar'
                expect($rootScope.third).toBeUndefined()

    it "can digest on deeply nested properties of $scope", ->
        inject ($rootScope) ->
            bus = new Bacon.Bus

            bus.digest $rootScope, 'foo.baz'

            $rootScope.$evalAsync ->
                expect($rootScope.foo).toBeUndefined()

                bus.push 'bar'

            $rootScope.$evalAsync ->
                expect($rootScope.foo.baz).toEqual 'bar'

    it "ends the stream when the $scope is $destroyed", ->
        inject ($rootScope) ->
            scope = $rootScope.$new()
            ended = false
            scope.$watchAsProperty('foo').onEnd ->
                ended = true

            expect(ended).toEqual false

            scope.$destroy()

            expect(ended).toEqual true

    it "cleans up digests when the $scope is $destroyed", ->
        inject ($rootScope) ->
            scope = $rootScope.$new()
            bus = new Bacon.Bus
            bus.digest scope, 'foo'
            
            $rootScope.$evalAsync ->
                bus.push 'bar'

            $rootScope.$evalAsync ->
                expect(scope.foo).toEqual 'bar'
                scope.$destroy()
                bus.push 'baz'

            $rootScope.$evalAsync ->
                expect(scope.foo).toEqual 'bar'

    describe "$asEventStream", ->
        it "streams $emitted events with arguments", ->
            inject ($rootScope) ->
                scope = $rootScope.$new()
                scopeReceivedEvent = false
                
                scope.$asEventStream('event').onValue ->
                    scopeReceivedEvent = true
                
                expect(scopeReceivedEvent).toEqual false
                scope.$emit('event', 'foo');
                expect(scopeReceivedEvent).toEqual true

        it "streams $broadcasted events", ->
            inject ($rootScope) ->
                scope = $rootScope.$new()
                scopeReceivedEvent = false
                
                scope.$asEventStream('event').onValue ->
                    scopeReceivedEvent = true
                
                expect(scopeReceivedEvent).toEqual false

                $rootScope.$broadcast('event', 'foo');

                expect(scopeReceivedEvent).toEqual true

        it "ends the stream when the $scope is $destroyed", ->
            inject ($rootScope) ->
                scope = $rootScope.$new()
            
                scopeReceivedEvent = false
                ended = false
                
                stream = scope.$asEventStream('event')

                stream.onValue ->
                    scopeReceivedEvent = true

                stream.onEnd -> 
                    ended = true

                expect(scopeReceivedEvent).toEqual false

                scope.$destroy()

                $rootScope.$broadcast('event', 'foo');

                expect(scopeReceivedEvent).toEqual false
                expect(ended).toEqual true

        it "streams events with arguments", ->
            inject ($rootScope) ->
                scope = $rootScope.$new()
                scopeReceivedEvent = false
                
                scope.$asEventStream('event')
                    .map('.args')
                    .onValue (e) ->
                        expect(e).toEqual = ['foo', 'bar']
                        scopeReceivedEvent = true
                
                scope.$emit('event', 'foo', 'bar');
                expect(scopeReceivedEvent).toEqual true

        it "streams events with arguments", ->
            inject ($rootScope) ->
                scope = $rootScope.$new()
                results = []
                stream = scope.$asEventStream('event')

                stream
                    .map('.args.0')
                    .onValue (e) -> results.push e

                stream
                    .map('.args.1')
                    .onValue (e) -> results.push e
                
                scope.$emit('event', 'foo', 'bar');

                expect(results).toEqual ['foo', 'bar']

        it "will stream $destroy event", ->
            inject ($rootScope) ->
                scope = $rootScope.$new()
                value = false
                ended = false
                
                stream = scope.$asEventStream('$destroy')

                stream.onValue ->
                    value = true

                stream.onEnd ->
                    ended = true

                expect(value).toEqual false
                expect(ended).toEqual false

                scope.$destroy()

                expect(value).toEqual true
                expect(ended).toEqual true
