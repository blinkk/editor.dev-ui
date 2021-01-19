const {dest, series, src, watch} = require('gulp');
const gulpAutoprefixer = require('gulp-autoprefixer');
const rename = require('gulp-rename');
const sass = require('gulp-sass');

const config = {
  SASS_SOURCE_DIR: './sass/**/*.{sass,scss}',
  SASS_SOURCES: [
    './sass/**/*.{sass,scss}',
    './node_modules/@material/**/*.{sass,scss}',
  ],
  SASS_OUT_DIR: './dist/css/',
};

const compileSass = () => {
  return src(config.SASS_SOURCE_DIR)
    .pipe(
      sass({
        outputStyle: 'compressed',
        includePaths: ['node_modules'],
      })
    )
    .on('error', sass.logError)
    .pipe(
      rename(path => {
        path.basename += '.min';
      })
    )
    .pipe(gulpAutoprefixer())
    .pipe(dest(config.SASS_OUT_DIR));
};

const watchSass = () => {
  return watch(config.SASS_SOURCES, compileSass);
};

exports.compile = compileSass;
exports.watch = series(compileSass, watchSass);
