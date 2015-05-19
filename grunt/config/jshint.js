/* config for Grunt jshint */

module.exports = {
	options: {
		curly: 		true,
		eqeqeq: 	true,
		eqnull: 	true,
		browser: 	true,
		globals: 	{
			jQuery: true
		}
	},
	files:{
		src: dist.js.mini
	}
}
