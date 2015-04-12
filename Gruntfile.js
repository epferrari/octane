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

	var src = {
		js:{

			watchMe:[
								"src/assets/**/*.js",
								"!src/assets/js/_bower.js"
							],
			bower: "src/assets/js/_bower.js",
			concatMe: [
								"src/lib/doubleUnder.js",
								"src/octane.js",
								"src/lib/startup_utilities.js",
								"src/modules/**/*.js",
								"!src/modules/debug/**"
						],
						debug:[
								"src/modules/debug/module.debug.js"
						]
		},
		css	:{

			bower:"src/assets/css/_bower.css",
			concatMe:[
								"src/assets/css/<%= pkg.name %>.css"
			]
		},
		img	:{
			dir:"src/assets/img/",
			glob:[
				"**/*.jpg",
				"**/*.jpeg",
				"**/*.png",
				"**/*.gif"
			]
		},
		fonts: {
			dir:"src/assets/fonts/"
		},
		sass:{
			watchMe:"src/**/*.scss",
			octane:["src/assets/scss/octane.scss"]
		}
	};

	var dev = {
		js :{
			dir		: "dev/assets/js/",
			bower	: "dev/assets/js/_bower.js",
			main	: "dev/assets/js/<%= pkg.name %>.js",
			debug   : "dev/assets/js/debug.js"
		},
		css	:{
			dir		: "dev/assets/css/",
			bower	: "dev/assets/css/_bower.css",
			main	: "dev/assets/css/<%= pkg.name %>.css"
		},
		img	:{
			dir:"dev/assets/img/"
		},
		fonts :{
			dir:"dev/assets/fonts/"
		}
	};

	var dist = {
		js :{
			dir 	: "dist/assets/js/",
			bower	: "dist/assets/js/_bower.js",
			main	: "dist/assets/js/<%= pkg.name %>.js",
			mini	: "dist/assets/js/<%= pkg.name %>-min.js"
		},
		css	:{
			dir		: "dist/assets/css/",
			bower	: "dist/assets/css/_bower.css",
			main	: "dist/assets/css/<%= pkg.name %>.css",
			mini	: "dist/assets/css/<%= pkg.name %>-min.css"
		},
		img	:{
			dir:"dist/assets/img/"
		},
		fonts:{
			dir:"dist/assets/fonts/"
		}
	};

	var autoprefixer = require('autoprefixer-core');

	// Project configuration.
	grunt.initConfig({

		pkg: 		grunt.file.readJSON('package.json'),

		bower_concat:{
						all:{
							dest	:	src.js.bower,
							cssDest	:	src.css.bower,
							dependencies:{
								"lodash"	:	"jquery",
								"velocity"	:	"jquery",
								"bootstrap"	:	"jquery"
							},
							mainFiles:{
								"history.js":"scripts/bundled/html4+html5/jquery.history.js"
							}
						}
					},

		clean:      {
						dev		:	['dev','example-project/dev'],
						dist		:	['dist','example-project/dist'],
						example : ['example-project/src/octane_core']
					},

		// compile sass files into src/css
		sass:		{
						all:{
							files:[{
								src		: src.sass.octane,
								dest	: src.css.concatMe[0],
							}]
						}
					},

		// concat js and css files and save them to staging/
		// staged for minification
		concat:     {
						options:{
														separator:';'
												},
												js:{
							src		: src.js.concatMe,
							dest	: dist.js.main
						},
						css:{
							src		: [ src.css.concatMe],
							dest	: dist.css.main
						}
					},

		autoprefixer : {

												options : {
														browsers:['last 2 versions','ie 9','ie 10']
												},
												dist:{
														src : dist.css.main,
														dest: dist.css.main
												},
												dev:{
														src:dev.css.main,
														dest:dev.css.main
												}
										},

		uglify:		{
						dist:{
							options:{
								drop_console:true,
								mangle:true,
								beautify:false,
								banner:'/* <%= pkg.name %> - <%pkg.version %> - '+'<%= grunt.template.today("yyyy-mm-dd") %>*/'
							},
							files:[
								{
									src: src.js.bower,
									dest: dist.js.bower
								},{
									src: dist.js.main ,
									dest: dist.js.mini
								}],
						},
						dev:{
							options:{
								drop_console:true,
								mangle:true,
								beautify:false,
								banner:'/* <%= pkg.name %> - <%pkg.version %> - '+'<%= grunt.template.today("yyyy-mm-dd") %>*/'
							},
							files:[
								{
									src: src.js.bower,
									dest: dev.js.bower
								}]
						}
					},

		cssmin:		{
						dist:{
							files:[{
								src		: dist.css.main,
								dest	: dist.css.mini
							},{
								src 	: src.css.bower,
								dest	: dist.css.bower
							}]
						}
					},

		copy:		{
						dist:{
							files:[{
								expand:true,
								cwd		: src.fonts.dir,
								src		: ['*'],
								dest	: dist.fonts.dir
							},{
								expand	: true,
								cwd		: src.img.dir,
								src		: src.img.glob,
								dest	: dist.img.dir
							},{
								src		:"bower.json",
								dest	:"dist/bower.json"
							}]
						},

						dev:{
							files:[{
																// copy unconcatenated js files
								expand	:true,
								flatten	: true,
								src		: [
													src.js.concatMe,
													src.js.debug
												],
								dest	: dev.js.dir
							},{
																// copy unconcatenated css files
								flatten	:true,
								expand	:true,
								src		: [
									src.css.bower,
									src.css.concatMe
								],
								dest	: dev.css.dir
							},{
								expand	: true,
								cwd		: src.fonts.dir,
								src		: ['*'],
								dest	: dev.fonts.dir
							},{
								expand	: true,
								cwd		: src.img.dir,
								src		: src.img.glob,
								dest	: dev.img.dir
							}]
						},

					example : {				// copy octane core files into example project dir
							files:[{
									expand 	: true,
									flatten : false,
									cwd			: 'dev/',
									src			: ['**/*'],
									dest		: 'example-project/src/octane_core/dev/'
							},{
									expand 	: true,
									flatten : false,
									cwd			: 'dist/',
									src			: ['**/*'],
									dest		: 'example-project/src/octane_core/dist/'
							}]
						}
					},

		watch:		{
						options:{livereload:true},
						js:{
							files:[ src.js.watchMe ],
							tasks:['dev']
						},
						sass:{
							files:[ src.sass.watchMe ],
							tasks:['dev']
						},
						copy:{
							files:[
								src.img,
								src.fonts
								],
							tasks:["dev"]
						}
					},

		jshint: 	{
						options: {
								curly: true,
								eqeqeq: true,
								eqnull: true,
								browser: true,
								globals: {
								jQuery: true
								}
						},
						 files:{
							 src: dist.js.mini
						 }
					}
	});

	// Default task(s).
	grunt.registerTask('default',['dev']);

	// other task(s)
	grunt.registerTask('dist',[
		// clean dist
			'clean:dist',
		// compile css
			'sass',
		// concat front end dependencies
			'bower_concat',
		// concat all js/css
		// do not include bower dependencies
			'concat',
		// post process css with auto prefixer
			'autoprefixer:dist',
		// minify js/css into release directory
			'cssmin',
			'uglify:dist',
		// copy assets to release directory
			'copy:dist',
		// copy core files to example project
			'clean:example',
			'copy:example'
		// lint
			//'jshint'

	]);

	grunt.registerTask('dev',[
		//clean dev directory
			'clean:dev',
		// compile css
			'sass',
		// concat dependencies
			'bower_concat',
		// minify the _bower.js
			'uglify:dev',
		// copy files to dev dir
			'copy:dev',
		// post process css with auto prefixer
			'autoprefixer:dev',
		// copy core files to example project
			'clean:example',
			'copy:example'
	]);


};
