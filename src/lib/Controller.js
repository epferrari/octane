var _           = require('lodash');
var OctaneBase  = require('./OctaneBase.js');
var _octane     = require('./_octane.js');
var extend      = require('./extend.js');




function OctaneController(name,config){

	this.initialize && this.initialize.apply(this,arguments);
	// add this Controller instance to the _octane controllers hash
	this.name && (_octane.controllers[this.name] = this);
}

OctaneController.prototype = Object.create(OctaneBase.prototype);

_.extend(OctaneController.prototype,{
	constructor: OctaneController,
	initialize: function(){},
	destroy: function(){
		_octane.controllers[this.name] = null;
	}
});


Object.defineProperty(OctaneController,'extend',{
	value: extend,
	writable: false,
	configurable: false
});

module.exports = OctaneController;
