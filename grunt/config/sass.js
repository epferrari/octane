/* config for Grunt sass */
var src 				= require("../paths/src.js");

module.exports = {
	all:{
		files:[{
			src		: src.sass.octane,
			dest	: src.css.concatMe[0],
		}]
	}
};
