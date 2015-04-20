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

	// Octane core .js and modules
	// dev are un-uglified/concated for for debugging

	var octane = (function(){

		var core = "src/octane_core";
		var dist = core+"/dist/assets";
		var build = core+"/build/assets";
		return {

			dist : {
				js 			: [ dist+"/js/octane-min.js" ],
				css 		: [ dist+"/css/octane-min.css" ],
				img 		: {	dir : dist+"/img/" }
			},

			build : {
				js 			: [
					build+"/js/doubleUnder.js",
					build+"/js/octane.js",
					build+"/js/**/*.js",
					"!"+build+"/js/_bower.js"
									],
				css 		: [ dist+"/css/octane.css" ],
				img 		: { dir : dist+"/img/" }
			},

			init 			: "src/octane-initialize.js"

		};
	})();

	var src = (function(){

		var modules = "src/octane_modules";
		var assets	= "src/assets";
		return {

			html:{
				index 			: "src/index.html",
				sections : {
					header		: [ assets+"/layout/_header.html"],
					loading		: [ assets+"/layout/_loading.html"],
					views			: [
												assets+"/views/*.html",
												modules+"/**/*/views/html"
											],
					modals 		: [ modules+"/**/*/modals/*.html"],
					footer 		: [ assets+"/layout/_footer.html" ],
					templates : [ modules+"/**/*/templates/*.html"]
				}
			},

			js : {
				watchMe	: [
										[ modules+"/**/*.js" ],
										"!"+assets+"/js/_bower.js"
									],
				bower		: assets+"/js/_bower.js",
				concatMe: [
										octane.dist.js,
										[modules+"/**/*.js"],
										octane.init
									]
			},

			css	: {
				dir			: assets+"/css/",
				main		: assets+"/css/app.css",
				bower		: assets+"/css/_bower.css",
				concatMe: [
										octane.dist.css,
										[ assets+"/**/*.css" ]
									]
			},

			img	: {
				dir			: assets+"/img/",
				modules	: modules+"/"
			},

			fonts	: {
				dir			: assets+"/fonts/"
			},

			scss : {
				watchMe	: ["src/**/*.scss"],
				main		: assets+"/scss/app.scss"
			},

			endpoints : [ modules+"/**/*/endpoints/*.php" ],

		};
	})();

	var build = (function(){

		var assets = "build/assets";
		return {

			html :{
				index		: "build/index.html"
			},

			js :{
				bower		: assets+"/js/_bower.js",
				main		: assets+"/js/<%= pkg.name %>.js",
				dir 		: assets+"/js/",
				bundle	: [
										assets+"/js/_bower.js",
										assets+"/js/octane/doubleUnder.js",
										assets+"/js/octane/octane.js",
										assets+"/js/octane/*.js",
										assets+"/js/modules/**/*.js",
										assets+"/js/widgets/**/*.js",
										"build/octane-initialize.js"
									]
			},

			css	:{
				dir			: assets+"/css/",
				bower		: assets+"/css/_bower.css"
			},

			img	:{
				dir			: assets+"/img/"
			},

			fonts :{
				dir			: assets+"/fonts/"
			}
		};
	})();


	 var dist = (function(){

			var assets = "dist/assets";
			return {

				html : {
					index		: "dist/index.html"
				},

				js :{
					dir 		: assets+"/js/",
					bower		: assets+"/js/_bower.js",
					main		: assets+"/js/<%= pkg.name %>.js",
					mini		: assets+"/js/<%= pkg.name %>-min.js"
				},

				css	:{
					dir			: assets+"/css/",
					bower		: assets+"/css/_bower.css",
					main		: assets+"/css/<%= pkg.name %>.css",
					mini		: assets+"/css/<%= pkg.name %>-min.css"
				},

				img	:{
					dir			: assets+"/img/"
				},

				fonts:{
					dir			: assets+"/fonts/"
				},

				endpoints:{
					dir			: "dist/endpoints/"
				}
			};
	})();

		// Project configuration.
	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		bower_concat:{
						options:{
							separator: ';'
						},
						all:{
							options:{
								separator: ';'
							},
							dest		:	src.js.bower,
							cssDest	:	src.css.bower,
							dependencies:{
								"lodash"		:	"jquery",
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
						build			: ['build'],
						dist			: ['dist'],
						staging 	: ['staging'],
						cordova		: ['cordova/www']
					},

		// compile sass files into src/css
		sass:		{
						all:{
							files : [{
								src		: src.scss.main,
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
						// only uglify bower during development
						build:{
							options:{
								mangle:true,
								beautify:false,
								banner:'/* <%= pkg.name %> - <%pkg.version %> - '+'<%= grunt.template.today("yyyy-mm-dd") %>*/'
							},
							files:[{
								src: 	src.js.bower,
								dest: build.js.bower
							}]
						}
					},

		// take compiled and concatenated
		// minify, and save in dist/css
		cssmin:		{
						dist:{
							files:[{
								src:[ dist.css.main ],
								dest: dist.css.mini
							}]
						}
					},

		copy:		{
						dist:{
							files:[
							// app fonts
							{
								expand:true,
								flatten : true,
								cwd			: src.fonts.dir,
								src			: ['*'],
								dest		: dist.fonts.dir
							},
							// twitter bootstrap fonts
							{
								expand	: true,
								flatten : true,
								cwd			: "bower_components/bootstrap/fonts/",
								src			: ["*"],
								dest		: dist.fonts.dir
							},
							// font awesome fonts
							{
								expand	: true,
								cwd			: "bower_components/fontawesome/fonts/",
								src			: ["*"],
								dest		: dist.fonts.dir
							},
							// octane core image directory
							{
								expand	: true,
								flatten : true,
								cwd			: octane.dist.img.dir,
								src			: imageGlob,
								dest		: dist.img.dir
							},{
							// main app image directory
								expand	: true,
								flatten : true,
								cwd			: src.img.dir,
								src			: imageGlob,
								dest		: dist.img.dir
							},{
							// images included in app modules
								expand	: true,
								flatten : true,
								cwd			: src.img.modules,
								src			: imageGlob,
								dest		: dist.img.dir
							},
							// server endpoints defined in app modules
							{
								expand	: true,
								flatten : true,
								src			: src.endpoints,
								dest		: dist.endpoints.dir
							}]
						},


						build:{
							files:[
							// copy unconcatenated js files
							{
								expand	: true,
								flatten	: true,
								src			: src.js.bower,
								dest		: build.js.dir
							},
							{
								expand	: true,
								flatten	: true,
								src			: octane.build.js,
								dest		: build.js.dir+"/octane/"
							},
							// modules
							{
								expand	: true,
								flatten	: false,
								cwd			: 'src/octane_modules/',
								src			: ["**/*.js" ],
								dest		: build.js.dir+"/octane_modules/"
							},
							// octane initialize.js
							{
								flatten	: true,
								expand	: true,
								src			: octane.init,
								dest		: 'build'
							},
							 // copy unconcatenated css files
							{
								flatten	: true,
								expand	: true,
								src			: [src.css.concatMe],
								dest		: build.css.dir
							},{
								expand	:true,
								cwd			: src.fonts.dir,
								src			: ['*'],
								dest		: build.fonts.dir
							},{
								expand	: true,
								cwd			: "bower_components/fontawesome/fonts/",
								src			: ["*"],
								dest		: src.fonts.dir
							},
							{
								expand	: true,
								cwd			: "bower_components/bootstrap/fonts/",
								src			: ["*"],
								dest		: src.fonts.dir
							},{
								expand	: true,
								flatten : true,
								cwd			: src.img.dir,
								src			: imageGlob,
								dest		: build.img.dir
							},
							{
								expand	: true,
								flatten : true,
								cwd			: octane.build.img.dir,
								src			: imageGlob,
								dest		: build.img.dir
							},{
								expand	: true,
								flatten : true,
								cwd			: src.img.modules,
								src			: imageGlob,
								dest		: build.img.dir
							}]
						},
						cordovaDev : {
							files:[{
								expand 	: true,
								flatten : false,
								cwd			: 'build/',
								src			: ['**/*'],
								dest		: 'cordova/www/'
							}]
						},
						cordovaDist : {
							files:[{
								expand 	: true,
								flatten : false,
								cwd			: 'dist/',
								src			: ['**/*'],
								dest		: 'cordova/www/'
							}]
						}
					},

		htmlbuild : {
						dist: {
							src			: src.html.index,
							dest		: dist.html.index,
							options	: {
								beautify	: true,
								relative	: true,
								prefix		: "",
								scripts		: {
									bundle	: [ dist.js.mini ]
								},
								styles:{
									bundle 	: [ dist.css.mini ]
								},
								sections	: src.html.sections
							}
						},
						build : {
							src			: src.html.index,
							dest		: build.html.index,
							options	: {
								beautify	: true,
								relative	: true,
								prefix		:"",
								scripts		:{
									bundle		: build.js.bundle
								},
								styles:{
									bundle	: [ build.css.dir+"/*" ]
								},
								sections : src.html.sections
							}
						}

					},

		htmlmin:	{
						options:{
							removeComments:true,
							collapseWhitespace:true,
							preserveLineBreaks:true
						},
						release:{
							files:[{
								src:[ dist.html.index ],
								dest: dist.html.index
							}]
						}
					},

		watch:		{
						options:{
							livereload:true
						},
						js:{
							files:[ src.js.watchMe ],
							tasks:['build']
						},
						sass:{
							files:[ src.scss.watchMe ],
							tasks:['build']
						},
						html:{
							files: [
								src.html.index,
								src.html.views,
								src.html.layout
							],
							tasks:["build"]
						}
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
			'copy:cordovaDev',
		// clean out staging dir
			'clean:staging'
	]);
};
