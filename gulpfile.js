const babel = require('gulp-babel');
const del = require('del');
const { dest, parallel, series, src } = require('gulp');
const named = require('vinyl-named');
const { pipeline } = require('readable-stream');
const watcher = require('gulp').watch;
const webpack = require('webpack-stream');
const webpackConfig = require('./webpack.config.js');

const dirs = {
  src: 'src/scripts',
  dest: 'app/assets/scripts',
};

const clean = cb => del(`${dirs.dest}/*.*`, cb);

const scripts = () => pipeline(
  src(`${dirs.src}/*.js`),
  named(),
  webpack(webpackConfig),
  dest(`${dirs.dest}`),
);

const watch = () => watcher(`${dirs.src}/*.js`, scripts);

const build = series(clean, scripts);

module.exports = {
  default: build,
  build,
  clean,
  scripts,
  watch,
};
