const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpack = require('webpack');


module.exports = function () {
  return {
    devtool: 'source-map',
    entry: {
      main: './src/index.js'
    },
    output: {
      filename: '[chunkhash].[name].js',
      path: path.resolve(__dirname, 'dist')
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js']
    },
    node: {
      fs: "empty",
      child_process: "empty"
    },
    plugins: [
      new webpack.optimize.CommonsChunkPlugin({
        names: ['vendor', 'manifest'],
        minChunks: function (module) {
          return module.context
            && module.context.indexOf('node_modules') !== -1
            && module.context.indexOf('metabolica') === -1;
        }
      }),
      new ExtractTextPlugin('[chunkhash].[name].css'),
      new HtmlWebpackPlugin({
        inject: 'head',
        template: './src/index.html',
        filename: 'index.html'
      })
    ],
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ExtractTextPlugin.extract({
            loader: 'css-loader'
          })
        },
        {
          test: /\.scss$/,
          use: ExtractTextPlugin.extract({
            use: [{
              loader: 'css-loader'
            }, {
              loader: 'sass-loader'
            }]
          })
        },
        {
          test: /\.js$/,
          include: [
            path.resolve(__dirname, 'src'),
            path.dirname(require.resolve('metabolica'))
          ],
          loader: 'babel-loader',
          query: {
            presets: ['es2015', 'stage-0'],
            plugins: [
              'transform-runtime'
            ]
          }
        },
        {
          test: /\.html$/,
          loader: 'html-loader'
        },
        {
          test: /\.(jpe?g|png|svg)$/,
          loader: 'file-loader?name=[path][name].[ext]'
        },
        { 	test: /\.tsx?$/,
          loader: "ts-loader",
          include: [
            path.resolve(__dirname, 'src'),
            __dirname
          ]
        }
      ]
    },
    devServer: {
      historyApiFallback: true,
      proxy: {
        '/api': {
          // Set the following line to the address of the API you want to test against:
          target: 'https://data.dd-decaf.eu',
          secure: false,
          changeOrigin: true
        }
      }
    }
  }
};
