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



	var define   = Object.defineProperty;
	var _        = require('lodash');
	var Promise  = require('bluebird');
	var utils    = require('./utils.js');
	var _octane  = require('./_octane.js');
	var logger   = require('./logger.js');
	var Events   = require('./Events.js');
	var extend   = require('./extend.js');



	function OctaneBase(name){
		this.__loggerId__ = name;
		this.guid();
		this.initialize.apply(this,arguments);
	}


	// class extension method, from required
	define(OctaneBase,'extend',{
		value: extend,
		writable: false,
		configurable: false,
		enumerable: true
	});


	OctaneBase.prototype = {
		Utils: utils,
		extend: function(ext){
			return _.extend(this,ext);
		},
		initialize: function(){},
	};


	define(OctaneBase.prototype,'Proto',{
		value: 			function(name){
			return new OctaneBase(name);
		},
		writable: 	false,
		configurable: false
	});



	// shortcut method to define immutable properties
	define(OctaneBase.prototype,'defineProp',{
		value: function (isEnumerable,prop,val){

			if(!_.isBoolean(isEnumerable)){
				// if no emumerable definition is passed, read first argument as prop
				val = prop;
				prop = isEnumerable;
				// default to enumerable
				isEnumerable = true;
			}

			switch(true){
				case _.isPlainObject(prop):
					var keys = Object.keys(prop);
					var key;

					for (var i=0,n = keys.length; i<n; i++){
						key = keys[i];
						try{
							define(this,key,{
								value : prop[key] ,
								configurable : false,
								writable: false,
								enumerable: isEnumerable
							});
						} catch(ex){
							this.log(ex)
						}
					}
					break;
				case _.isString(prop):
					try{
						define(this,prop,{
							value : val,
							configurable : false,
							writable : false,
							enumerable:isEnumerable
						});
					} catch(ex){
						this.log(ex);
					}
					break;
			}
			return this; // chainable
		},
		writable: 	false,
		configuarable: false
	});

	define(OctaneBase.prototype,'defineGetter',{
		value: function(name,getter){
			define(this,name,{
				get: getter,
				configurable : false
			})
		},
		writable: false,
		configurable: false
	});

	define(OctaneBase.prototype,'defineSetter',{
		value: function(name,setter){
			define(this,name,{
				set: setter,
				configurable : false
			})
		},
		writable: false,
		configurable: false
	});

	define(OctaneBase.prototype,'accessors',{
		value: function(name,pair){
			define(this,name,{
				get : pair.get,
				set : pair.set,
				configurable: false
			})
		},
		writable: false,
		configurable: false
	});


	// Mixin to assign a unique identifier for objects.
	// Set as immutable, non-enumerable property on the object.
	// Pass an object or object will be set to `this`.
	// Returns the object's unique id if already assigned
	define(OctaneBase.prototype,'guid',{
		value: function(obj){
			return utils.guid.apply(this,[obj]);
		},
		writable: false,
		configurable: false
	});

	define(OctaneBase,'guid',{
		value:  function(obj){
			return utils.guid.apply(this,[obj]);
		},
		writable: false,
		configurable: false
	});

	// Mixins to set up logging
	define(OctaneBase.prototype,'log',{
		value: function(message,error){
			logger.apply(this,[message,error]);
		},
		writable: false,
		configurable: false
	});

	define(OctaneBase,'log',{
		value: function(message,error){
			logger.apply(this,[message,error]);
		},
		writable: false,
		configurable: false
	});

	// Mixin to set up event interface with the Quarterback
	_.extend(OctaneBase,Events);
	_.extend(OctaneBase.prototype,Events);


	module.exports = OctaneBase;
