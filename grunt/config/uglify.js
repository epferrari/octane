/* config for Grunt uglify */

var src 				= require("../paths/src.js");
var build 			= require("../paths/build.js");
var dist 				= require("../paths/dest.js");

module.exports = {
	dist: {
		options: {
			drop_console: true,
			mangle: 			true,
			beautify:			false,
			banner:				'/* <%= pkg.name %> - <%pkg.version %> - '+'<%= grunt.template.today("yyyy-mm-dd") %>*/'
		},
		files: [{
			src: 	src.js.bower,
			dest: dist.js.bower
		},{
			src: 	dist.js.main,
			dest: dist.js.mini
		}],
	},
	build: {
		options:{
			drop_console:	true,
			mangle: 			true,
			beautify:			false,
			banner:				'/* <%= pkg.name %> - <%pkg.version %> - '+'<%= grunt.template.today("yyyy-mm-dd") %>*/'
		},
		files: [{
			src: 	src.js.bower,
			dest: build.js.bower
		}]
	}
}
