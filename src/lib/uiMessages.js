
	var _           = require('lodash');
	var OctaneModel = require('./OctaneModel.js');

	var uiMessages = new OctaneModel();

	uiMessages.hint =  function(){

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

			// automatically unset after 5 seconds || passed-in time
			toUnset = Object.keys(setObject);
			this._set(setObject);
			this._unset(toUnset,{timeout:timeout});
	};

	uiMessages.become('UiMessages');

	module.exports = uiMessages;
