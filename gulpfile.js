var gulp = require("gulp");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var watchify = require("watchify");
var tsify = require("tsify");
var gutil = require("gulp-util");
var del = require("del");
var uglify = require("gulp-uglify");
var sourcemaps = require("gulp-sourcemaps");
var buffer = require("vinyl-buffer");

var paths = {
    pages: ['src/*.html'],
    libs : ['libs/*.js'],
    resources: ['resources/*']
}

var watchedBrowserify = watchify(browserify({
    baseDir : '.',
    debug:  true,
    entries: ['src/app.ts'],
    cache: {},
    packageCache: {}
}).plugin(tsify));

gulp.task("clean", function() {
    del.sync(["dist/*"]);
})
gulp.task("copy-html", function() {
    return gulp.src(paths.pages)
               .pipe(gulp.dest("dist"))
});

gulp.task("copy-libs", function() {
    return gulp.src(paths.libs)
                .pipe(gulp.dest("dist/scripts"))
});

gulp.task("copy-resources", function() {
    return gulp.src(paths.resources)
               .pipe(gulp.dest("dist/resources"))
})

function bundle() {
    return watchedBrowserify
        .bundle()
        .pipe(source('app.js'))
        //Start of uglify.
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        //end of uglify
        .pipe(gulp.dest("dist/scripts"))
}

gulp.task("default", 
          ["clean", "copy-html", "copy-libs", "copy-resources"], 
          bundle);
watchedBrowserify.on("update", bundle);
watchedBrowserify.on("log", gutil.log);