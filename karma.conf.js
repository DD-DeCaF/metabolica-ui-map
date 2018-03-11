const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.common.js');

// Karma configuration
// Generated on Thu Jul 06 2017 08:19:42 GMT+0200 (CEST)

module.exports = function (config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    // Source: https://github.com/webpack-contrib/karma-webpack#usage
    // list of files / patterns to load in the browser
    files: [
      { pattern: './src/index.js', watched: false },
      { pattern: './node_modules/angular-mocks/angular-mocks.js', watched: false },
      { pattern: './src/**/*.spec.ts', watched: false },
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      './src/index.js': ['webpack', 'sourcemap'],
      './src/**/*.spec.ts': ['webpack', 'sourcemap'],
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],

    devtool: 'source-map',

    mime: {
      'text/x-typescript': ['ts', 'tsx']
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    // Not used by the npm scripts, as they are overwrittent there.
    browsers: ['ChromeHeadless', 'Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    webpack: webpackConfig,

    // Source: https://github.com/webpack-contrib/karma-webpack#usage
    webpackMiddleware: {
      // webpack-dev-middleware configuration
      // i. e.
      stats: 'errors-only'
    },

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
