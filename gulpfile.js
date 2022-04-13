const { src, dest, watch, series, parallel } = require("gulp");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify");
const prettier = require("gulp-prettier");
const ts = require('gulp-typescript');

// TS configuration
var tsProject = ts.createProject({
  declaration: true,
  module: 'es6',
  target: 'es6',
  moduleResolution: 'node',
  noImplicitAny: true,
  noEmitOnError: false
});
const tsFormatterTask = function () {
  return src('index.ts')
    .pipe(prettier({ singleQuote: true }))
    .pipe(
      dest(function (f) {
        return f.base;
      })
    );
};
const tsTask = function () {
  return src('index.ts')
      .pipe(tsProject())
      .pipe(
        dest(function (f) {
          return f.base;
        })
      );
};


// JS configuration
const jsFormatterTask = function () {
  return src('index.js')
    .pipe(prettier({ singleQuote: true }))
    .pipe(
      dest(function (f) {
        return f.base;
      })
    );
};
const jsTask = function () {
  return src('index.js')
    .pipe(uglify({ mangle: true, compress: false }))
    .pipe(prettier({ singleQuote: true }))
    .pipe(
      rename({
        basename: "busarm-oauth",
      })
    )
    .pipe(dest("dist/"))
    .pipe(uglify({ mangle: true, compress: true }))
    .pipe(
      rename({
        basename: "busarm-oauth.min",
      })
    )
    .pipe(dest("dist/"));
};


// Watcher configuration
const watcherTask = function () {
  watch(
    ['index.ts'],
    {
      ignoreInitial: true,
    },
    series(tsTask, jsFormatterTask, jsTask)
  );
};

exports.default = series(tsFormatterTask, tsTask, jsFormatterTask, jsTask, watcherTask);
