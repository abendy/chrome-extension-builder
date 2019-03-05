const babel = require('gulp-babel');
const del = require('del');
const { dest, parallel, series, src } = require('gulp');
const { pipeline } = require('readable-stream');

const dirs = {
  src: 'src/scripts',
  dest: 'app/assets/scripts',
};

const clean = cb => del(`${dirs.dest}/*.*`, cb);

const scripts = () => pipeline(
  src(`${dirs.src}/*.js`),
  babel(),
  dest(`${dirs.dest}`),
);

const build = series(clean, scripts);

module.exports = {
  default: build,
  build,
  clean,
  scripts,
};
