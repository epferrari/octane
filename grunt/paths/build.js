module.exports = {
	js :{
		dir		: "build/assets/js/",
		bower	: "build/assets/js/_bower.js",
		main	: "build/assets/js/<%= pkg.name %>.js",
		debug : "build/assets/js/debug.js"
	},
	css	:{
		dir		: "build/assets/css/",
		bower	: "build/assets/css/_bower.css",
		main	: "build/assets/css/<%= pkg.name %>.css"
	},
	img	:{
		dir:"build/assets/img/"
	},
	fonts :{
		dir:"build/assets/fonts/"
	}
};
