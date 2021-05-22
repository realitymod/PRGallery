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
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify-es').default;
const rename = require("gulp-rename");

const FILES_TO_COPY = [
    'app/manifest.webmanifest',
    'app/icon/*.*'
];

gulp.task('browserify', function() {

    return browserify('app/index.ts')
        .plugin(tsify)
        .bundle()
        .pipe(source('main.min.js'))
        .pipe(buffer())
        .pipe(uglify(/* options */))
        .pipe(gulp.dest('dist'));
});

gulp.task('serviceworker', function() {

    return browserify('app/service_worker.ts')
        .plugin(tsify)
        .bundle()
        .pipe(source('service_worker.js'))
        .pipe(buffer())
        .pipe(uglify(/* options */))
        .pipe(gulp.dest('dist'))
});

/*
 * Minify and uglify CSS
 */
gulp.task('styles', function() {
    return gulp.src([
            'app/**/*.scss',
        ])
        .pipe(debug())
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(concat("bundle.css"))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest('dist'));
});

/*
 * Minify HTML
 */
gulp.task('minify', function() {
    return gulp.src('app/**/*.html')
        .pipe(debug())
        .pipe(htmlmin({collapseWhitespace: true, removeComments:true}))
        .pipe(gulp.dest('dist'));
});

/*
 *
 */
gulp.task('staticfiles', function() {
    return gulp.src(FILES_TO_COPY,  {base: './app/'}).pipe(gulp.dest('dist'));
});

/*
 *
 */
gulp.task('watch', function() {
    gulp.watch('app/**/*.html', gulp.series('minify'));
    gulp.watch(['app/**/*.ts', '!app/service_worker.ts'], gulp.series('browserify'));
    gulp.watch('app/**/*.scss', gulp.series('styles'));
    gulp.watch('app/service_worker.ts', gulp.series('serviceworker'));
    gulp.watch(FILES_TO_COPY, gulp.series('staticfiles'));
});


/*
 * Run Server
 */
gulp.task('webserver', gulp.series('browserify', 'minify', 'styles', 'staticfiles', 'serviceworker', function() {
    server
        .static('dist', 3000)
        .start();
}));

gulp.task('default', gulp.parallel('webserver', 'watch'));