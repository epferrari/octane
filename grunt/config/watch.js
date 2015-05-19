/* config for Grunt watch */

var src 	= require("../paths/src.js");
var build = require("../paths/build.js");
var dist 	= require("../paths/dest.js");

module.exports = 	{
	options: {
		livereload: true
	},
	js: {
		files: [ src.js.watchMe ],
		tasks: ['build']
	},
	sass: {
		files: [ src.sass.watchMe ],
		tasks: ['build']
	},
	copy: {
		files: [
			src.img,
			src.fonts
			],
		tasks: ["build"]
	}
};
