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
var OctaneBase  = require('./OctaneBase.js');
var _octane     = require('./_octane.js');
var extend      = require('./extend.js');




function OctaneController(name,config){
	_.isString(name) && (this.name = this.__loggerId__ = name);

	_.isPlainObject(config) && _.extend(this,config);
	this.guid();
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
