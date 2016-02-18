WebCola
=======

Javascript constraint based layout for high-quality graph visualization and exploration 
using D3.js and other web-based graphics libraries.  
[Homepage with examples](http://marvl.infotech.monash.edu/webcola)

Building
--------

*Linux/Mac/Windows Command Line:*

 - install [node.js](http://nodejs.org)
 - install grunt from the command line using npm (comes with node.js):

> npm install -g grunt-cli

 - from the WebCola directory:

> npm install grunt

> npm install

 - build, minify and test:

> grunt

This creates the cola.v3.min.js file in the WebCola directory.

*Visual Studio:*

 - get the [typescript plugin](http://www.typescriptlang.org/#Download)
 - open webcola.sln

Running
-------

*Linux/Mac/Windows Command Line:*

Install the Node.js http-server module:

> npm install -g http-server

After installing http-server, we can serve out the example content in the WebCola directory.
> http-server WebCola

The default configuration of http-server will serve the exampes on [http://localhost:8080](http://localhost:8080).