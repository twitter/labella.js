var webpack = require('webpack');
var fs = require('fs');

var bowerPath = 'bower_components';
try{
  if(fs.statSync(__dirname + '/.bowerrc')){
    var bowerrc = JSON.parse(fs.readFileSync(__dirname + '/.bowerrc', 'utf-8'));
    if(bowerrc.directory){
      bowerPath = __dirname + '/' + bowerrc.directory;
    }
  }
}
catch(ex){}

module.exports = function(){
  return {
    module:{
      loaders: [
        {
          test: /\.json$/,
          loader: 'json-loader'
        },
        {
          test: /\.jsx?$/,
          exclude: /(node_modules|bower_components)/,
          loader: 'babel', // 'babel-loader' is also a legal name to reference
          query: {
            presets: ['es2015']
          }
        }
      ],
    },
    resolve: {
      modulesDirectories: [bowerPath]
    },
    plugins: [
      new webpack.ResolverPlugin(
        new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin('bower.json', ['main'])
      )
    ]
  };
};