module.exports = {
	js: {
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
	css: {
		bower:"src/assets/css/_bower.css",
		concatMe:[
			"src/assets/css/<%= pkg.name %>.css"
		]
	},
	img: {
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
		octane:[
			"src/assets/scss/octane.scss"
		]
	}
};
