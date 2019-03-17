const webpack = require('webpack');
const path = require('path');
const WebpackShellPlugin = require('webpack-shell-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ChromeExtensionReloader = require('webpack-chrome-extension-reloader');
const WebpackNotifierPlugin = require('webpack-notifier');

const { NODE_ENV = 'development' } = process.env;

const base = {
  entry: {
    background: './src/scripts/background.js',
    content: [
      './src/scripts/content.js',
      './src/styles/content.scss',
    ],
    popup: [
      './src/scripts/popup.jsx',
      './src/styles/popup.scss',
    ],
    options: [
      './src/scripts/options.jsx',
      './src/styles/options.scss',
    ],
  },
  output: {
    path: path.join(__dirname, 'build/assets/scripts/'),
    filename: '[name].js',
  },
  module: {
    rules: [{
      enforce: 'pre',
      test: /\.js(x)*$/,
      exclude: /node_modules/,
      use: [
        'eslint-loader',
      ],
    },
    {
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      options: {
        cacheDirectory: true,
        presets: [
          '@babel/preset-env',
        ],
      },
    },
    {
      test: /\.jsx$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      options: {
        cacheDirectory: true,
        presets: [
          '@babel/preset-react',
        ],
      },
    },
    {
      test: /\.(sa|sc|c)ss$/,
      exclude: /node_modules/,
      use: [
        (NODE_ENV === 'development' ? MiniCssExtractPlugin.loader : 'style-loader'),
        'css-loader',
        'sass-loader',
      ],
    },
    {
      test: /\.(png|jp(e*)g|svg)$/,
      use: [{
        loader: 'url-loader',
        options: {
          limit: 8000, // Convert images < 8kb to base64 strings
          name: 'images/[hash]-[name].[ext]',
        },
      }],
    }],
  },
};

const development = {
  ...base,
  mode: 'development',
  watch: true,
  devtool: 'source-map',
  module: {
    ...base.module,
  },
  plugins: [
    new WebpackShellPlugin({
      onBuildStart: [
        'rm -fr build/assets/**/*',
      ],
    }),
    new CopyPlugin([
      { from: './src/manifest.json', to: '../..' },
      {
        from: './src/**/*.html',
        to: '../..',
        flatten: true,
      },
      { from: './src/images', to: '../images' },
    ]),
    new MiniCssExtractPlugin({
      filename: '../styles/[name].css',
      chunkFilename: '[id].css',
    }),
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
