
	var _octane = require('./_octane.js');
	var utils 	= require('./utils.js');

	// filterFunction as -> function([params])
	var filter = function(name,filterFunction){
		_octane.filters[name] = filterFunction;
	};

	filter('round',function(decimalPlaces){
		var input = this.input;
		var power = Math.pow(10,decimalPlaces);
		input = parseFloat(input);
		return Math.round(input*power)/power;
	});

	filter('roundDown',function(){
		return Math.floor( parseFloat(this.input) );
	});

	filter('titleize',function(){
		return  utils.titleize(this.input);
	});

	filter('caps',function(){
		var input = this.input;
		return (utils.typeOf(input) == 'string') ? input.toUpperCase() : input;
	});

	filter('hidePassword',function(replacement){
		if(!this.model.showPassword){
			return this.input.replace(/./g,replacement);
		}
		return this.input;
	});

module.exports = filter;
