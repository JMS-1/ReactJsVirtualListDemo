const gulp = require('gulp');
const sass = require('gulp-sass');

gulp.task('build', function () {
    gulp.src('src\\index.scss').pipe(sass()).pipe(gulp.dest('.'));
});

gulp.task('sass:watch', function () {
    gulp.watch('src\\**\\*.scss', ['build']);
});