var _ 					= require('lodash');
var Promise 		= require('bluebird');
var OctaneBase 	= require('./factory.js');
var _octane 		= require('./_octane.js');

var Dictionary = OctaneBase.extend({

	initialize: function(name,data){
			if(_.isObject(data) && !_octane.dicts[name]){
				_octane.dicts[name] = data;
				this.fire('created:dictionary:'+name);
				return this;
			} else {
				this.log('could not create dictionary '+name+'.')
			}
		}
	},{
		get: function(name){
			return new Promise(function(resolve){
				var dict = _octane.dicts[name];

				if(dict){
					resolve(dict)
				} else {
					this.handle('created:dictionary:'+name, function(e){
						resolve(_octane.dicts[name]);
					});
				}
			});
		}
	}
});

module.exports = Dictionary;
