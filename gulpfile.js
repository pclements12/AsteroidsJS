var gulp = require('gulp');

var concat = require('gulp-concat');
var watch = require('gulp-watch');
var order = require('gulp-order');

gulp.task('compress', function() {
  gulp.src('scripts/*.js')
	.pipe(order([
		"utils.js",
		"spaceobject.js",
		"alienship.js",
		"asteroid.js",
		"explosion.js",
		"smoke.js",
		"power.js",
		"powerup.js",
		"missile.js",
		"spaceship.js",
		"game.js",
		"asteroids.js"
	 ]))
	.pipe(concat("asteroids.js"))
    .pipe(gulp.dest('.'))
});

gulp.task('default', function() {
	gulp.watch('scripts/*.js', ['compress']);
});
