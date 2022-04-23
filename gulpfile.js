import gulp from "gulp";
import rename from "gulp-rename";
import uglify from "gulp-uglify";
import prettier from "gulp-prettier";
import documentation from "gulp-documentation";
import ts from "gulp-typescript";
import source from "vinyl-source-stream";
import buffer from "vinyl-buffer";
import rollup from "@rollup/stream";
// Add support for require() syntax
import commonjs from "@rollup/plugin-commonjs";
// Add support for importing from node_modules folder like import x from 'module-name'
import nodeResolve from "@rollup/plugin-node-resolve";

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
    return gulp
        .src("index.ts")
        .pipe(prettier({ singleQuote: true, tabWidth: 4 }))
        .pipe(
            gulp.dest(function (f) {
                return f.base;
            })
        );
};
const tsDocsTask = function () {
    return gulp
        .src("./index.js")
        .pipe(documentation("md", { filename: "api.md" }))
        .pipe(gulp.dest("docs/"));
};
const tsTask = function () {
    return gulp
        .src("index.ts")
        .pipe(tsProject())
        .pipe(
            gulp.dest(function (f) {
                return f.base;
            })
        );
};

// JS configuration
const jsFormatterTask = function () {
    return gulp
        .src("index.js")
        .pipe(prettier({ singleQuote: true, tabWidth: 4 }))
        .pipe(
            gulp.dest(function (f) {
                return f.base;
            })
        );
};
// Cache needs to be initialized outside of the Gulp task
var cache;
const jsRollupTask = function () {
    return (
        rollup({
            // Point to the entry file
            input: "index.js",
            // Apply plugins
            plugins: [
                // babel({ babelHelpers: "bundled" }),
                commonjs(),
                nodeResolve({ browser: true, preferBuiltins: true }),
            ],
            // Use cache for better performance
            cache: cache,
            // Note: these options are placed at the root level in older versions of Rollup
            output: {
                // name to be used to access universally on browser
                name: "BusarmOAuth",
                // Output bundle is intended for use in browsers
                format: "umd",
                // Show source code when debugging in browser
                sourcemap: true,
            },
        })
            .on("bundle", function (bundle) {
                // Update cache data after every bundle is created
                cache = bundle;
            })
            // Name of the output file.
            .pipe(source("index.js"))
            .pipe(buffer())
            .pipe(
                rename({
                    basename: "busarm-oauth",
                })
            )
            .pipe(gulp.dest("dist/"))
    );
};
const jsMinifyTask = function () {
    return gulp
        .src("dist/busarm-oauth.js")
        .pipe(uglify({ mangle: true, compress: true }))
        .pipe(
            rename({
                basename: "busarm-oauth.min",
            })
        )
        .pipe(
            gulp.dest(function (f) {
                return f.base;
            })
        );
};

// Watcher configuration
const watcherTask = function () {
    gulp.watch(
        ["index.ts"],
        {
            ignoreInitial: true,
        },
        gulp.series(
            tsDocsTask,
            tsTask,
            jsFormatterTask,
            jsRollupTask,
            jsMinifyTask
        )
    );
};

const _default = gulp.series(
    tsFormatterTask,
    tsDocsTask,
    tsTask,
    jsFormatterTask,
    jsRollupTask,
    jsMinifyTask,
    watcherTask
);
export { _default as default };
