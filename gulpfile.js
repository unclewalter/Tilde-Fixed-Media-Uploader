var gulp = require('gulp'),
    gp_concat = require('gulp-concat'),
    gp_rename = require('gulp-rename'),
    gp_uglify = require('gulp-uglify');
		sass 			= require('gulp-ruby-sass');

gulp.task('js-fef', function(){
    return gulp.src(['js/src/*.js'])
        .pipe(gp_concat('app.js'))
        .pipe(gulp.dest('js'))
        .pipe(gp_rename('app.js'))
        .pipe(gp_uglify())
        .pipe(gulp.dest('js'));
});

 

gulp.task('sass', function () {
  return sass('sass/app.scss')
    .on('error', sass.logError)
    .pipe(gulp.dest('css'));
});

gulp.task('watch', function () {
   gulp.watch('sass/**/*.scss', ['sass']);
   gulp.watch('js/**/*.js', ['js-fef']);
});

gulp.task('default', ['js-fef', 'sass'], function(){});
