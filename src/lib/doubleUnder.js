// utility methods
	
(function (__,window,jQuery){	
	 
	// intentionally global
	var $fn = {
		
		// return if an object is an object but not an array
		isObject	: 	function ($$,strict){
							if(strict){
								return ( (typeof $$ === 'object') && ($$ !== null));
							}
							return (typeof $$ === 'object') && ($$ !== null) && !($$ instanceof Array);
						},
		
		isArray	:	function ($$){
							return ( (typeof $$ === 'object') && ($$ instanceof Array) && $$.length >= 0 );
						},
		
		//  [undefined, null, false, 'false', 0, '0', '', empty string]
		isFalsey	:	function ($$){
							
							var case_ = 'case_'+$$,
								cases = {
									case_false		: function() { return true; },
									case_0 			: function() { return true; },
									case_null		: function() { return true; },
									case_undefined 	: function() { return true; },
									case_			: function() { return true; }
								};
							case_ = case_.trim();
							return cases[case_] ? cases[case_]() : false;
							
						},
		
		// checks undefined using strict equality (===)
		// [undefined]
		isUndefined	:	function ($$){
									return ( typeof $$ === 'undefined');
							},
		// checks null using strict equality (===)
		// [null]
		isNull		:	function ($$){
								return ($$ === null);	
							},
		// checks for a sting with no value
		// [undefined, null, '', empty string]
		isBlank	:		function ($$){
							
							var case_ = 'case_'+$$,
								cases = {
									case_undefined 	: function(){ return true; },
									case_null		: function(){ return true; },
									case_			: function(){ return true; }
								};
							case_ = case_.trim();
							return cases[case_] ? cases[case_]() : false;
						},
		
		is$		:		function ($$){
								return ($$ instanceof jQuery);
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
					
		 Switch : function (caseObject){
        			
                    // preserve this in function scope
					var $this = this,
                        cases = {};
             
					if(_.isObject(caseObject)){
                        for(var $case in caseObject){

                            if( ({}).hasOwnProperty.call(caseObject,$case) ){
                                addCase($case,caseObject[$case]);
                            }
                        }
                    }
             
					// private methods
					function addCase(key,func,strict){
						
						// STRICT: only add case if it's not already defined
						if(strict){
							($fn.typeOf(cases[key]) == 'undefined') && (cases[key] = [func]);
							return;
						}
						
                        // ensure array
                        cases[key] = !_.isArray(cases[key]) ? [] : cases[key];
                        // ensure function
                        _.isFunction(func) && cases[key].push(func);
                        
						return $this;				
					}
								
					// @param $case[str]: the value you're trying to match
					// @param args[array]: arguments to pass to a matched function or functions 
					function run($case,args){
						
                        if(!cases['default']){
                            cases['default'] = [function(){ return false; }];
                        }
                        
						var $this = this;
						
                        // make sure the arguments are an array
						args = _.isArray(args) ? args : (_.isString(args) ? args.split(',') : []);
                        
                        return cases[$case] ? callAll(cases[$case],args) : cases['default'][0](args);
						
                        // helper
                        function callAll(funcArray,args){
							
                            var n = funcArray.length;
                            
                            if(n == 1){
                                return _.isFunction(funcArray[0]) && funcArray[0].apply(null,args);
                            }else{
                                for(var i=0; i<n; i++){
                                   // closure to preserve func reference 
                                   callOne(funcArray[i],args);
                                }
                            }
						}
                        
                        // helper's helper
                        function callOne(func,args){
                            // set timeout for async
                            setTimeout(function(){
                                _.isFunction(func) && func.apply(null,args);
                           },0);
                        }
					}
					
					// public
					
					this.addCase = function(key,func){ 
						return addCase(key,func); 
					};
					this.run = function($case,argsArray){ 
						return run($case,argsArray); 
					};
					this.getCases = function(){ 
						return cases; 
					};
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
			
		location : function (){
				 
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
	
   
    
	!String.prototype.__titleize  && Object.defineProperty(String.prototype,'__titleize',{
		value : function (){
			return this
					.replace(/\-+|[_]+/,' ')
					.replace(/^.|\s+?[a-z]/g,
						function(chr){
							return chr.toUpperCase();
					});
		},
		configurable	: false,
		writable 		: false,
		enumerable 		: false
					
	});

	!String.prototype.__camelize && Object.defineProperty(String.prototype,'__camelize',{
		value : function (){			
			return this
					.replace(/\W+?[a-z]|\_+?[a-z]/g,
						function(chr){
							return chr.toUpperCase();
					})
					.replace(/\W+|\_+/g,'');
		},
		configurable	: false,
		writable 		: false,
		enumerable 		: false
	});
		
	!String.prototype.__dashify && Object.defineProperty(String.prototype,'__dashify',{
		value : function (){
			return this
					.replace(/\s+|[_]+/g,'-')
					.replace(/[A-Z]/g,
						function(chr){
							return '-'+chr.toLowerCase();
					})
					.replace(/-{2}/g,'-');
		},
		configurable	: false,
		writable 		: false,
		enumerable 		: false
	});
	
	!Function.prototype.__construct && Object.defineProperty(Function.prototype,'__construct',{
		value:  function (args){
					var proto = this.prototype;
					var instance = Object.create(proto);
					this.apply(instance,args);
					return instance;
				},
		configurable	: false,
		writable 		: false,
		enumerable 		: false
	});
					
	
	!Array.prototype.__contains && Object.defineProperty(Array.prototype,'__contains',{
		value 			: function (value){ return this.indexOf(value) !== -1; },
		configurable	: false,
		writable 		: false,
		enumerable 		: false
	});

	!Array.prototype.__isEmpty && Object.defineProperty(Array.prototype,'__isEmpty',{
		value 			: function (){ return this.length === 0; },
		configurable 	: false,
		writable 		: false,
		enumerable 		: false
	});
	
	// augmenting Object.prototype? Insanity! At least it's non-enumberable...
	!Object.prototype.__isEmpty && Object.defineProperty(Object.prototype, '__isEmpty',{
		value : function (){
					var prop;
					for(prop in this){
						if( ({}).hasOwnProperty.call(this,prop)){
							return false;
						}
					}
					return true;
		},
		configurable 	: false,
		writable 		: false,
		enumerable 		: false
	});
	
	window[__] = $fn;
	
})('__',window,jQuery);
		

		
		
	