var path = require('path');
var webpack = require('webpack');
var HtmlwebpackPlugin = require('html-webpack-plugin');
var merge = require('webpack-merge');
var Clean = require('clean-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var autoprefixer = require('autoprefixer');
var pkg = require('./package.json');

var TARGET = process.env.npm_lifecycle_event;
var ROOT_PATH = path.resolve(__dirname);
var BUILD_DIRNAME = !process.env.BUILDDIR ? 'build'
  : path.resolve(ROOT_PATH, process.env.BUILDDIR);
var APP_PATH = path.resolve(ROOT_PATH, 'src');
var BUILD_PATH = path.resolve(ROOT_PATH, BUILD_DIRNAME);


process.env.BABEL_ENV = TARGET;

var exportConfig = null;

var common = {
  addVendor: function (name, path) {
    this.resolve.alias[name] = path;
    this.module.noParse.push(new RegExp('^' + name + '$'));
  },

  entry: {
    app: path.resolve(APP_PATH, 'index.js')
  },

  output: {
    path: BUILD_PATH,
    // filename: '[name].[chunkhash].js?'
    filename: '[name].bundle.js?'
  },

  resolve: {
    modulesDirectories: ['node_modules', './src', './src/components', './src/components/customPages'],
    extensions: ['', '.js', '.jsx', '.json'],
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
        test: /\.jsx?$/,
        loaders: ['babel'],
        include: APP_PATH
      },
      {
        test: /\.png|jpg|jpeg|gif|svg$/,
        loader: "url?name=img/[name].[ext]&limit=10000",
        include: APP_PATH
      },
      {
        loaders: ['json-loader'],
        include: /\.json$/
      },
      {test: /\.(woff|woff2)(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?name=fonts/[name].[ext]&limit=10000&mimetype=application/font-woff'},
      {test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?name=fonts/[name].[ext]&limit=10000&mimetype=application/octet-stream'},
      {test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file?name=fonts/[name].[ext]'},
      {test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?name=fonts/[name].[ext]&limit=10000&mimetype=image/svg+xml'}

    ]
  },

  plugins: [
    new webpack.NoErrorsPlugin()
  ],
  postcss: function () {
      return [ autoprefixer({ browsers: ['last 2 versions'] })];
  }
};

// add geekpackConf.otherEntries pages
function generateEntryHtmls() {
  var excludeChunks = [];
  var otherEntries = require('./.geekpack.json').otherEntries;
  for (var name in otherEntries) {
    var htmlPlugin = new HtmlwebpackPlugin({
      title: name,
      filename: name+".html",
      chunks: [name]
    });

    common.entry[name] = path.resolve(APP_PATH, otherEntries[name]);
    common.plugins.push(htmlPlugin);
    excludeChunks.push(name);
  };

  var appHtmlPlugin = new HtmlwebpackPlugin({
    title: 'App',
    filename: "index.html",
    template: 'src/htmlTemplate/index.html',
    inject: true,
    excludeChunks: excludeChunks
  });
  common.plugins.push(appHtmlPlugin);
}
generateEntryHtmls();

if(TARGET === 'start' || !TARGET) {
  var config = merge(common, {
    devtool: 'eval-source-map',

    module: {
        loaders: [
          {
            test: /\.less$/,
            loader: 'style!css!postcss!less'
          },
          {
            test: /\.css$/,
            loaders: ['style', 'css', 'postcss']
          }
        ]
    },
    devServer: {
      port: 8088,
      // contentBase: './demo',
      historyApiFallback: true,
      hot: true,
      inline: true,
      progress: true
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.DefinePlugin({
        'DEBUG': JSON.stringify('true')
      }),
    ]
  });

  var node_modules_dir = __dirname + '/node_modules';
  config.addVendor('jquery', node_modules_dir + '/jquery/dist/jquery.min.js');

  exportConfig = config;
}

if(TARGET === 'build' || TARGET === 'stats' ) {
  var vendor = Object.keys(pkg.dependencies);
  vendor = [];

  exportConfig = merge(common, {
    entry: {
      vendor: vendor,
      app: path.resolve(APP_PATH, 'index.js')
    },
    // devtool: 'inline-source-map',

    devtool: 'source-map',
    module: {
      loaders: [
        {
          test: /\.less$/,
          loader: ExtractTextPlugin.extract(
                // activate source maps via loader query
                'css!' +
                'postcss!'+
                'less'
            ),
          // include: APP_PATH
        },
        {
          test: /\.css$/,
          loader: ExtractTextPlugin.extract('style', 'css', 'postcss')
        }
      ]
    },
    plugins: [
      new Clean([BUILD_DIRNAME]),
      // new ExtractTextPlugin('styles.[chunkhash].css'),
      new ExtractTextPlugin('[name].css', { allChunks: true }),
      new webpack.optimize.CommonsChunkPlugin(
        'vendor',
        '[name].js',
        ['vendor', 'app']
        // '[name].[chunkhash].js'
      ),

      new webpack.DefinePlugin({
        'process.env': {
          // This affects react lib size
          'NODE_ENV': JSON.stringify('production')
        }
      }),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      })
    ]
  });
}

// Add posthook
var postConfig = require('./webpack.config.posthook.js');

module.exports = merge(exportConfig, postConfig);
