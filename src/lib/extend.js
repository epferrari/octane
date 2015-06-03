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


var _ 		= require("lodash");
var utils = require("./utils.js");




// prototype chaining Backbone.js style
module.exports = function extend(){

	var className,config,staticMethods,P,o,_o;

	if(utils.typeOf(arguments[0]) == 'string'){
			className = arguments[0];
			config = arguments[1] || {};
			staticMethods = arguments[2] || {};
	}else{
			config = arguments[0] || {};
			staticMethods = arguments[1] || {};
	}

	P = this;

	if(config.constructor !== Object && _.isFunction(config.constructor)){
		o = config.constructor;
	} else {
		o = function(){
			return P.apply(this,arguments);
		};
	}

	_.extend(o,P,staticMethods);

	_o = function(){ this.constructor = o; };
	_o.prototype = P.prototype;
	o.prototype = new _o;


	// ensure prototype has a defaults object
	o.prototype.defaults = {};
	_.merge(o.prototype, config);

	o.__super__ = P.prototype;

	return o;
};
