const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
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
      { 
        test: /\.tsx?$/,
        loader: "ts-loader",
        include: [
          path.resolve(__dirname, 'src'),
          // __dirname,
          // Not sure if this one's needed?
          // path.dirname(require.resolve('metabolica')),
        ]
      }
    ]
  },
}

