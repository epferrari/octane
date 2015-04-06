
	/* In progress */

	var gulp 				= require('gulp');
	var browserify 	= require('browserify');
	var browserSync	= require('browser-sync');
	var watchify		= require('watchify');
	var mergeStream	= require('merge-stream');
	var concat 			= require('gulp-concat');
	var source			= require('vinyl-source-stream');
	var _						= require('lodash');


	var browserifyTask = function(devMode){


	}
	gulp.task('default',function(){});


	gulp.task('concatJS',function(){
		return gulp.src([
							"src/lib/doubleUnder.js",
							"src/octane.js",
							"src/lib/startup_utilities.js",
							"src/modules/**/*.js",
							"!src/modules/debug/**"
					]);

	})
