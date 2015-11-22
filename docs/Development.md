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

- Run grunt to automatically build the distribution when one of the source files has changed. It also starts a server for the examples.

```
grunt
```

- Run unit test. This will run once, then watch for file changes and re-run the tests automatically.

```
grunt test
```

- Build library once (will create files in the dist folder)

```
grunt build
```

- See all available grunt tasks:

```
grunt --help
```

### Releasing

Use one of these commands to build, bump version and publish to both npm and bower.

```
grunt publish:patch // will add version by 0.0.1
grunt publish:minor // will add version by 0.1
grunt publish:major // will add version by 1
```

#### Debugging version bump

```
grunt bump --dry-run
```