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



var utils = {

	// checks for a sting with no value
	// [undefined, null, '', empty string]
	isBlank: function (param){
		if(param === undefined || param === null || param === '') return true;
	},

	isEmail: function(email){
		return /^[-0-9a-zA-Z]+[-0-9a-zA-Z.+_]+@(?:[A-Za-z0-9-]+\.)+[a-zA-Z]{2,4}$/.test(email);
	},


	// create events
	createEvent:function  (type) {
		var event;
		try {
				event = new Event(type);
		}catch(e){
				event = document.createEvent('event');
				event.initEvent(type,true,false);
		}
		return event;
	},


	// create custom events
	customEvent: function (type,params) {
		var event;
		if (window.CustomEvent) {

			try{
				params = params || { bubbles: false, cancelable: false, detail: {} };
				event = new CustomEvent(type, params);
			}catch (e){
				event = document.createEvent('CustomEvent');
				event.initCustomEvent(type, params.bubbles || false, params.cancelable || false, params.detail || {});
			}

		} else {
			event = document.createEvent('CustomEvent');
			event.initCustomEvent(type, params.bubbles || false, params.cancelable || false, params.detail || {});
		}
		return event;
	},


	// a better typeof operation, although slower, it has the benefit of being predicatble
	// credit: Angus Croll
	// http://javascriptweblog.wordpress.com/2011/08/08/fixing-the-javascript-typeof-operator/
	typeOf: 		function(obj) {
		return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
	},


	// create objects from query string in URL
	// credit Cory LaViska,
	// http://www.abeautifulsite.net/parsing-urls-in-javascript/
	/* --------------------------------------------------------------------- */
	urlObject: 	function (){
		var parser = document.createElement('a'),
				searchObject = {},queries, param, n, key, val;

		// Let the browser do the work
		parser.href = window.location;
		// Convert query string to object
		queries = parser.search.replace(/^\?/,'').split('&');

		n = queries.length;

		while(n--){
			param = queries[n].split('=');

			if(param){
				key = param[0];
				val = param[1];
				if(!utils.isBlank(key)) searchObject[key] = val;
			}
		}
		return {
			protocol			: parser.protocol,
			host					: parser.host,
			hostname			: parser.hostname,
			port					: parser.port,
			pathname			: parser.pathname,
			searchString	: parser.search,
			searchObject	: searchObject,
			hash					: parser.hash
		};
	},


	titleize: function(string){

		if(utils.typeOf(string) == 'string'){
			return string
			.replace(/[-_]+/g,' ')
			.trim()
			.replace(/^.|\s+?[a-z]/g,
				function(chr){
					return chr.toUpperCase();
			})
			.replace(/([a-z])([A-Z])/g,function(pattern,chr1,chr2){
				return chr1+' '+chr2.toUpperCase();
			})
		}
	},


	camelize: 	function(string){

		if(utils.typeOf(string) == 'string'){
			return string
			.replace(/\W+?[a-z]|\_+?[a-z]/g,
				function(chr){
					return chr.toUpperCase();
			})
			.replace(/\W+|\_+/g,'');
		}
	},


	dashify : 	function(string){
		if(utils.typeOf(string) == 'string'){
			return string
			.trim()
			.replace(/([a-z])([A-Z])/g,function(pattern,chr1,chr2){
				return chr1+'-'+chr2.toLowerCase();
			})
			.replace(/[A-Z]/g,function(chr){
				return chr.toLowerCase();
			})
			.replace(/\s+|[_]+/g,'-')
			.replace(/-{2,}/g,'-');
		}
	},


	inArray : 	function(array,value){
		return array.indexOf(value) !== -1;
	},


	// wrap a thenable in a bluebird promise
	promisify: 	function(deferred){
		var args = Array.prototype.slice.call(arguments,1);
		return new Promise(function(resolve,reject){
			deferred.apply(deferred,args).then(resolve,reject);
		});
	},

	guid: function(obj){

		if(obj && !(obj instanceof Object)) return;
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
	}
};

module.exports = utils;
