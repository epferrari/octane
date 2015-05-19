module.exports = {
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
