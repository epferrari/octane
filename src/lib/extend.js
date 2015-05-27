var _ 		= require("lodash");
var utils = require("./utils.js");




// prototype chaining Backbone.js style
module.exports = function extend(){

	var className,config,staticMethods,P,o,_o;

	if(utils.typeOf(arguments[0]) == 'string'){
			className = arguments[0];
			config = arguments[1] || {};
			staticMethods = arguments[2] || {};
	}else{
			config = arguments[0] || {};
			staticMethods = arguments[1] || {};
	}

	P = this;

	if(config.constructor !== Object && _.isFunction(config.constructor)){
		o = config.constructor;
	} else {
		o = function(){
			return P.apply(this,arguments);
		};
	}

	_.extend(o,P,staticMethods);

	_o = function(){ this.constructor = o; };
	_o.prototype = P.prototype;
	o.prototype = new _o;


	// ensure prototype has a defaults object
	o.prototype.defaults = {};
	_.merge(o.prototype, config);

	o.__super__ = P.prototype;

	return o;
};
