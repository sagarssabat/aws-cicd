var gulp = require('gulp');
var sass = require('gulp-sass');
var dartsass = require('gulp-dart-sass');
var watch = require('gulp-watch');
var uglifycss = require('gulp-uglifycss');
var run = require('gulp-run-command').default;
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create();

// task to convert sass to minifies css and generate map files resp.
gulp.task('sass', function () {
    return gulp.src('./static-assets/scss/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(dartsass({
            outputStyle: 'compressed'
        }).on('error', sass.logError))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./static-assets/css'));
});
//task to reload the browser once scss/html file is changed
gulp.task('serve', function () {
    browserSync.init({
        injectChanges: true,
        watch: true,
        // server: ["."]
        server: {
            baseDir: "pages",
            routes: {
                "/static-assets": "static-assets"
            }
        }
    });

    gulp.watch(['./static-assets/scss/**/*.scss', './pages/**/*.html'], gulp.series('sass', done => {
        browserSync.reload();
        done();
    }));
});

/* task to paste css in migration - waf location */
gulp.task('copy', run('xcopy  e:\\gitCode\\wm-si-cssandjs\\projects\\lb-Dummy\\static-assets\\css  z:\\Migration-WAF\\SITE\\LB-dummyTeam\\static-assets\\css /e /i /h /y'));

/* task to paste fonts in migration - waf location */
gulp.task('copyfonts', run('xcopy  e:\\gitCode\\wm-si-cssandjs\\projects\\lb-Dummy\\static-assets\\fonts  z:\\Migration-WAF\\SITE\\LB-dummyTeam\\static-assets\\fonts /e /i /h /y'));

//task to generate and watch css for the first time
gulp.task('default', gulp.series('sass', 'serve'));