/* config for Grunt cssmin */
var src 				= require("../paths/src.js");
var build 			= require("../paths/build.js");
var dist 				= require("../paths/dest.js");

module.exports = {
	dist:{
		files:[{
			src: 	dist.css.main,
			dest: dist.css.mini
		},{
			src: 	src.css.bower,
			dest: dist.css.bower
		}]
	}
};
