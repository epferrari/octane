
	var _octane = require('./_octane.js');
	var utils 	= require('./utils.js');

	// filterFunction as -> function([params])
	var filter = function(name,filterFunction){
		_octane.filters[name] = filterFunction;
	};

	filter('round',function(decimalPlaces){
		var float = parseFloat(this.val);
		var power = Math.pow(10,decimalPlaces);
		this.val  = Math.round(float*power)/power;
	});

	filter('roundDown',function(){
		this.val =  Math.floor( parseFloat(this.val) );
	});

	filter('titleize',function(){
		this.val = utils.titleize(this.val);
	});


	filter('hidePassword',function(replacement){
		if(!this.model.showPassword){
			this.val =  this.val.replace(/./g,replacement);
		}
	});

	module.exports = filter;
