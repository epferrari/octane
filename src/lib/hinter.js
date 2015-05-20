var _ = require('lodash');
var OctaneModel = require('./model.js');

var Hinter = OctaneModel.extend({
	hint: 			function(){

								var setObject,toUnset,timeout;

								// handle key,value and {key:value}
								if(_.isString(arguments[0])){
										setObject = {};
										setObject[arguments[0]] = arguments[1];
										timeout = arguments[2];
								} else if(_.isObject(arguments[0])){
										setObject = arguments[0];
										timeout = arguments[1];
								} else {
										return {};
								}
								timeout || (timeout = 5000);

								// automatically remove after 5 seconds or specified time
								toUnset = Object.keys(setObject);
								this._set(setObject);
								this._unset(toUnset,timeout);
							}
});

return Hinter;
