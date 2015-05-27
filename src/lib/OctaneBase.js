
var define 				= Object.defineProperty;
var _ 						= require('lodash');
var Promise 			= require('bluebird');
var utils 				= require('./utils.js');
var _octane 			= require('./_octane.js');
var logger 				= require('./logger.js').log;
var Events 				= require('./Events.js');
var extend 			  = require('./extend.js');



function OctaneBase(){

	// set up to handle events
	// functionality added with Events decorator object
	/*
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
	*/

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
	Utils: 			utils,
	extend: 		function(ext){
								return _.extend(this,ext);
							},
	initialize: function(){},
};


define(OctaneBase.prototype,'Proto',{
	value: 			function(){
		return new OctaneBase();
	},
	writable: 	false,
	configurable: false
});



// shortcut method to define immutable properties
define(OctaneBase.prototype,'defineProp',{
	value: 			function (isWritable,prop,val){

								if(!_.isBoolean(isWritable)){
									// if no writable definition is passed, read first argument as prop
									val = prop;
									prop = isWritable;
									// default to non-writable
									isWritable = false;
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
													writable: isWritable,
													enumerable: true
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
												writable : isWritable,
												enumerable:true
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
	value:  function(obj){
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

_.extend(OctaneBase,Events);
// set up event interface with the Quarterback
_.extend(OctaneBase.prototype,Events);


module.exports = OctaneBase;
