module.exports = function(grunt) {

	// plugins
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-bower-concat');
	grunt.loadNpmTasks('grunt-html-build');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	var imageGlob = [
		"**/*.jpg",
		"**/*.jpeg",
		"**/*.png",
		"**/*.gif"
	];

	// octane core js and modules
	// build are un-uglified/concated for for debugging
	var octane = (function(){
		var core = "src/octane_core/";
		return {
			dist : {
				js 	: [core+"dist/assets/js/octane-min.js"],
				css : [core+"dist/assets/css/octane-min.css"],
				images: core+"/dist/assets/img/"
			},
			build : {
				js : [
					core+"build/assets/js/doubleUnder.js",
					core+"build/assets/js/octane.js",
					core+"build/assets/js/**/*.js",
					"!"+core+"build/assets/js/_bower.js"
				],
				css : [core+"dist/assets/css/octane.css"],
				images : core+"dist/assets/img/"
			},
			init : "src/octane-initialize.js"
		}
	})();

	var src = (function(){
			var modules = "src/octane_modules/";
			var assets = "src/assets/";
			return{
				html:{
					loading: 	"src/loading.html",
					index: 		"src/index.html",
					modals: 	[modules+"**/*/modals/*.html"],
					views: 		[modules+"**/*/views/*.html"],
					templates:[modules+"**/*/templates/*.html"]
				},
				js:{
					bower: 	assets+"js/_bower.js",
					concatMe: [
						octane.dist.js,
						[modules+"**/*.js"],
						octane.init
					]
				},
				css	:{
					dir: 		assets+"/css/",
					main: 	assets+"css/app.css",
					bower: 	assets+"css/_bower.css",
					concatMe:[
						octane.dist.css,
						[assets+"**/*.css"]
					]
				},
				scss: 		assets+"scss/app.scss",
				images: 	assets+"img/",
				fonts:  	assets+"fonts/",
				endpoints:[modules+"**/*/endpoints/*.php"],
				watchMe:[
					modules+"**/*.js",
					"src/**/*.scss",
					"!"+assets+"js/_bower.js"
				]
		};
	})();

	var build = (function(){
		return {
			html : {
				index: "build/index.html"
			},
			js :{
				bower: 	"build/assets/js/_bower.js",
				main: 	"build/assets/js/<%= pkg.name %>.js",
				dir: 		"build/assets/js/",
				bundle: [
					"build/assets/js/_bower.js",
					"build/assets/js/octane_core/doubleUnder.js",
					"build/assets/js/octane_core/octane.js",
					"build/assets/js/octane_core/*.js",
					"build/assets/js/octane_modules/**/*.js",
					"build/octane-initialize.js"
				]
			},
			css: {
				dir: 		"build/assets/css/",
				bower: 	"build/assets/css/_bower.css"
			},
			images: 	"build/assets/img/",
			fonts: 		"build/assets/fonts/"
		};
	})();


	var dist = (function(){

		return {
			 html: {
				index: "dist/index.html"
			},
			js: {
				dir: 		"dist/assets/js/",
				bower: 	"dist/assets/js/_bower.js",
				main: 	"dist/assets/js/<%= pkg.name %>.js",
				mini: 	"dist/assets/js/<%= pkg.name %>-min.js"
			},
			css: {
				dir: 		"dist/assets/css/",
				bower: 	"dist/assets/css/_bower.css",
				main: 	"dist/assets/css/<%= pkg.name %>.css",
				mini: 	"dist/assets/css/<%= pkg.name %>-min.css"
			},
			images: 	"dist/assets/img/",
			fonts: 		"dist/assets/fonts/",
			endpoints:"dist/endpoints/"
		};
	})();

		// Project configuration.
	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		bower_concat:{
						all:{
							options:{
								separator: ';',
							},
							dest	:	src.js.bower,
							cssDest	:	src.css.bower,
							dependencies:{
								"lodash"	:	"jquery",
								"velocity"	:	"jquery",
								"bootstrap"	:	"jquery",
							},
							mainFiles:{
								"velocity" : ["velocity.min.js","velocity.ui.min.js"],
								"history.js":"scripts/bundled/html4+html5/jquery.history.js"
							}
						}
					},

		clean:      {
						build: 		['build'],
						dist: 		['dist'],
						staging: 	['staging'],
						cordova: 	['cordova/www']
					},

		// compile sass files into src/css
		sass:		{
						all:{
							files : [{
								src		: src.scss,
								dest	: src.css.main
							}]
						}
					},

		// concat js and css files and save them to staging/
		// staged for minification
		concat:     {
						js:{
							options :{
								separator: ';'
							},
							src	: [
								src.js.bower,
								src.js.concatMe
							],
							dest : dist.js.main
						},
						css:{
							src	: [
								src.css.bower,
								src.css.concatMe
							],
							dest : dist.css.main
						}
					},

		// take concatenated files in staging/js,
		// minify, and save them in release/js
		uglify:		{
						dist:{
							options:{
								mangle:true,
								beautify:false,
								banner:'/* <%= pkg.name %> - <%pkg.version %> - '+'<%= grunt.template.today("yyyy-mm-dd") %>*/'
							},
							files:[{
								src:[ dist.js.main],
								dest: dist.js.mini
							}],
						},
						// only uglify bower for testing build
						build:{
							options:{
								mangle:true,
								beautify:false,
								banner:'/* <%= pkg.name %> - <%pkg.version %> - '+'<%= grunt.template.today("yyyy-mm-dd") %>*/'
							},
							files:[{
								src: src.js.bower,
								dest: build.js.bower
							}]
						}
					},

		// take compiled and concatenated
		// minify, and save in dist/css
		cssmin:		{
						dist:{
							files:[{
								src: 		[ dist.css.main ],
								dest: 	dist.css.mini
							}]
						}
					},

		copy:		{
						dist:{
							files:[
							// app fonts
							{
								expand: 	true,
								flatten: 	true,
								cwd: 			src.fonts,
								src: 			['*'],
								dest: 		dist.fonts
							},
							// twitter bootstrap fonts
							{
								expand: 	true,
								flatten: 	true,
								cwd: 			"bower_components/bootstrap/fonts/",
								src: 			["*"],
								dest: 		dist.fonts
							},
							// font awesome fonts
							{
								expand: 	true,
								cwd: 			"bower_components/fontawesome/fonts/",
								src: 			["*"],
								dest: 		dist.fonts
							},
							// octane core image directory
							{
								expand: 	true,
								flatten: 	true,
								cwd: 			octane.dist.images,
								src: 			imageGlob,
								dest: 		dist.images
							},{
							// main app image directory
								expand: 	true,
								flatten: 	true,
								cwd: 			src.images,
								src: 			imageGlob,
								dest: 		dist.images
							},{
							// images included in app modules
								expand: 	true,
								flatten: 	true,
								cwd: 			"src/octane_modules/",
								src: 			imageGlob,
								dest: 		dist.images
							},
							// server endpoints defined in app modules
							{
								expand: 	true,
								flatten: 	true,
								src: 			src.endpoints,
								dest: 		dist.endpoints
							}]
						},
						build:{
							files:[
							// copy unconcatenated js files
							{
								expand: 	true,
								flatten: 	true,
								src: 			src.js.bower,
								dest:     build.js.dir
							},
							{
								expand: 	true,
								flatten: 	true,
								src: 			octane.build.js,
								dest: 		build.js.dir+"/octane_core/"
							},
							// modules
							{
								expand: 	true,
								flatten: 	false,
								cwd: 			'src/octane_modules/',
								src:  		["**/*.js" ],
								dest: 		build.js.dir+"/octane_modules/"
							},
							// octane initialize.js
							{
								flatten: 	true,
								expand: 	true,
								src: 			octane.init,
								dest: 		'build'
							},
							 // copy unconcatenated css files
							{
								flatten: 	true,
								expand: 	true,
								src: 			[src.css.concatMe],
								dest: 		build.css.dir
							},
							// copy fonts
							{
								expand: 	true,
								cwd: 			"bower_components/fontawesome/fonts/",
								src: 			["*"],
								dest: 		build.fonts
							},{
								expand: 	true,
								cwd: 			"bower_components/bootstrap/fonts/",
								src: 			["*"],
								dest: 		build.fonts
							},{
								expand: 	true,
								cwd: 			src.fonts,
								src: 			['*'],
								dest: 		build.fonts
							},
							// copy images
							{
								expand: 	true,
								flatten: 	true,
								cwd: 			src.images,
								src: 			imageGlob,
								dest: 		build.images
							},{
								expand: 	true,
								flatten: 	true,
								cwd: 			"src/assets/video/",
								src: 			"*.mp4",
								dest: 		"build/assets/video/"
							},{
								expand: 	true,
								flatten: 	true,
								cwd: 			octane.build.images,
								src: 			imageGlob,
								dest: 		build.images
							},{
								expand: 	true,
								flatten: 	true,
								cwd: 			"src/octane_modules/",
								src: 			imageGlob,
								dest: 		build.images
							}]
						},
						cordovaBuild: {
							files:[{
								expand: 	true,
								flatten: 	false,
								cwd: 			'build/',
								src: 			['**/*'],
								dest: 		'cordova/www/'
							}]
						},
						cordovaDist: {
							files:[{
								expand: 	true,
								flatten: 	false,
								cwd: 			'dist/',
								src: 			['**/*'],
								dest: 		'cordova/www/'
							}]
						}
					},

		htmlbuild: {
						dist: {
							src: 							src.html.index,
							dest: 						dist.html.index,
							options:{
								beautify: true,
								relative: true,
								prefix: 	"",
								scripts: 		{ bundle: [ dist.js.mini ] },
								styles: 		{ bundle: [ dist.css.mini ] },
								sections:{
									views: 				src.html.views,
									layout:{
										modals: 		src.html.modals,
										loading: 		src.html.loading,
										templates: 	src.html.templates
									}
								}
							}
						},
						build : {
							src: 							src.html.index,
							dest: 						build.html.index,
							options:{
								beautify: true,
								relative: true,
								prefix: 	"",
								scripts: 		{ bundle: build.js.bundle },
								styles: 		{ bundle:[ build.css.dir+"/*" ]	},
								sections:{
									views: 				src.html.views,
									layout:{
										modals: 		src.html.modals,
										loading: 		src.html.loading,
										templates: 	src.html.templates
									}
								}
							}
						}

					},

		htmlmin:{
						options:{
							removeComments:true,
							collapseWhitespace:true,
							preserveLineBreaks:true
						},
						release:{
							files:[{
								src: [ dist.html.index ],
								dest: dist.html.index
							}]
						}
					},

		watch:{
						options:{
							livereload:true
						},
						files:[
							src.watchMe,
							src.html.index,
							src.html.views,
							src.html.layout
						],
						tasks:['build']
					}
	});

	// Default task(s).
	grunt.registerTask('default',['build']);

	// other task(s)
	grunt.registerTask('dist', [

		// clean staging directory
		// clean release directory
			'clean:dist',

		// compile css
			'sass',

		// concat dependencies
			'bower_concat',

		// concat all js/css into staging directory
			'concat',

		// minify js/css into release directory
			'cssmin',
			'uglify:dist',

		// copy assets to release directory
			'copy:dist',

		// build and minify html
			'htmlbuild:dist',

		// copy all files to cordova
			'clean:cordova',
			'copy:cordovaDist',

		// clean out staging dir
			'clean:staging'
	]);

	grunt.registerTask('build', [

		// clean staging directory
			'clean:build',

		// compile css
			'sass',

		// concat dependencies
			'bower_concat',

		// minify the _bower.js
			'uglify:build',

		// copy files to build dir
			'copy:build',

		// build and minify html
			'htmlbuild:build',

		// copy all files to cordova
			'clean:cordova',
			'copy:cordovaBuild',

		// clean out staging dir
			'clean:staging'
	]);

};
