var _ 					= require('lodash');
var _octane 		= require('./_octane.js');
var OctaneBase	= require('./OctaneBase.js');
var utils 			= require('./utils.js');
var extend 			= require('./extend.js');

var log 				= OctaneBase.prototype.log;


// base Model factory
function OctaneModel(dataset){

	// private
	var _alias	= null;
	var data = {};
	var queue = [];
	this.className = this.className || 'OctaneModel';
	this.guid();

	this.accessors('queue',{
		set:function(pair){
			queue.push(pair);
		},
		get:function(){
			return queue.shift();
		}
	});

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
			if( alias ){
				_octane.models[alias] = null;
				_alias = null;
				this.fire('modelchange:'+alias);
			}
			return this;
		}
	});

	// set up to handle events
	// functionality added with Events decorator object
	var events = {ANY:{}};
	var listening = [];

	this.defineGetter('_events_',function(){
		return events;
	});
	this.defineGetter('_listening_',function(){
		return listening;
	});

	this.clearEventCache = function(){
		events = {ANY:{}};
	};


	this.initialize.apply(this,arguments);
	// set defaults from prototype
	this.set(this.defaults);
	// overwrite with data passed to constructor
	this.set(dataset);
	this.initialize && this.initialize.apply(this,arguments);
}





/* static methods */
OctaneBase.prototype.defineProp.call(OctaneModel,{

	extend:  		extend,
	log: 				function(message,err){
								logger.apply(this,[message,error]);
							},
	// static factory
	create: 		function(dataset){
								return new this(dataset);
							},

	// get the model name from a keystring, ex "App.loading.message" would return "App"
	_parseName: function(binding){
								try {
									return (binding || '').split('.')[0];
								} catch (ex){
									log.call(this,'could not parse model name from '+binding+': '+ex.message);
									return false;
								}
							},

	// get the nested key from a keystring, ex "App.loading.message" would return "loading.message"
	_parseKey: 	function(binding){
								try{
									return (binding || '').split('.').slice(1).join('.');
								} catch (ex){
									log.call(this,'could not parse model key from '+binding+': '+ex.message);
									return false;
								}
							}
}); // end static methods

/*
define(OctaneModel,'extend',{
	value: extend,
	writable: false,
	configurable: false
});
*/

OctaneModel.prototype = new OctaneBase;

OctaneModel.prototype.defineProp({

	_set: 			function(key,val){

								if(this.processing){
									this.queue = [key,val];
								}else{
									this.processing = true;


									var alias = this.alias;
									var tk = utils.typeOf(key);
									var inbound,n,keys;

									// handle key,value and {key:value}
									if(tk === 'object'){
										inbound = key;
									}else if(tk === 'string'){
										(inbound = {})[key] = val;
									}else {
										inbound = {};
									}

									// array for state properties changed
									keys = Object.keys(inbound);
									n = keys.length;

									// apply any hooks
									if( alias ){
										while(n--){
											_octane.hooks[alias+'.'+keys[n]] && this._applyHooks(keys[n],inbound);
										}
									}

									// re-measure in case there have been additional properties
									// added to fresh via hooks
									_.each(inbound,function(value,path){
										//this._setData(binding,value);
										_.set(this.data,path,value);
										this.alias && this.fire('modelchange:'+path);
									},this);
									this.processing = false;
									this.queue && this._set.apply(this,this.queue);
								}
								// alert any subscribers
								alias && this.fire('modelchange:'+alias);
								return this.data;
							},

	// use reduce to set a value using a nested key, ex "App.loading.message" would set {App:{loading:{message:value}}}
	_setData: 	function(path,value){

								var data = this.data;
								var alias = this.alias;
								var keyArray = path.split('.');
								var k = keyArray.length;
								var modelUpdated;

								try{
									keyArray.reduce(function(o,x,index){
										if(index === (k-1)){ // last iteration
											return o[x] = value;
										}else{
											return o[x] = _.isPlainObject(o[x]) ? o[x] : {}; // create object if not already
										}
									},data);

									modelUpdated = true;
								}catch(ex){
									modelUpdated = false;
									this.log('Unable to set model data at "'+path+'"',ex);
								}
								modelUpdated && alias && this.fire('modelchange:'+alias+'.'+path);
							},

	// helper, applies hooks on changed model state attributes before they get set
	_applyHooks:function(path,inbound){

								if(this.alias){
									var hooks = _octane.hooks[this.alias+'.'+path];
									var fresh = _.get(inbound,path);
									var current = this.data;

									_.each(hooks,function(hook){
										fresh && hook(fresh,inbound,current);
									});
								}
							},

	_unset: 		function(toUnset,timeout,throttle){

								if(!toUnset) return;

								_.isArray(toUnset) || (toUnset = toUnset.split(','));

								if(timeout && (utils.typeOf(timeout) == 'number')){ // timout the unset

									if(throttle){                                // throttle the unsets
										_.each(toUnset,function(path,i){
												setTimeout(function(){
													this.set( path, void(0) );
												}.bind(this),timeout*(i+1));                   // make sure we timeout the 0 index
										},this);
									}else{                                      // unset all together after timeout
										setTimeout(function(){
											_.each(toUnset,function(path){
												this.set( path, void(0) );
											},this);
										}.bind(this),timeout);
									}
								} else {
									_.each(toUnset,function(path){         // unset all immediately
										this.set( path, void(0) );
									},this);
								}
							},

	_destroy: 	function(){

								var  keys = Object.keys(this.data);
								var n = keys.length;

								while(n--){
									this.data[keys[n]] = null;
								}
								this.clearEventCache();

								this.alias && this.detach();
							},

	_get: 			function(path){

								if(_.isString(path)){
									return _.get(this.data,path);
								} else {
									return this.data;
								}
								/*
								var data;
								if(_.isString(binding)){

										var keyArray = binding.split('.');
										var l = keyArray.length;

										try{
											data = keyArray.reduce(function(o,x,i){
													return o[x];
											},this.state);
										}catch(ex){
											data = null;
											this.log('Unable to get model data "'+binding+'"',ex);
										}
										return data;
								} else {
										return this.state;
								}
								*/
							},

	_getAt: 		function(path,index){

								var prop = this._get(path);
								if(_.isArray(prop)){
									return prop[index];
								}else{
									return prop;
								}

							},

	_clear: 		function(){

								var alias = this.alias;

								_.forOwn(this.data,function(value,key){
									this.data[key] = null;
									alias && this.fire('modelchange:'+alias+'.'+key);
								});
								// alert any subscribers
								if(alias) this.fire('modelchange:'+alias );

								return this;
							},

	_reset: 		function(defaults){
								this.clear()
								this.set(defaults || this.defaults);
							}
});


var modelProtoProps = {
	defaults: 	{},
	constructor:OctaneModel,
	initialize: function(){},
	get: 				function(){
								return this._get.apply(this,arguments);
							},
	set:  			function(){
								return this._set.apply(this,arguments);
							},
	unset:  		function(){
								return this._unset.apply(this,arguments);
							},
	clear: 			function(){
								return this._clear();
							},
	getAt: 			function(){
								return this._getAt.apply(this,arguments);
							},
	destroy: 		function(){
								this._destroy();
							},
	reset: 			function(){
								this._reset.apply(this,arguments);
							}
};

// overwritable aliases for extension classes
OctaneModel.prototype.extend(modelProtoProps);

module.exports = OctaneModel;
