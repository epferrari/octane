module.exports = function(grunt) {
	
	// plugins
	grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
  	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-bower-concat');
	grunt.loadNpmTasks('grunt-html-build');
    grunt.loadNpmTasks('grunt-postcss');
    grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	
    var src = {
        
		html:{
			index: "src/index.html"
		},
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
                "src/modules/debug/debug.js"
            ]
		},
		css	:{
			
			bower:"src/assets/css/_bower.css",
			concatMe:[
                "src/assets/css/<%= pkg.name %>.css"
			],
			devdocs:"src/assets/css/devdocs.css"
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
			octane:["src/assets/scss/octane.scss","!src/assets/scss/devdocs.scss"],
			devdocs:"src/assets/scss/devdocs.scss"
		},
			
        
	};
	
	var build = {
		
		html : {
			index	: "build/index.html"
		},
		js :{
			dir		: "build/assets/js/",
			bower	: "build/assets/js/_bower.js",
			main	: "build/assets/js/<%= pkg.name %>.js",
            debug   : "build/assets/js/debug.js"
		},
		css	:{
			dir		: "build/assets/css/",
			bower	: "build/assets/css/_bower.css",
			main	: "build/assets/css/<%= pkg.name %>.js",
			devdocs : "build/assets/css/devdocs.css"
		},
		img	:{
			dir:"build/assets/img/"
		},
		fonts :{
			dir:"build/assets/fonts/"
		}	
	};
		

   var dist = {
	   	html : {
			index	: "dist/index.html"
		},
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
			mini	: "dist/assets/css/<%= pkg.name %>-min.css",
			devdocs : "dist/assets/css/devdocs.css"
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
						build	:	['build'],
						dist	:	['dist']
					},
		
		// compile sass files into src/css
		sass:		{
						all:{
							files:[{
								src		: src.sass.octane,
								dest	: src.css.concatMe[0],
							},{
								src     : src.sass.devdocs,
                                dest    : src.css.devdocs
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
        /*
        postcss:    {
                        options:{
                            processors:[
                                autoprefixer(['last 2 versions','ie9','ie10']).postcss
                            ]
                        },
                        dist : {
                            src : dist.css.main
                        }
                    },
         */
        
        autoprefixer : {
                        
                        options : {
                            browsers:['last 2 versions','ie 9','ie 10']
                        },
                        dist:{
                            src : dist.css.main,
                            dest: dist.css.main
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
						build:{
							options:{
								drop_console:true,
								mangle:true,
								beautify:false,
								banner:'/* <%= pkg.name %> - <%pkg.version %> - '+'<%= grunt.template.today("yyyy-mm-dd") %>*/'
							},
							files:[
								{
									src: src.js.bower,
									dest: build.js.bower
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
								// copy devdocs css
								flatten	:true,
								expand	:true,
								src 	: src.css.devdocs,
								dest	: dist.css.dir
							},{
								src		:"bower.json",
								dest	:"dist/bower.json"
							}]
						},
						build:{
							
							files:[{
                                // copy unconcatenated js files
								expand	:true,
								flatten	: true,
								src		: [
                                    src.js.concatMe,
                                    src.js.debug
                                ],
								dest	: build.js.dir
							},{
                                // copy unconcatenated css files
								flatten	:true,
								expand	:true,
								src		: [
									src.css.bower,
									src.css.concatMe
								],
								dest	: build.css.dir
							},{
								// copy devdocs css
								flatten: true,
								expand	: true,
								src 	: src.css.devdocs,
								dest	: build.css.dir
							},{
								expand	: true,
								cwd		: src.fonts.dir,
								src		: ['*'],
								dest	: build.fonts.dir
							},{
								expand	: true,
								cwd		: src.img.dir,
								src		: src.img.glob,
								dest	: build.img.dir
							}]
						}
					},
		
        // create developer documentation (index.html)
		htmlbuild : {
						dist: {
							src: src.html.index,
							dest: dist.html.index,
							options:{
								beautify:true,
								relative:true,
								prefix:"dist/",
								scripts:{
									bundle: [
                                        // include _bower.js
										dist.js.bower,
										dist.js.mini
									]
								},
								styles:{
									bundle:[
                                        // include _bower.css & devdocs.css
										dist.css.bower,
										dist.css.mini,
                                        dist.css.devdocs
									]
								}
							}
						},
						build: {
							src: src.html.index,
							dest: build.html.index,
							options:{
								beautify:true,
								relative:true,
								prefix:"build/",
								scripts:{
									bundle: [ 
										// include _bower.js
                                        build.js.bower,
                                        [build.js.dir+'doubleUnder.js'],
                                        build.js.main,
										[build.js.dir+'*.js']
									]
								},
								styles:{
									bundle:[ 
										// include _bower.css & devdocs.css
										//build.css.bower,
										[build.css.dir+'*.css']
                                       // build.css.devdocs
									]
								}
							}
						}
					},
		
					
		watch:		{
						options:{livereload:true},
						js:{
							files:[ src.js.watchMe ],
							tasks:['build']
						},
						sass:{
							files:[ src.sass.watchMe ],
							tasks:['build']
						},
						html:{
							files: [src.html.index],
							tasks:["build"]
						},
						copy:{
							files:[
								src.img,
								src.fonts
								],
							tasks:["build"]
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
					},
	})
	
	// Default task(s).
	grunt.registerTask('default',['build']);
	  
	// other task(s)
	grunt.registerTask('dist', [
		
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
		
		// build html
			'htmlbuild:dist',
		
		// lint
			//'jshint'
     		
	]);
	
	grunt.registerTask('build', [
		
		//clean build directory
			'clean:build',
			
		// compile css
			'sass',
			
		// concat dependencies
			'bower_concat',
			
		// minify the _bower.js
			'uglify:build',
			
		// copy files to build dir
			'copy:build',
			
		// build html
			'htmlbuild:build'
	]);
	
	
};