// JavaScript Document
var src = {
	watchMe: {
            sass:	"src/assets/**/*.scss",
            js:[
                "src/assets/**/*.js",
                "!src/assets/js/_bower.js"
            ]
        },
		
		bower : {
			js : "src/assets/js/_bower.js",
			css	: "src/assets/css/_bower.css"
		},

        sassMe : ["src/assets/scss/*.scss","!src/assets/scss/devdocs.scss"],
       
        concatMe : {
            js: [
                "src/lib/*.js",
                "src/octane.js",
                "src/modules/**/*.js"
            ],
            css: [
				"src/assets/css/_bower.css",
                "src/assets/css/<%= pkg.name %>.css"
			]
        },

        copyMe:{
            img		: [
				"src/assets/img/**",
				"src/**/*.jpg",
				"src/**/*.jpeg",
				"src/**/*.png",
				"src/**/*.gif"
			],
            fonts	: "src/assets/fonts/**"		
        },
		
		devdocs:{
            sassMe  : "src/assets/scss/devdocs.scss",
            css     : "src/assets/css/devdocs.css",
            index   : "src/assets/index.html"
        }
}