import gulp from "gulp";
import rename from "gulp-rename";
import uglify from "gulp-uglify";
import prettier from "gulp-prettier";
import ts from "gulp-typescript";

// TS configuration
var tsProject = ts.createProject({
    declaration: true,
    module: "es6",
    target: "es6",
    moduleResolution: "node",
    noImplicitAny: true,
    noEmitOnError: false,
});
const tsFormatterTask = function () {
    return gulp.src("index.ts")
        .pipe(prettier({ singleQuote: true, tabWidth: 4 }))
        .pipe(
            gulp.dest(function (f) {
                return f.base;
            })
        );
};
const tsTask = function () {
    return gulp.src("index.ts")
        .pipe(tsProject())
        .pipe(
            gulp.dest(function (f) {
                return f.base;
            })
        );
};

// JS configuration
const jsFormatterTask = function () {
    return gulp.src("index.js")
        .pipe(prettier({ singleQuote: true, tabWidth: 4 }))
        .pipe(
            gulp.dest(function (f) {
                return f.base;
            })
        );
};
const jsTask = function () {
    return gulp.src("index.js")
        .pipe(uglify({ mangle: true, compress: false }))
        .pipe(prettier({ singleQuote: true }))
        .pipe(
            rename({
                basename: "busarm-oauth",
            })
        )
        .pipe(gulp.dest("dist/"))
        .pipe(uglify({ mangle: true, compress: true }))
        .pipe(
            rename({
                basename: "busarm-oauth.min",
            })
        )
        .pipe(gulp.dest("dist/"));
};

// Watcher configuration
const watcherTask = function () {
    gulp.watch(
        ["index.ts"],
        {
            ignoreInitial: true,
        },
        gulp.series(tsTask, jsFormatterTask, jsTask)
    );
};

const _default = gulp.series(
    tsFormatterTask,
    tsTask,
    jsFormatterTask,
    jsTask,
    watcherTask
);
export { _default as default };
