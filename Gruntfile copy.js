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
	grunt.loadNpmTasks('grunt-contrib-jshint');
	
    var pipeline = {
        
        watchMe: {
            sass:	"src/**/*.scss",
            css:[
                "src/**/*.css",
                "!src/css/_bower.css"
            ],
            js:[
                "src/**/*.js",
                "!src/js/_bower.js"
            ]
        },

        sassMe : ["src/scss/*.scss","!src/scss/devdocs.scss"],
       
        concatMe : {
            js: [
                "src/lib/*.js",
                "src/octane.js",
                "src/modules/**/*.js"
            ],
            css: [
				"src/css/_bower.css",
                "src/css/<%= pkg.name %>.css"
			]
        },

        miniMe:{
            js	:	"staging/js/<%= pkg.name %>.js",
            css	:	"staging/css/<%= pkg.name %>.css"

        },

        copyMe:{
            img		: "src/img/**",
            fonts	: "src/fonts/**"		
        },

        build:{
            js		:	"build/js/",
            css		:	"build/css/",
            img		:	"build/img/",
            fonts	:	"build/fonts/"	
        },


        dist:{
            js		:	"dist/js/",
            css		:	"dist/css/",
            img		:	"dist/img/",
            fonts	:	"dist/fonts/"
        },
        
        devdocs:{
            sassMe  : "src/scss/devdocs.scss",
            css     : "src/css/devdocs.css",
            index   : "src/index.html"
        }
            
            
    };
    
  	// Project configuration.
	grunt.initConfig({
		
		pkg: 		grunt.file.readJSON('package.json'),
		
		bower_concat:{
						all:{
							dest	:	"src/js/_bower.js",
							cssDest	:	"src/css/_bower.css",
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
						dist	:	['dist'],
                        staging :   ['staging']
					},
		
		// compile sass files into src/css
		sass:		{
						build:{
							files : [ {
								src		: [
                                            pipeline.sassMe
                                        ],
								dest	: pipeline.concatMe.css[1],
							}]
                        },
                        devdocs : {
                            files:[{
                                src     : pipeline.devdocs.sassMe,
                                dest    : pipeline.devdocs.css
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
							src		: [ pipeline.concatMe.js ],
							dest	: pipeline.miniMe.js
						},
						css:{
							src		: [ pipeline.concatMe.css],
							dest	: pipeline.miniMe.css
						}
					},
		
		// take concatenated files in staging/js, 
		// minify, and save them in release/js
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
								src:[ pipeline.miniMe.js ],
								dest: pipeline.dist.js+"<%= pkg.name %>-min.js"
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
								src: "src/js/_bower.js",
								dest: "build/js/_bower.js"
							}]
						}
					},
		
		// take compiled and concated css from staging/css,
		// minify, and save in release/css
		cssmin:		{
						dist:{
							files:[{
								src:[ pipeline.miniMe.css ],
								dest: pipeline.dist.css+"<%= pkg.name %>-min.css"
							}]
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
							 src: pipeline.dist.js+"/<%= pkg.name %>-min.js"
						 }
					},
	
		copy:		{
						dist:{
							files:[{
								expand:true,
								cwd:"src/assets/img/",
								//src:["<%= pipeline.copyMe.img %>"],
								src:['**'],
								dest: pipeline.dist.img
							},{
								expand:true,
								flatten:true,
								src:[ pipeline.copyMe.fonts ],
								dest: pipeline.dist.fonts
							},{
								expand:true,
								cwd:"src/modules/",
								src:["**/*.jpg","**/*.jpeg","**/*.png","**/*.gif"],
								dest: pipeline.dist.img
							},{
								src:"bower.json",
								dest:"dist/bower.json"
							},{
								expand:true,
								flatten:true,
								src: pipeline.miniMe.js,
								dest: pipeline.dist.js
							}]
						},
						build:{
                            
							files:[{
                                // copy unconcatenated js files
								expand:true,
								flatten: true,
								src: [pipeline.concatMe.js],
								dest: pipeline.build.js
							},{
                                // copy unconcatenated css files
								flatten:true,
								expand:true,
								src: pipeline.concatMe.css,
								dest: pipeline.build.css
							},{
								expand:true,
								flatten:true,
								src:[ pipeline.copyMe.fonts ],
								dest: pipeline.build.fonts
							},{
								expand:true,
								cwd:"src/modules/",
								src:["**/*.jpg","**/*.jpeg","**/*.png","**/*.gif"],
								dest: pipeline.build.img
							}]
						}
					},
		
        // create developer documentation (index.html)
		htmlbuild : {
						dist: {
							src: "src/index.html",
							dest: "index.html",
							options:{
								beautify:true,
								relative:true,
								prefix:"dist/",
								scripts:{
									bundle: [
                                        // use minified js in dist devdoc
										"build/js/_bower.js",
										pipeline.dist.js+"<%= pkg.name %>-min.js"
									]
								},
								styles:{
									bundle:[
                                        // use minified css in dist devdoc
										"build/css/_bower.css",
										pipeline.dist.css+"<%= pkg.name %>-min.css",
                                        pipeline.devdocs.css
									]
								}
							}
						},
						build: {
							src: "src/index.html",
							dest: "build/index.html",
							options:{
								beautify:true,
								relative:true,
								prefix:"build/",
								scripts:{
									bundle: [ 
										"build/js/_bower.js",
										pipeline.concatMe.js
									]
								},
								styles:{
									bundle:[ 
										//"build/css/_bower.css",
										pipeline.concatMe.css,
                                        pipeline.devdocs.css
									]
								}
							}
						}
					},
		
					
		watch:		{
						options:{livereload:true},
						js:{
							files:[ pipeline.watchMe.js ],
							tasks:['build']
						},
						css:{
							files:[ pipeline.watchMe.css ],	
							tasks:['build']
						},
						sass:{
							files:[ pipeline.watchMe.sass ],
							tasks:['build']
						},
						html:{
							files: pipeline.watchMe.html,
							tasks:["build"]
						},
						copy:{
							files:[
								pipeline.copyMe.img,
								pipeline.copyMe.fonts
								],
							tasks:["build"]
						}
					}
	})
	
	// Default task(s).
	grunt.registerTask('default',['build']);
	  
	// other task(s)
	grunt.registerTask('dist', [
		
         // clean staging
            'clean:staging',
		
        // compile css
			'sass',
		
		// concat all js/css into staging directory
        // do not include bower dependencies
			'concat',
			
		// clean release directory
			'clean:dist',
			
		// minify js/css into release directory
			'cssmin',
			'uglify:dist',
			
		// copy assets to release directory
			'copy:dist',
		
		// build html
			'htmlbuild:dist',
			
		 // clean staging
            'clean:staging'
			
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