const babel = require('gulp-babel');
const { dest, parallel, series, src } = require('gulp');
const { pipeline } = require('readable-stream');

const dirs = {
  src: 'src/scripts',
  dest: 'app/assets/scripts',
};

const scripts = () => pipeline(
  src(`${dirs.src}/*.js`),
  babel(),
  dest(`${dirs.dest}`),
);

const build = series(scripts);

module.exports = {
  default: build,
  build,
  scripts,
};
