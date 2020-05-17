var gulp = require('gulp');
var sass = require('gulp-sass');
var dartsass = require('gulp-dart-sass');
var watch = require('gulp-watch');
var uglifycss = require('gulp-uglifycss');
var run = require('gulp-run-command').default;
var sourcemaps = require('gulp-sourcemaps');
var awspublish = require("gulp-awspublish");
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
/* task to deploy on s3 bucket according to environment (dev,beta,prod) */
gulp.task("publish", function (done) {
    var env = process.argv[process.argv.length - 1];
    env = env.replace('--', '');
    if (env != 'prod' && env != 'beta' && env != 'dev') {
        console.log('unknown environment');
        done();
        return;
    }

    if (process.env.MYACCESSKEYID == undefined || process.env.MYSECRETACCESSKEY == undefined) {
        console.log("It Seems you dont have Access Key And Secret Key....");
        console.log("Please Contact Sagar");
        done();
        return;
    }

    var publisher = awspublish.create({
        params: {
            Bucket: process.env.BUCKET
        },
        accessKeyId: process.env.MYACCESSKEYID,
        secretAccessKey: process.env.MYSECRETACCESSKEY
    });
    console.log(accessKeyId);
    // define custom headers
    var headers = {
        "Cache-Control": "private"
    };
    return (
        gulp
        // .src("./static-assets/css/**/*.{css,map}")
        .src("./static-assets/{css,fonts,images}/**/*")
        .pipe(
            rename(function (path) {
                path.dirname = '/' + env + '/static-assets/' + path.dirname;
            })
        )
        // publisher will add Content-Length, Content-Type and headers specified above
        // If not specified it will set x-amz-acl to public-read by default
        .pipe(publisher.publish(headers))
        // create a cache file to speed up consecutive uploads
        .pipe(publisher.cache())
        // print upload updates to console
        .pipe(awspublish.reporter())
    );
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