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
  return src('src/**/*.ts')
    .pipe(prettier({ singleQuote: true }))
    .pipe(
      dest(function (f) {
        return f.base;
      })
    );
};
const tsTask = function () {
  return src('src/**/*.ts')
      .pipe(tsProject())
      .pipe(dest("dist/"))
};


// JS configuration
const jsFormatterTask = function () {
  return src(["dist/**/*.js", "!dist/**/*.min.js"])
    .pipe(prettier({ singleQuote: true }))
    .pipe(
      dest(function (f) {
        return f.base;
      })
    );
};
const jsTask = function () {
  return src(["dist/**/*.js", "!dist/**/*.min.js"])
    .pipe(uglify({ mangle: true, compress: false }))
    .pipe(prettier({ singleQuote: true }))
    .pipe(
      dest(function (f) {
        return f.base;
      })
    )
    .pipe(uglify({ mangle: true, compress: true }))
    .pipe(
      rename({
        extname: ".min.js",
      })
    )
    .pipe(
      dest(function (f) {
        return f.base;
      })
    );
};

const watcherTask = function () {
  watch(
    ["src/**/*.ts"],
    {
      ignoreInitial: true,
    },
    series(tsTask, jsTask)
  );
};

exports.default = series(tsFormatterTask, tsTask, jsFormatterTask, jsTask, watcherTask);
