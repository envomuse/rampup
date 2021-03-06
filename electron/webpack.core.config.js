var path = require('path');
var webpack = require('webpack');
var HtmlwebpackPlugin = require('html-webpack-plugin');
var merge = require('webpack-merge');
var Clean = require('clean-webpack-plugin');
var autoprefixer = require('autoprefixer');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var TARGET = process.env.npm_lifecycle_event;
var ROOT_PATH = path.resolve(__dirname);
var BUILD_DIRNAME = 'release/core'
var APP_PATH = path.resolve(ROOT_PATH, 'src');
var BUILD_PATH = path.resolve(ROOT_PATH, BUILD_DIRNAME);

process.env.BABEL_ENV = 'build';

var exportConfig = {
  addVendor: function (name, path) {
    this.resolve.alias[name] = path;
    this.module.noParse.push(new RegExp('^' + name + '$'));
  },

  target: 'electron-renderer',

  devtool: 'inline-source-map',

  entry: {
    core: path.resolve(APP_PATH, 'core/index.js'),
  },

  output: {
    path: BUILD_PATH,
    // filename: '[name].[chunkhash].js?'
    filename: '[name].js?'
  },

  resolve: {
    modulesDirectories: ['node_modules', './src'],
    extensions: ['', '.js', '.jsx'],
    // root: r,
    alias: {}
  },
  externals: {
      // require("jquery") is external and available
      //  on the global var jQuery
      // "jquery": "jQuery"
  },

  module: {
    noParse: [],
    preLoaders: [
      {
        test: /\.css$/,
        loaders: ['csslint'],
        include: APP_PATH
      }
      // ,
      // {
      //   test: /\.jsx?$/,
      //   loaders: ['eslint'],
      //   include: APP_PATH
      // }
    ],
    loaders: [
      {
        test: /\.less$/,
        loader: 'style!css!postcss!less'
      },
      {
        test: /\.css$/,
        loaders: ['style', 'css', 'postcss'],
        // include: APP_PATH
      },
      {
        test: /\.jsx?$/,
        loaders: ['babel'],
        include: APP_PATH
      },
      {
        test: /\.png|jpg|jpeg|gif|svg$/,
        loader: "url?name=img/[name].[ext]&limit=10000",
        include: APP_PATH
      },
      {test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?name=fonts/[name].[ext]&limit=10000&mimetype=application/font-woff'},
      {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?name=fonts/[name].[ext]&limit=10000&mimetype=application/octet-stream'},
      {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file?name=fonts/[name].[ext]'},
      {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?name=fonts/[name].[ext]&limit=10000&mimetype=image/svg+xml'}

    ]
  },

  plugins: [
    new webpack.NoErrorsPlugin(),

    new HtmlwebpackPlugin({
      title: 'VMax Agent CORE',
      filename: "index.html",
      template: 'src/html_template/index.html',
      chunks: ['core'],
      inject: true,
    }),

    new Clean([BUILD_DIRNAME]),
    new CopyWebpackPlugin([{
            from: 'src/main.js',
          }, {
            from: 'src/core/package.json',
          }, {
            from: 'src/core/config.json',
          }, {
            from: 'src/core/readme',
            to : 'apps/'
          }, {
            from: 'lib/socket.io-1.4.5.js',
            to : 'lib/'
          }, {
            from: 'plugins/',
            to : 'plugins/'
          }],
          {

          }),
    new webpack.DefinePlugin({
      'process.env': {
        // This affects react lib size
        'NODE_ENV': JSON.stringify('production')
      }
    })
  ],
  postcss: function () {
      return [ autoprefixer({ browsers: ['last 2 versions'] })];
  }
};

module.exports = exportConfig
