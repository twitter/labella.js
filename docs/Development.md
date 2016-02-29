Docs ▸
[Introduction](../README.md) |
**Development** |
[Demo](http://twitter.github.io/labella.js/)
&nbsp;&nbsp;////&nbsp;&nbsp;
API Reference ▸
[Force](Force.md) |
[Node](Node.md) |
[Renderer](Renderer.md)

### One-time setup

1) Install these command line tools:

- bower   -- http://bower.io/
- node.js -- http://nodejs.org/

2) Load development tool and javascript dependencies:

```
npm install
bower install
```

### Normal workflow

- Run gulp to automatically build the distribution when one of the source files has changed. It also starts a server for the examples.

```
gulp
```

- Unit test

```bash
npm test     # Run once
npm run tdd  # Run, watch for file changes and re-run the tests automatically.
```

- Build library once (will create files in the dist folder)

```
gulp build
```

### Releasing

Use one of these commands to build, bump version and publish to both npm and bower. Don't for get to `gulp build` first

```bash
# Choose from one of these
npm version patch  # will add version by 0.0.1
npm version minor  # will add version by 0.1
npm version major  # will add version by 1
# Check package version and size.
# If everything looks good, then publish
npm publish
```