
var define 				= Object.defineProperty;
var _ 						= require('lodash');
var Promise 			= require('bluebird');
var utils 				= require('./lib/utils.js');
var log 					= require('./lib/logger.js').log;
var Events 				= require('./lib/events.js');



function OctaneBase(){

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

	this.guid();
	this.initialize.apply(this,arguments);
}

OctaneBase.appInitialized = false;
OctaneBase.debugMode = true;

// class extension method, from required
define(OctaneBase,'extend',{
	value: extend,
	writable: false,
	configurable: false,
	enumerable: true
});


OctaneBase.prototype = {
	Utils: 			utils,
	extend: 		function(ext){
								return _.extend(this,ext);
							},
	initialize: function(){},
};


define(OctaneBase.prototype,'Base',{
	value: 			function(){
		return OctaneBase;
	},
	writable: 	false,
	configurable: false
});


define(OctaneBase.prototype,'Factory',{
	value: 			function(){
		return OctaneBase.extend.apply(OctaneBase,arguments);
	},
	writable: 	false,
	configurable: false
});


// shortcut method to define immutable properties
define(OctaneBase.prototype,'defineProp',{
	value: 			function (isWritable,prop,val){

								if(_.isBoolean(arguments[0])){
									isWritable = arguments[0];
									prop = arguments[1];
									val = arguments[2];
								} else {
									// if no writable definition is passed, read first argument as prop
									prop = arguments[0];
									val = arguments[1];
									// default to non-writable
									isWritable = false;
								}

								switch(true){
									case _.isObject(prop):
										var keys = Object.keys(prop);
																			var key;

										for (var i=0,n = keys.length; i<n; i++){
											key = keys[i];
											try{
												define(this,key,{
													value : prop[key] ,
													configurable : false,
													writable: isWritable,
													enumerable: true
												});
											} catch(ex){
												Octane.log(ex)
											}
										}
										break;
									case _.isString(prop):
										try{
											define(this,prop,{
												value : val,
												configurable : false,
												writable : isWritable,
												enumerable:true
											});
										} catch(ex){
											Octane.log(ex);
										}
										break;
								}
								return this; // chainable
							},
	writable: 	false,
	configuarable: false
});

define(OctaneBase.prototype,'defineGetter',{
		value : 	function(name,getter){
								define(this,name,{
									get: getter,
									configurable : false
								})
							},
		writable: false,
		configurable: false
});

define(OctaneBase.prototype,'defineSetter',{
		value: 		function(name,setter){
								define(this,name,{
									set: setter,
									configurable : false
								})
							},
		writable: false,
		configurable: false
});

define(OctaneBase.prototype,'accessors',{
		value: 		function(name,pair){
								define(this,name,{
									get : pair.get,
									set : pair.set,
									configurable: false
								})
							},
		writable: false,
		configurable: false
});


// assign a unique identifier for objects
// set as immutable, non-enumerable property on the object
// pass an object or object will be set to `this`
// returns the object's unique id if already assigned
define(OctaneBase.prototype,'guid',{
		value: 		function(obj){

								if(obj && !_.isObject(obj)) return;
								if(!obj) obj = this;
								if(obj.octane_id) return obj.octane_id;

								var random4 = function() {
									return (((1 + Math.random()) * 0x10000)|0).toString(16).substring(1).toUpperCase();
								};

								Object.defineProperty(obj,'octane_id',{
									value : random4() +'-'+ random4() +'-'+ random4() + random4(),
									writable : false,
									configurable : false,
									enumerable : false
								});
								if(obj.setAttribute) obj.setAttribute('octane-id',obj.octane_id);
								return obj.octane_id;
							},
		writable: false,
		configurable: false
});

define(OctaneBase.prototype,'log',{
	value: function(message,error){
		if(OctaneBase.debugMode) log.apply(this,[message,error]);
	},
	writable: false,
	configurable: false
});

// set up event interface with the Quarterback
_.extend(OctaneBase.prototype,Events);


module.exports = OctaneBase;
