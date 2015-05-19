/* config for Grunt copy */

var src 	= require("../paths/src.js");
var build = require("../paths/build.js");
var dist 	= require("../paths/dest.js");

module.exports = {

	dist:{
		files:[{
			expand:		true,
			cwd: 			src.fonts.dir,
			src: 			['*'],
			dest: 		dist.fonts.dir
		},{
			expand:		true,
			cwd: 			src.img.dir,
			src: 			src.img.glob,
			dest: 		dist.img.dir
		},{
			src:			"bower.json",
			dest: 		"dist/bower.json"
		}]
	},

	build:{
		files:[{
			// copy unconcatenated js files
			expand:		true,
			flatten:	true,
			src: [
				src.js.concatMe,
				src.js.debug
			],
			dest:			build.js.dir
		},{
			// copy unconcatenated css files
			flatten:	true,
			expand: 	true,
			src: [
				src.css.bower,
				src.css.concatMe
			],
			dest: 		build.css.dir
		},{
			expand: 	true,
			cwd: 			src.fonts.dir,
			src: 			['*'],
			dest:			build.fonts.dir
		},{
			expand: 	true,
			cwd: 			src.img.dir,
			src: 			src.img.glob,
			dest: 		build.img.dir
		}]
	},

	// copy octane core files into example project dir
	example : {
		files:[{
			expand: 	true,
			flatten: 	false,
			cwd: 			'build/',
			src: 			['**/*'],
			dest: 		'example-project/src/octane_core/build/'
		},{
			expand: 	true,
			flatten: 	false,
			cwd: 			'dist/',
			src: 			['**/*'],
			dest: 		'example-project/src/octane_core/dist/'
		}]
	}
};
