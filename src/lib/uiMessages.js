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
