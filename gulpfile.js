var gulp = require('gulp');

var concat = require('gulp-concat');
var order = require('gulp-order');


function build() {
	return gulp.src('src/*.js')
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
			"touchmodule.js",
			"game.js",
			"index.js"
		]))
		.pipe(concat("asteroids.js"))
		.pipe(gulp.dest('.'));
}

function watch() {
	return gulp.watch('src/*.js', gulp.series(build));
}

gulp.task('build', gulp.series(build));
gulp.task('watch', gulp.series(watch));
