/*
* Copyright 2015 Ethan Ferrari, OneFire Media Inc.
*
*	Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*		http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*/



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
