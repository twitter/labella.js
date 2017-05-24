# Change logs for Labella.js

## v1.x.x

### 1.1.4 (2017-05-24)

Move `karma-phantomjs-launcher` to devDependencies where it should be.

### 1.1.3 (2017-05-24)

Ensure that labella does not sort the nodes within the input array and return the list of nodes in the same order that it was supplied. ([#23](https://github.com/twitter/labella.js/issues/23))

If you specify `force.node([n1, n2, n3])`, you should get `[n1, n2, n3]` back from `force.nodes()` with updated `currentPos` for `n1`, `n2` and `n3`.

### 1.1.2 (2016-03-18)

Use original order if labels are at the same position and has no good reason to change order. This was the intended behavior, but the way it was written sometimes it changes the order, so I ensure that it will keep the original order in this version.

### 1.1.1 (2016-02-17)

Fix the bug in *overlap* distribution algorithm. Thanks @GjjvdBurg. **After upgrading to this version, Labella may position the labels slightly different if you use the overlap algorithm and your labels exceed one row.**

### 1.1.0 (2016-02-17)

Separate utilities and extra code for evaluation/demo into a separate bundle *labella-extra* to keep the main bundle as lean as possible. Now the *dist* directory contains four files:

- *labella.js* and *labella.min.js* : Core functionalities. This is what you will need for regular use.
- *labella-extra.js* and *labella-extra.min.js* (introduced in this version) : Same with the above bundle plus `labella.util` and `labella.metrics`, which are special modules for demo/evaluation.

Other than that, No API change, just refactoring.

- Use [webpack](https://webpack.github.io) to make the library support UMD instead of using a custom template.
- Refactor a few classes to ES6

### 1.0.0 (2016-01-23)

Replace *force-directed simulation* with *constraint-based layout* and use [VPSC](https://github.com/tgdwyer/WebCola/wiki/What-is-VPSC%3F) quadratic solver to compute positions that best satisfy the constraints. This method is much faster and does not rely on number of iterations like a simulation, therefore the computation can return results immediately and does not need to be asynchronous anymore. This improves overall performance and leads to several changes to the API.

<a name="migrate-0.x.x-1.x.x"></a>
#### New API

- `force.compute()` is a replacement for `force.start()` and `force.on()`. Usage is slightly different because `force.compute()` is synchronous and the nodes' positions are ready immediately after the call while `force.start()` was asynchronous.

```diff
var force = new labella.Force()
  .nodes(nodes)
-   .on('end', function(){
-     draw(force.nodes());
-   })
-   .start(100);
+   .compute();
+ draw(force.nodes());
```

- New **Force** option `lineSpacing` is available for setting the minimum gap between lines.

#### Breaking changes

- The following **Force** functions are deprecated: `.on()`, `.start()`, `.stop()`, `.resume()`, `.step()` and `.isStable()`.
- The following **Force** options are deprecated: `damping`, `epsilon` and `roundsPerTick`
- `node.getLevel()` is renamed to `node.getLayerIndex()`

## v0.x.x

### 0.1.1 (2015-11-21)

#### Breaking changes

- For the **Force**, use ```options.minPos``` and ```options.maxPos``` to set ```options.layerWidth``` for the **Distributor** inside it instead of having to specify ```options.layerWidth``` explicitly.
- Change ```options.labelHeight``` in **Renderer** to ```options.nodeHeight```.

### 0.1.0 (2015-11-20)

First release. Hello, world!