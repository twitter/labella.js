var webpack = require('webpack');

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
          loader: 'babel' // 'babel-loader' is also a legal name to reference
        }
      ],
    },
    resolve: {
      modulesDirectories: ['examples/bower_components']
    },
    plugins: [
      new webpack.ResolverPlugin(
        new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin('bower.json', ['main'])
      )
    ]
  };
};