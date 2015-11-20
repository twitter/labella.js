angular-bacon
=============

[bacon.js](https://github.com/raimohanska/bacon.js) bindings for [AngularJS](https://github.com/angular/angular.js).

Make your AngularJS apps even more reactive, by using bacon.js FRP library to process your scope properties.

Usage
-----

Simply require *angular-bacon* in your AngularJS module, and both $rootScope and Bacon objects are augmented automatically with the following functions:

**$scope.$watchAsProperty(property)**

Exposes an AngularJS [scope](http://docs.angularjs.org/api/ng.$rootScope.Scope) property as a bacon.js [property](https://github.com/raimohanska/bacon.js#property). If the property already has a value in the scope (i.e. is not _undefined_), that value becomes the property's initial value.

**$scope.$watchCollectionAsProperty(property)**

Exposes an AngularJS [scope](http://docs.angularjs.org/api/ng.$rootScope.Scope) Array or Object property as a bacon.js [property](https://github.com/raimohanska/bacon.js#property). If the property already has a value in the scope (i.e. is not _undefined_), that value becomes the property's initial value.

This function is equivalent to `$scope.$watchAsProperty` but using `$watchCollection` instead of `$watch`, so that changes in Array and Object values are properly detected.

**Bacon.Observable.digest($scope, property)**

Digests a bacon.js observable (stream or property) back to an AngularJS scope property. Attaches an .onValue handler to the observable, which simply $applies the property in the selected scope with the selected key.

**$scope.digestObservables(observables)**

Digests multiple bacon.js observables at once. Simple syntactic sugar, when multiple observables are involved. _observables_ is a map with object keys representing $scope property names into which the observables are digested into.

**$scope.$asEventStream(event)**

Subscribes to scope hierarchy [events](https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$emit) as Bacon.[EventStream](https://github.com/baconjs/bacon.js#eventstream). _event_ is a name of the event. Created stream will contain AngularJS scope event objects, augmented with an _.args_ property, containing a list of all additional arguments passed in the _$emit_ call.

Examples
--------

For examples, see [here](examples/form-validation.js). This example somewhat mimics raimohanska's [awesome](http://nullzzz.blogspot.fi/2012/11/baconjs-tutorial-part-ii-get-started.html) bacon.js [tutorials](http://nullzzz.blogspot.fi/2012/12/baconjs-tutorial-part-iii-ajax-and-stuff.html): it features a simple login validation form, where a slow backend "is-nickname-taken" check is simulated by a stream with a 5-second delay. In addition, the two selected passwords must match, and be at least five characters long before the submit button is enabled.

Changelog
---------

**2.0.0**

Use $evalAsync instead of $apply when digesting streams to scopes. This change is potentially backwards-incompatible for code that relies on synchronous digestion of streams.

**1.5.1**

Fix issue with root scope digest already in progress when digesting streams in directives.

**1.5.0**

Augment isolate scopes with angular-bacon functions.

**1.4.1**

Add _package.json_ main module.

**1.4.0**

Add _$asEventStream(event)_.

**1.3.2**

Fix issue with end of bus not having its scope bound correctly on scope destruction callback.

**1.3.1**

Bump bacon.js to newer version.

**1.3.0**

Add _$watchCollectionAsProperty()_. Requires Angular 1.2+.

**1.2.0**

End _$watchAsProperty()_ streams and unsubscribe _.digest()_ listeners when scope is destroyed.

**1.1.2**

Add MIT License.
