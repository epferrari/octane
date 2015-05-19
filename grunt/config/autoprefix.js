/* config for Grunt autoprefixer */

var build 			= require("../paths/build.js");
var dist 				= require("../paths/dest.js");

module.exports = {
	options : {
		browsers: ['last 2 versions','ie 9','ie 10']
	},
	dist:{
		src: 	dist.css.main,
		dest: dist.css.main
	},
	build:{
		src:	build.css.main,
		dest:	build.css.main
	}
};
