// utility methods

(function (__,window){

	var du = {
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

					if( !du.isBlank(param) ){
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

										if(du.typeOf(string) == 'string'){
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

		camelize : function(string){

										 if(du.typeOf(string) == 'string'){
												return string
												.replace(/\W+?[a-z]|\_+?[a-z]/g,
													function(chr){
														return chr.toUpperCase();
												})
												.replace(/\W+|\_+/g,'');
										 }
								},

		dashify : function(string){

										 if(du.typeOf(string) == 'string'){
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

		inArray : function(array,value){

										return array.indexOf(value) !== -1;
								}

	};

	window[__] = du;

})('__',window);
