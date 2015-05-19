/* bower_concat Grunt config */
var src = require("../paths/src.js");

module.exports = {
	all:{
		dest:			src.js.bower,
		cssDest:	src.css.bower,
		dependencies:{
			"velocity":	"jquery",
			"bootstrap":	"jquery"
		},
		mainFiles:{
			"history.js":"scripts/bundled/html4+html5/jquery.history.js"
		}
	}
};
