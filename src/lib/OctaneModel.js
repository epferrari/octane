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


var _           = require('lodash');
var _octane     = require('./_octane.js');
var OctaneBase  = require('./OctaneBase.js');
var utils       = require('./utils.js');
var extend      = require('./extend.js');
var logger      = require('./logger.js');


// base Model factory
function OctaneModel(dataset){

	// private
	var _alias	= null;
	var data = {};
	var queue = {};
	this.className = this.className || 'OctaneModel';
	this.guid();

	this.defineGetter('queue',function(){
		return queue;
	});

	this._resetQueue = function(){
		queue = {};
	};

	this.defineGetter('alias',
		function(){
			return _alias;
	});

	this.defineGetter('data',
		function(){
			return data;
	});

	this.extend({
		become : function(alias){
			if(alias === 'App' && _octane.models['App']) throw new Error('Cannot replace App model, choose another model');
			var models = _octane.models;
			models[alias] && models[alias].detach();
			models[alias] = this;
			_alias = alias;
			this.fire('modelchange:'+alias);
			return this;
		},
		detach : function(){
			var alias = this.alias;
			if(alias === 'App') throw new Error('Cannot detach App model');
			if( alias ){
				_octane.models[alias] = null;
				_alias = null;
				this.fire('modelchange:'+alias);
			}
			return this;
		}
	});

	this.initialize.apply(this,arguments);
	// set defaults from prototype
	this.set(this.defaults);
	// overwrite with data passed to constructor
	this.set(dataset);
	this.initialize && this.initialize.apply(this,arguments);
}





// Static methods
OctaneBase.prototype.defineProp.call(OctaneModel,{

	extend: extend,

	// mixin the logger
	log: function(message,err){
		logger.apply(this,[message,error]);
	},

	// static factory
	create: function(dataset){
		return new OctaneModel(dataset);
	},

	// get the model name from a keystring, ex `App.loading.message` would return "App"
	_parseName: function(binding){
		try {
			return (binding || '').split('.')[0];
		} catch (ex){
			this.log('Could not parse model name from '+binding+': '+ex.message);
			return false;
		}
	},

	// get the nested key from a keystring, ex `App.loading.message` would return "loading.message"
	_parseKey: 	function(binding){
		try{
			return (binding || '').split('.').slice(1).join('.');
		} catch (ex){
			this.log('Could not parse model key from '+binding+': '+ex.message);
			return false;
		}
	}
});
// end static methods



OctaneModel.prototype = Object.create(OctaneBase.prototype);

OctaneModel.prototype.defineProp({

	_ensureSetObject: function(key,value){
		var tk = utils.typeOf(key);
		var inbound;

		// handle key,value and {key:value}
		if(tk === 'object'){
			inbound = key;
		}else if(tk === 'string'){
			(inbound = {})[key] = value;
		}else {
			inbound = {};
		}
		return inbound;
	},

	_set: function(key,val){

		var inbound = this._ensureSetObject(key,val);

		if(this.processing){
			_.merge(this.queue,inbound);
		} else {
			this.processing = true;

				var alias = this.alias;
			// apply any hooks
			if(alias){
				_.forOwn(inbound,function(value,path){
					_octane.hooks[alias+'.'+path] && this._applyHooks(path,inbound);
				},this);
			}

			// re-iterate in case there have been additional properties
			// added to inbound via hooks
			_.forOwn(inbound,function(value,path){
				_.set(this.data,path,value);
				this.alias && this.fire('modelchange:'+path);
			},this);
			this.processing = false;
			if(!_.isEmpty(this.queue)) this._set(this.queue);
			this._resetQueue();
			// alert any subscribers
			alias && this.fire('modelchange:'+alias);
		}
		return this.data;
	},

	// use reduce to set a value using a nested key, ex "App.loading.message" would set {App:{loading:{message:value}}}
	// deprecated by lodash 3.9 _.get
	/*
	_setData: function(path,value){

		var data = this.data;
		var alias = this.alias;
		var keyArray = path.replace(/\[\]/g,'.').split('.');
		path = path.replace(/(\]\[)/g,'.')
			.replace(/^(\[)/,'')
			.replace(/(\])$/,'')
			.replace(/([\[\]])/g,'.')
			.split('.');
		var k = keyArray.length;
		var modelUpdated;

		try{
			keyArray.reduce(function(res,cur,index){
				if(index === (k-1)){ // last iteration
					return res[cur] = value;
				}else{

					return res[cur] = _.isPlainObject(res[cur]) ? res[cur] : {}; // create object if not already
				}
			},data);

			modelUpdated = true;
		}catch(ex){
			modelUpdated = false;
			this.log('Unable to set model data at "'+path+'"',ex);
		}
		modelUpdated && alias && this.fire('modelchange:'+alias+'.'+path);
	},
	*/

	// helper, applies hooks on changed model data attributes before they get set
	_applyHooks: function(path,inbound){

		if(this.alias){
			var hooks = _octane.hooks[this.alias+'.'+path];
			var fresh = _.get(inbound,path);
			var current = this.data;

			_.each(hooks,function(hook){
				fresh && hook(fresh,inbound,current);
			});
		}
	},

	_unset: function(toUnset,options){

		if(!toUnset) return;
		_.isPlainObject(options) || (options = {});
		_.isArray(toUnset) || (toUnset = toUnset.split(','));

		var timeout = options.timeout;
		var throttle = options.throttle;

		if(timeout && (utils.typeOf(timeout) == 'number')){
		// timout the unset

			if(throttle){
			// throttle the unsets
				_.each(toUnset,function(path,i){
						setTimeout(function(){
							this.set( path, void(0) );
						// make sure we timeout the 0 index
						}.bind(this),timeout*(i+1));
				},this);
			}else{
			// unset all together after timeout
				setTimeout(function(){
					_.each(toUnset,function(path){
						this.set( path, void(0) );
					},this);
				}.bind(this),timeout);
			}
		} else {
		// else if timeout wasn't set, unset all immediately
			_.each(toUnset,function(path){
				this.set( path, void(0) );
			},this);
		}
	},

	_destroy: function(){

		var  keys = Object.keys(this.data);
		var n = keys.length;

		while(n--){
			this.data[keys[n]] = null;
		}
		this.clearEventCache();
		this.alias && this.detach();
	},

	_get: function(path){

		if(_.isString(path)){
			return _.get(this.data,path);
		} else {
			return this.data;
		}
	},

	// deprecated by lodash 3.9 _.get
	_getAt: function(path,index){

		var prop = this._get(path);
		if(_.isArray(prop)){
			return prop[index];
		}else{
			return prop;
		}

	},

	_clear: function(){

		var alias = this.alias;

		_.forOwn(this.data,function(value,key){
			this.data[key] = null;
			alias && this.fire('modelchange:'+alias+'.'+key);
		});
		// alert any subscribers
		if(alias) this.fire('modelchange:'+alias );

		return this;
	},

	_reset: function(defaults){
		this.clear()
		this.set(defaults || this.defaults);
	}
});

// create overwritable aliases for extension classes
var modelProtoProps = ['get','set','unset','clear','getAt','destroy','reset'];
_.each(modelProtoProps,function(method){
	OctaneModel.prototype[method] = function(){
		return this['_'+method].apply(this,arguments);
	};
});
OctaneModel.prototype.constructor = OctaneModel;
OctaneModel.prototype.initialize = function(){};


module.exports = OctaneModel;
