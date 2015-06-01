	var _ 			= require('lodash');
	var _octane = require('./_octane.js');

	module.exports = function(message,error){

		if(!_octane.debugMode) return;

		if(arguments.length === 1 && _.isObject(message)){
			error = message;
			message = error.message || 'Additional details unavailable';
		}
		_octane.logfile.push({
			message: message,
			error: (error||{}),
			caller: this.name || this.id || this.guid()
		});
	}
