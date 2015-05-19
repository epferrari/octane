var _ = require('lodash');
var _octane = require('./_octane.js');


module.exports = {

	log: 				function(message,error){

								if(arguments.length === 1 && _.isObject(message)){
									error = message;
									message = error.message || 'Additional details unavailable';
								}
								_octane.logfile.push({
									message: message,
									error: (error||{}),
									caller: this
								});
							},

	error: 			function(message){
									throw new Error(message);
							}
};
