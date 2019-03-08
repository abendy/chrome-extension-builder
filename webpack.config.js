const webpack = require('webpack');
const path = require('path');
const ChromeExtensionReloader = require('webpack-chrome-extension-reloader');

const { NODE_ENV = 'development' } = process.env;

const base = {
  entry: {
    background: './src/scripts/background.js',
    content: './src/scripts/content.js',
    popup: './src/scripts/popup.js',
    options: './src/scripts/options.js',
  },
  output: {
    path: path.join(__dirname, 'build/assets/scripts/'),
    filename: '[name].js',
  },
  module: {
    rules: [{
      enforce: 'pre',
      test: /\.js$/,
      exclude: /node_modules/,
      use: 'eslint-loader',
    },
    {
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
      },
    }],
  },
};

// eslint-disable-next-line no-unused-vars
const development = {
  ...base,
  mode: 'development',
  devtool: 'source-map',
  watch: true,
  module: {
    ...base.module,
  },
  plugins: [
    new ChromeExtensionReloader({
      port: 9090,
      reloadPage: true,
      entries: {
        background: 'background',
        contentScript: 'content',
        popup: 'popup',
        options: 'options',
      },
    }),
  ],
};

// eslint-disable-next-line no-unused-vars
const production = {
  ...base,
  mode: 'production',
  module: {
    ...base.module,
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
    }),
  ],
};

module.exports = NODE_ENV;
