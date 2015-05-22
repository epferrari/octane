var _ 					= require('lodash');
var OctaneBase 	= require('./OctaneBase.js');
var _octane 		= require('./_octane.js');
var extend 			= require('./extend.js');




function OctaneController(name,config){

	_.isString(name) && (this.name = name);

	_.isPlainObject(config) && _.extend(this,config);

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

	this.initialize && this.initialize.apply(this,arguments);
	// add this Controller instance to the _octane's controllers object
	this.name && (_octane.controllers[this.name] = this);
}




OctaneController.prototype = new OctaneBase;

_.extend(OctaneController.prototype,
{
	constructor: OctaneController,
	initialize: function(){},
	destroy: 		function(){
								_octane.controllers[this.name] = null;
							}
});


Object.defineProperty(OctaneController,'extend',{
	value: extend,
	writable: false,
	configurable: false
});

module.exports = OctaneController;
