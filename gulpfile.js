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

gulp.task('browserify', function() {

    return browserify('app/index.ts')
        .plugin(tsify)
        .bundle()
        .pipe(source('main.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task("uglify", gulp.series("browserify", function () {
    return gulp.src("dist/main.js")
        .pipe(rename("main.min.js"))
        .pipe(uglify(/* options */))
        .pipe(gulp.dest("dist/"));
}));


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
gulp.task('watch', function() {
    gulp.watch('app/**/*.html', gulp.series('minify'));
    gulp.watch('app/**/*.ts', gulp.series('uglify'));
    gulp.watch('app/**/*.scss', gulp.series('styles'));
});


/*
 * Run Server
 */
gulp.task('webserver', gulp.series('uglify', 'minify', 'styles', function() {
    server
        .static('dist', 3000)
        .start();
}));

gulp.task('default', gulp.parallel('webserver', 'watch'));