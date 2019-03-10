const webpack = require('webpack');
const path = require('path');
const ChromeExtensionReloader = require('webpack-chrome-extension-reloader');
const WebpackNotifierPlugin = require('webpack-notifier');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackShellPlugin = require('webpack-shell-plugin');

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
  devtool: (NODE_ENV === 'development' ? 'source-map' : 'eval'),
  module: {
    rules: [{
      enforce: 'pre',
      test: /\.js$/,
      exclude: /node_modules/,
      use: [
        'eslint-loader',
        'babel-loader',
      ],
    },
    {
      test: /\.(sa|sc|c)ss$/,
      exclude: /node_modules/,
      use: [
        (NODE_ENV === 'development' ? MiniCssExtractPlugin.loader : 'style-loader'),
        'css-loader',
        'sass-loader',
      ],
    }],
  },
};

const development = {
  ...base,
  mode: 'development',
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
    new MiniCssExtractPlugin({
      filename: '../styles/[name].css',
    }),
    new WebpackShellPlugin({
      onBuildStart: [
        'rm -f build/assets/scripts/*',
        'rm -f build/assets/styles/*',
      ],
    }),
    new WebpackNotifierPlugin({ excludeWarnings: true }),
  ],
};

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

module.exports = (NODE_ENV === 'development' ? development : production);
