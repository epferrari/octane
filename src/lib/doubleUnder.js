// utility methods

(function (__,window,jQuery){


	// intentionally global
	var $fn = {
		// checks for a sting with no value
		// [undefined, null, '', empty string]
		isBlank	:		function (param){

								var case_ = '_'+param;
								var cases = {
										_undefined 	: function(){ return true; },
										_null				: function(){ return true; },
										_						: function(){ return true; }
									};
								case_ = case_.trim();
								return cases[case_] ? cases[case_]() : false;
							},

		isEmail :function(email){

				return /^[-0-9a-zA-Z]+[-0-9a-zA-Z.+_]+@(?:[A-Za-z0-9-]+\.)+[a-zA-Z]{2,4}$/.test(email);
		},
		// create events
		createEvent	:	function  (type) {

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
		customEvent : 	function (type,params) {

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
		typeOf : function(obj) {
						return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
				},

		// create objects from query string in URL
		// credit Cory LaViska, http://www.abeautifulsite.net/parsing-urls-in-javascript/
		/* --------------------------------------------------------------------- */

		urlObject : function (){

			 var parser = document.createElement('a'),
					searchObject = {},
					queries, param;
			 // Let the browser do the work
			 parser.href = window.location;
			 // Convert query string to object
			 queries = parser.search.replace(/^\?/, '').split('&');

			 for( var i = 0,n = queries.length; i < n; i++ ) {
					param = queries[i].split('=');

					if( !$fn.isBlank(param) ){
						var key = param[0],val = param[1];
						searchObject[key] = val;
					}
			 }
			return {
					protocol		: parser.protocol,
					host			: parser.host,
					hostname		: parser.hostname,
					port			: parser.port,
					pathname		: parser.pathname,
					searchString	: parser.search,
					searchObject	: searchObject,
					hash			: parser.hash
			 };
		},

		titleize : function(string){

										if($fn.typeOf(string) == 'string'){
												return string
																.replace(/\-+|[_]+/,' ')
																.replace(/^.|\s+?[a-z]/g,
																		function(chr){
																				return chr.toUpperCase();
																});
										}
								},

		camelize : function(string){

										 if($fn.typeOf(string) == 'string'){
												return string
												.replace(/\W+?[a-z]|\_+?[a-z]/g,
														function(chr){
																return chr.toUpperCase();
												})
												.replace(/\W+|\_+/g,'');
										 }
								},

		dashify : function(string){

										 if($fn.typeOf(string) == 'string'){
												return string
																.replace(/\s+|[_]+/g,'-')
																.replace(/[A-Z]/g,
																		function(chr){
																				return '-'+chr.toLowerCase();
																})
																.replace(/-{2}/g,'-');
										 }
								},

		inArray : function(array,value){

										return array.indexOf(value) !== -1;
								}

	};

	__.Switch = function (obj){
		this.cases = {};
		_.each(obj,this.addCase,this);
		this.addCase = function addCase(func,key){

			var cases = this.cases;
			// ensure array
			((_.isArray(cases[key]) && cases[key])||(cases[key] =[])).push(func);
			return this; // chainable
		};

		// @param 0 _case[str]: the value you're trying to match
		// @params 1+ arguments to pass to a matched function or functions
		this.run = function run(test,params,thisArg){

			var cases = this.cases;
			var fns		= cases[test];
			var def		= cases.default;

			// ensure arrays
			_.isArray(params)||(params=[params]);

			if(fns){
				return _.map(fns,function(fn){
					return fn.apply(thisArg,params);
				});
			}else{
				return def ? def.apply(thisArg,params) : false;
			}
		}
};

	window[__] = $fn;

})('__',window);
