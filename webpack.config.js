const webpack = require('webpack');
const path = require('path');
const ChromeExtensionReloader = require('webpack-chrome-extension-reloader');

const base = {
  entry: {
    background: './src/scripts/background.js',
    content: './src/scripts/content.js',
  },
  output: {
    path: path.join(__dirname, 'app/assets/scripts/'),
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

const development = {
  ...base,
  mode: 'development',
  devtool: 'source-map',
  watch: true,
  module: {
    ...base.module,
  },
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
    new ChromeExtensionReloader({
      port: 9090,
      reloadPage: true,
      entries: {
        contentScript: 'content',
        background: 'background',
      },
    }),
  ],
};

// eslint-disable-next-line no-undef
if (NODE_ENV === 'development') {
  module.exports = development;
} else {
  module.exports = production;
}
