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



	var _          = require('lodash');
	var Promise    = require('bluebird');
	var OctaneBase = require('./OctaneBase.js');
	var _octane    = require('./_octane.js');

	var Dictionary = OctaneBase.extend('Dictionary',{

		initialize: function(name,data){
			if(_.isObject(data) && !_octane.dicts[name]){
				_octane.dicts[name] = data;
				this.fire('created:dictionary:'+name);
				return this;
			} else {
				this.log('could not create dictionary '+name+'.');
			}
		}
	},{
		get: function(name){
			return new Promise(function(resolve){
				var dict = _octane.dicts[name];

				if(dict){
					resolve(dict);
				} else {
					this.any('created:dictionary:'+name, function(e){
						resolve(_octane.dicts[name]);
					});
				}
			});
		}
	});

	module.exports = Dictionary;
