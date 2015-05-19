
var autoprefixer = require('autoprefixer-core');

module.exports = function(grunt) {

	// plugins
	var load = grunt.loadNpmTasks.bind(grunt);

	load('grunt-contrib-clean');
	load('grunt-contrib-sass');
	load('grunt-contrib-concat');
	load('grunt-contrib-uglify');
	load('grunt-contrib-watch');
	load('grunt-contrib-cssmin');
	load('grunt-contrib-copy');
	load('grunt-bower-concat');
	load('grunt-postcss');
	load('grunt-autoprefixer');
	load('grunt-contrib-jshint');

	grunt.initConfig({

		pkg: 					grunt.file.readJSON('package.json'),
		bower_concat: require("./grunt/config/bower-concat.js"),
		clean: 				require("./grunt/config/clean.js"),
		sass:					require("./grunt/config/sass.js")
		concat: 			require("./grunt/config/concat.js"),
		autoprefixer: require("./grunt/config/autoprefix.js"),
		uglify:				require("./grunt/config/uglify.js"),
		cssmin:				require("./grunt/config/cssmin.js"),
		copy:					require("./grunt/config/copy.js"),
		watch:				require("./grunt/config/watch.js"),
		jshint: 			require("./grunt/config/jslint.js")
	});

	grunt.registerTask('default',['build']);
	grunt.registerTask('dist',[
			'clean:dist', 				// clean dist
			'sass', 							// compile css
			'bower_concat', 			// concat front end dependencies
			'concat', 						// concat all js/css, do not include bower dependencies
			'autoprefixer:dist', 	// post process css with auto prefixer
			'cssmin', 						// minify js into release directory
			'uglify:dist', 				// minify ss into release directory
			'copy:dist', 					// copy assets to release directory
			'clean:example', 			// clean example project octane core files
			'copy:example' 				// copy core files to example project
			/*'jshint' 						//lint */
	]);
	grunt.registerTask('build',[
			'clean:build', 				//clean build directory
			'sass', 							// compile css
			'bower_concat', 			// concat dependencies
			'uglify:build', 			// minify the _bower.js
			'copy:build', 				// copy files to dev dir
			'autoprefixer:build', // post process css with auto prefixer
			'clean:example',			// clean example project octane core files
			'copy:example'				// copy core files to example project
	]);
};
