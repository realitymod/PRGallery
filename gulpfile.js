const gulp = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const tsify = require("tsify");
const htmlmin = require("gulp-htmlmin");
const debug = require("gulp-debug");
const server = require("gulp-live-server");
const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const concat = require("gulp-concat");

gulp.task('browserify', function() {

    return browserify('app/index.ts')
        .plugin(tsify)
        .bundle()
        .pipe(source('main.js'))
        .pipe(gulp.dest('dist'))
});

/*
 * Minify and uglify CSS
 */
gulp.task('styles', function() {
    return gulp.src([
            'app/**/*.scss',
            'node_modules/leaflet/dist/leaflet.css'
        ])
        .pipe(debug())
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(concat("bundle.css"))
        .pipe(gulp.dest('dist'));
});

/*
 * Minify HTML
 */
gulp.task('minify', function() {
    return gulp.src('app/**/*.html')
        .pipe(debug())
        .pipe(htmlmin())
        .pipe(gulp.dest('dist'));
});

/*
 *
 */
gulp.task('watch', function() {
    gulp.watch('app/**/*.html', ['minify']);
    gulp.watch('app/**/*.ts', ['browserify']);
    gulp.watch('app/**/*.scss', ['styles']);
});


/*
 * Run Server
 */
gulp.task('webserver', ['browserify', 'minify', 'styles'], function() {
    server
        .static('dist', 3000)
        .start();
});

gulp.task('default', ['webserver', 'watch']);