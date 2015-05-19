/* config for Grunt concat */

var src 	= require("../paths/src.js");
var dest 	= require("../paths/dest.js");

module.exports = {
	options: {
		separator:';'
	},
	js:{
		src: 	src.js.concatMe,
		dest: dist.js.main
	},
	css:{
		src: 	[ src.css.concatMe],
		dest: dist.css.main
	}
}
