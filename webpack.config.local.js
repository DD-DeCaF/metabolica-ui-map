const webpackCommon = require('./webpack.config.common');
const merge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const path = require('path');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = merge(webpackCommon, {
  devtool: 'inline-source-map',
  entry: {
    main: './src/index.js'
  },
  output: {
    filename: '[chunkhash].[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  node: {
    fs: "empty",
    child_process: "empty"
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: 'head',
      template: './src/index.html',
      filename: 'index.html'
    }),
    new ExtractTextPlugin('[chunkhash].[name].css'),
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor', 'manifest'],
      minChunks: function (module) {
        return module.context
          && module.context.indexOf('node_modules') !== -1
          && module.context.indexOf('metabolica') === -1;
      }
    }),
    new ForkTsCheckerWebpackPlugin(),
  ],
  devServer: {
    historyApiFallback: true,
    proxy: {
      '/api': {
        // Set the following line to the address of the API you want to test against:
        target: 'https://iloop-staging.dd-decaf.eu',
        secure: false,
        changeOrigin: true
      }
    }
  },
});
