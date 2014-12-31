// utility methods
	
(function (__,window){	
	 
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
                        cases[key] = !_.isArray(cases[key]) && [];
                        // ensure function
                        _.isFunction(func) && cases[key].push(func);
                        
						/*// helpers
						function convertToArray(key,func){
							var orig = cases[key];
							cases[key] = [orig,func];
						}
						function pushToArray(key,func){
							cases[key].push(func);
						}
						function setVal(key,func){
							cases[key] = func;
						}
						// hash
						var caseIs = {
							'function' 	: convertToArray,
							'array'		: pushToArray,
							'undefined'	: setVal
						};
						
						var caseType = $fn.typeOf(cases[key]);
						caseIs[caseType] && caseIs[caseType](key,func);*/
						
						return $this;				
					}
								
					// @param $case[str]: the value you're trying to match
					// @param args[array]: arguments to pass to a matched function or functions 
					function run($case,args){
						
                        if(!cases['default']){
                            cases['default'] = [function(){ return false; }];
                        };
                        
						var $this = this;
						
                        // make sure the arguments are an array
						args = _.isArray(args) ? args : (_.isString(args) ? args.split(',') : []);
						
                        return cases[$case] ? callAll(cases[$case],args) : cases['default'][0](args);
						
                        // helper
                        function callAll(funcArray,args){
							
                            var n = funcArray.length;
                            
                            if(n == 1){
                                return funcArray[0].apply(null,args);
                            }else{
                                for(var i=0; i<n; i++){
                                    // set timeout for async
                                    setTimeout(function(){

                                        funcArray[i].apply(null,args);
                                    },0);
                                }
                            }
						}
                        
						/*// call a single function from the hash table
						function callOne(func,args){
							return fn(args);
						}
						// call all the functions in the hash table successively
						// are NOT chained by return values
						
						// hash
						var caseIs = {
							'function'  : callOne,
							'array'		: callAll
						};
						
						var caseType  = $fn.typeOf(cases[$case]);
						return types[type] ? types[type].apply($this,[cases[$case],args]) : cases.default();*/
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
	
})('__',window);
		

		
		
	;// JavaScript Document

	(function($,_,__){
		
       // 'use strict';
		// check that doubleUnder utility library is included
		if(!window.__) { return false; }
		// Octane is already instanced
		if(window.Octane) { return false; }
		
        document.createElement('o-container');
        document.createElement('o-view-canvas');
        document.createElement('o-view');
        document.createElement('o-model');
        document.createElement('o-lang'); 
		
		
	/* ------------------------------------------------------- */
	// basic extension utility constructor
	/* ------------------------------------------------------- */
		
		function Base(name){ this.name = _.isString(name) && name; }	
		
		// extend an object with the properties and method of another object
		// overwrites properties by default, set to false to only extend undefind properties
		Object.defineProperty(Base.prototype,'extend',{
			value: function  (obj,overwrite){
			
						overwrite = _.isBoolean(overwrite) ? overwrite : true;
				        var i;
						if(_.isObject(obj)){
							for(i in obj){
								if(({}).hasOwnProperty.call(obj,i)){
										if(overwrite){ // do overwrite
											this[i] = obj[i];	
										}else { // only write undefined properties
											if(!(this[i])) { this[i] = obj[i]; }	
										}
								}
							}
						}
						return this; // chainable
					},
			writable : false,
			configuarable : false
		});
		
		// quick method to define immutable properties
		Object.defineProperty(Base.prototype,'define',{
			value : function (isWritable,prop,val){
							
							if(_.isBoolean(arguments[0])){
								isWritable = arguments[0];
								prop = arguments[1];
								val = arguments[2];
							} else {
								// if no writable definition is passed, read first argument as prop
								prop = arguments[0];
								val = arguments[1];
								// default to non-writable
								isWritable = false;	
							}
							
							switch(true){
								case _.isObject(prop):
									var keys = Object.keys(prop),key;
									for (var i=0,n = keys.length; i<n; i++){
										key = keys[i];
										Object.defineProperty(this,key,{
											value : prop[key] ,
											configurable : false,
											writable: isWritable,
											enumerable: true
										});
                                    }
									break;	
								case _.isString(prop):
									Object.defineProperty(this,prop,{
										value : val,
										configurable : false,
										writable : isWritable,
										enumerable:true
									});
									break;
							}
                            return this; // chainable
						},
			writable	: false,
			configuarable : false
		});
		
			
		
	/* ------------------------------------------------------- */
	// define public Octane
    // intentionally global
	/* ------------------------------------------------------- */
		Octane = $o = new Base('Octane'); // jshint ignore:line
		
	/* ------------------------------------------------------- */
	// private octanelication object and properties
	/* ------------------------------------------------------- */
		
		var octane = new Base('Octane protected');
		octane.define({
				modules		    : {},
				models		    : {},
				views		    : {},
				controllers     : []
		});
	
	/* ------------------------------------------------------- */
	//  Application Unique IDs
	/* ------------------------------------------------------- */		
		
		// set a unique identifier for the DOM element so we don't double count it
		Octane.define({
			GUID : function(){
				var random4 = function() {
					return (((1 + Math.random()) * 0x10000)|0).toString(16).substring(1).toUpperCase();
				};
				return 'Octane'+ random4() +'-'+ random4() +'-'+ random4() + random4();
			}
		});
	
	/* ------------------------------------------------------- */
	//  Application Error handling
	/* ------------------------------------------------------- */		
		
		octane.errors = {
			logfile : 	[],
			log 	: 	function(message){
							this.logfile.push(message);
						},
			get		: 	function(){
							return this.logfile;
						}
		};
		
		// helper for dependencies, etc	
		function verify(conditions,constructor,$context){
		
			conditions = _.isArray(conditions) ? conditions : [];
		
            for(var	i=0, n = conditions.length;i<n;i++){
				if(!conditions[i][0]){
					octane.errors.log('Context: '+$context+'. A '+constructor+' failed; '+conditions[i][1] );
					return false;
				}		
			}
			return true;	
		}
	
        
	/* ------------------------------------------------------- */
	//  Application Event Handling
	/* ------------------------------------------------------- */		
		
        // a custom event for the app to fire when user data changes
       Octane.define({
            trip       :   function(elem){
                
                                var rand = Math.random(),
                                    e = __.customEvent('input',{bubbles:true,detail:rand});

                                elem.dispatchEvent && elem.dispatchEvent(e);
                            }
        });
		
        octane.eventRegister = {};
		
		Octane.define({
			
			handle		: 	function(type,handler){
                                
                                var types = type ? type.split(' ') : [];
                                for(var i=0,n=types.length; i<n; i++){
								    window.addEventListener(types[i],handler,false);
                                    if( !_.isArray(octane.eventRegister[types[i]]) ){ 
                                        octane.eventRegister[types[i]] = [];
                                    }
								    octane.eventRegister[types[i]].push(handler);
                                }
							},
			fire 		: 	function(type,detail){
								if(_.isString(type)){
									var e = detail ? __.customEvent(type,detail) : __.createEvent(type);
									window.dispatchEvent(e);
								}
							}	
		});
		
		// not sure what I'm doing with this now, seems handy
		function validTag(name){
				name = name.trim();
				name = name.replace(/\s+|[_]+/,'-');
				name = name.replace(/[^A-Za-z0-9]+/,'');
				return name.toLowerCase();
		}
	
	
	/* ------------------------------------------------------- */		
	// Application input Filtering 
	/* ------------------------------------------------------- */
		
		octane.audits = new __.Switch();
		
		Octane.define({
			addAudit : function (name,valid,invalid){
                
                valid = valid || /.*/;
                invalid = invalid || /.*/;
                
                var func = function($data){
                    
                    switch(true){
                        case valid.test($data):
                            return {
                                data 	: $data,
                                result	: 'valid'
                            };

                        case (_.isEmpty($data) || _.isUndefined($data)):
                            return {
                                data 	: null,
                                result	: 'undefined'
                            };
                        case invalid.test($data):
                             return {
                                data 	: null,
                                result	: 'invalid'
                            };
                        default: 
                            return {
                                data 	: $data,
                                result	: 'default'
                            };
                    }
                }
                
				octane.audits.addCase(name,func,true);	
			}
		});
		
		Octane.addAudit('number',/^[-]*\d+$/);
        Octane.addAudit('email',/^[-0-9a-zA-Z]+[-0-9a-zA-Z.+_]+@(?:[A-Za-z0-9-]+\.)+[a-zA-Z]{2,4}$/);
        Octane.addAudit('tel',/^[-0-9\.]{7,12}$/);
                    
	
	/* ------------------------------------------------------- */
	//  Application Utility Libraries
	/* ------------------------------------------------------- */	
	
		octane.libraries = {};
        octane.dictionaries = {};
		
        function Library(name,data){
           
            var lib = _.isObject(data) ? data : {};
            this.name = name;
            this.checkout = function(){
                return lib;
            };
            this.contrib = function(prop,data){
                if(!lib[prop]){
                    lib[prop] = data;
                }
            };
        }
        
        function Dictionary(name,data){
            
            var dict = _.isObject(data) ? data : {};
            this.get = function(){
                return dict;
            }
        }
        
		Octane.define({
			Library : function(name,lib){
				octane.libraries[name] = _.isObject(lib) ? new Library(name,lib) : {};
			},
			lib : function(name){
				return octane.libraries[name] instanceof Library && octane.libraries[name].checkout();
			},
            Dictionary : function(name,data){
                octane.dictionaries[name] = _.isObject(data) ? new Dictionary(name,data) : {};
            },
            dict : function(name){
                return octane.dictionaries[name] instanceof Dictionary && octane.dictionaries[name].get();
            }
		});
	
	
	/* ------------------------------------------------------- */
	//  Application Models
	/* ------------------------------------------------------- */
	
		function Model(name,options){
			
			options = _.isObject(options) ? options : {};
			options.context = options.context || 'global';
            
			var conditions = [
                    [
                        _.isString(name),
                        'Model name must be a string.'
                    ]
                ],
                loadable = verify(conditions,'Model',options.context);
                
			if(!loadable) return {instanced:false};
			
			// RESTful
			var db = {};
			var $this = this;
            
            this.define({
				instanced	: true,
				name		: name,
                context     : options.context,
				state		: {}
            });
            var $ViewModel = new ViewModel($this);
            
			// public
			this.define({
				access		: function(key) { return db[key]; },
                reScope    : function(){ $ViewModel.parse(); }
			});
			
			// initialize
			(function ($this){

				octane.models[name] = $this;
				
				Base.prototype.extend.call(db,options.db);
				$this.set(options.defaults);
			})(this);			
		}
		
	/* prototype Model */	
		
		Model.prototype = new Base();
        Model.prototype.constructor = Model;
		Model.prototype.define({
			set	: function(fresh){
									
							if(!_.isObject(fresh) || !_.isObject(this.state)) return;
							
							// array for state properties changed
							var updated = [],
                                $state 	= this.state,
                                keyStringsToParse = Object.keys(fresh);
                            
                            for(var i=0,n=keyStringsToParse.length; i<n; i++){
                                
                                var keyString = keyStringsToParse[i],
                                    keyArray = keyString.split('.'),
                                    value = fresh[keyString],
                                    k = keyArray.length,
                                    modelUpdated;
                                
                                try{
                                    keyArray.reduce(function(o,x,index){
                                        
                                        if(index == (k-1)){
                                            return o[x] = value;
                                        }else{
                                            return o[x] = _.isObject(o[x]) ? o[x] : {};
                                        }
                                    },$state);
            
                                    modelUpdated = true;
                                }catch(e){
                                    modelUpdated = false;
                                    octane.errors.log('Unable to set model data "'+keyString+'". Error: '+e);
                                }
                                modelUpdated && updated.push(keyString);
                            }
                
                            var e = this.name+':statechange';
                            Octane.fire(e,{detail:updated});
						},
			get	: 	function(keyString){
                                
                                var $this = this;
                                
                                if(keyString){
                                    var keyArray = keyString.split('.');
                                    
                                    try{
                                        stateData = keyArray.reduce(function(o,x,i){
                                            return o[x];
                                        },$this.state);
                                    }catch(e){
                                        stateData = '';
                                        octane.errors.log('Unable to get model data "'+keyString+'". Error: '+e);
                                    }
                                    return stateData;
                                } else {
                                    return this.state;
                                }
						},
            process      : function($dirty){
                                
                            var contrls = octane.controllers;
                            for(var i = 0,n= contrls.length; i<n; i++){
                                if(contrls[i].model.name == this.name){
                                    contrls[i].doAudit($dirty);
                                }
                            }
                }
		});
		
	/* define Model on Octane - bridge to private properties and methods */
		
		Octane.define({
			Model 		: function (name,options){
							options = _.isObject(options) ? options : {}; 
							return new Model(name,options);
						}
		});
	
	/* ------------------------------------------------------- */
	//  Application Controllers
	/* ------------------------------------------------------- */
		
		function Controller($model,context){
			
            context = context || 'global';
            
			// validate context
			var	conditions = [
					[
                        $model instanceof Model,
                        'defined $model is not an instance of Octane.Model'
                    ],[
                        $model.instanced,
                        '$model passed as argument was not initialized'
                    ]
				],
                loadable = verify(conditions,'Controller',context);
			if(!loadable) return {instanced:false};
			
			var $this = this;
			// private properties
					
			// semi-public	API	
			this.define({
				
                instanced		: true,
				model			: $model,
				context         : context,
                tasks   		: new __.Switch(),
				audits          : {},
                parsers         : {},
			    hooks           : {},
				
                
			});
			
			// add this Controller instance to the octane's controllers object
			(function(){
				octane.controllers.push($this);
				
				var event = $this.model.name+':statechange';
				Octane.handle(event,$this);
			})();	
		}
		
	/* prototype Controller */
		
		Controller.prototype = new Base();
        Controller.prototype.constructor = Controller;
		Controller.prototype.define({
            
            // assign an octane check to be run on a 'dirty' data property
            audit		: function(o_bind,audit){
                                this.audits[o_bind] = audit;
                                return this; // chainable
                        },


            // a function to be octanelied in between the checking and the setting of data in the model
            // if one data value changes depending on another, a parser is the place for that logic
            // key is the incoming data key to parse for, fn is the function to apply
            // ALWAYS RETURN THE DATA for the next parser/setting model state
            parser			: function(o_bind,func){

                                    var $this = this;
                                    if(_.isFunction(func) && _.isUndefined(this.parsers[o_bind])){
                                        // make sure 'this' in our hooks refers to this Controller
                                        this.parsers[o_bind] = func.bind($this);
                                    }
                                    return this; // chainable	
                              },


            // add a new Switch instance with a case object to be processed
            // when a filter is called on the defined property
            hook			: function(bindKey,caseObject){
                                this.hooks[bindKey] = new __.Switch(caseObject);
                                return this; // chainable
                            },
            // add as function(keyString,data)
			task   : 	function(o_bind,func){
				
								var $this = this;
								if(_.isFunction(func)){
									this.tasks.addCase(o_bind,function(){
										
                                        var data = $this.model.get(o_bind);
                                        // make sure 'this' in our parser refers to this Controller
										func.bind($this)(o_bind,data);
									});
								}
								return this; // chainable
							},
			
			fetch	: 	function(dbKey){
				
								return this.model.access(dbKey);
							},
			// filters are called in the order they are defined on your element with the data-filters attribute (filtersArray)
			// they can be added to your controller in any order
			doAudit : function($dirty){
								var $this = this;
                                
								// loop through changed, 'dirty' properties passed to applyFilters from ViewModel
								function validate($data){
									
									   // helper
                                        function v(audit,o_bind,$dirty){


                                            // if a filter exists, run it on the data
                                            // return object filtered data and detail about its filtration ('valid','invalid','undefined',etc. (user defined))
                                            var returned = octane.audits.run(audit,[$dirty[o_bind]]);

                                            // return the filtered data to the data object
                                            $data[o_bind] = returned.data;

                                            // if hook exists for bindID, execute the hook with the result's audited data
                                            // else return the audited data
                                            return $this.hooks[o_bind] ? $this.hooks[o_bind].run(returned.result,[$data]) : $data;
                                        }
                                    // end helper
                                    
                                    $data = _.isObject($data) ? $data : {};
									
									for(var o_bind in $data){
										if( ({}).hasOwnProperty.call($data,o_bind) ){
											// look for an audit assigned to this o-bind keystring
											var $audit = $this.audits[o_bind];
											// purge the dirty data, execture hooks, and return
											$this.audits[o_bind] && v($audit,o_bind,$data);
										}
									}
									// return 
									return $data;
								}
								
                                var $validated =  validate($dirty);
								
								// hooks callback
								this.applyParsers($validated);	
							},
			
			applyParsers	: function($data){
                                if(_.isObject($data)){
                                    
                                    for(var o_bind in $data){
                                        if( ({}).hasOwnProperty.call($data,o_bind) ){
                                            $data = this.parsers[o_bind] ? this.parsers[o_bind]($data) : $data;
                                        }
                                    }
                                    this.model.set($data);
                                }
							},
            
			handleEvent : 	function(e){
								
								var $this = this,
									eventHandler = new __.Switch();
									
								eventHandler.addCase(this.model.name+':statechange',loopState);
								
                                // passed e.details, which on event "this.model.statechange"
                                // is an object of updated model states
								function loopState(dataBindKeys){
									
										for(var i=0,n=dataBindKeys.length; i<n; i++){
                                            var key = dataBindKeys[i];
                                            setTimeout(function(){
										          $this.tasks.run(key);
                                            },0);
										}
								}
								
								eventHandler.run(e.type,[e.detail]);
							}
		});
	
	/* define Controller on Octane - bridge to private octane properties and methods */
		
		Octane.define({
			Controller 		: function ($model){ 
                return new Controller($model);
            }
		});
	
	/* ------------------------------------------------------- */
	//  Application ViewModels
	// @param $model [string] Model name this ViewModel uses
	// @param context [obj] the context of the MVCVM (octane or a module) 
	/* ------------------------------------------------------- */		
		
		function ViewModel($model){
			
			// use $this in function scope
			var $this = this;
			
			//public
			this.define({
				instanced		: true,
				model			: $model,
				watcher			: new __.Switch(),
				scope		    : {},
			});
			
			
			// initialize
			(function($this){
				
                //octane.view_models.push($this);
				
				$this.watcher
					.addCase('input',function(e){
						$this.uptake(e.srcElement);
					})
                    .addCase('select',function(e){
                        $this.uptake(e.srcElement);
                    })
                    .addCase('click',function(e){
                        $this.uptake(e.srcElement);
                    })
					.addCase($this.model.name+':statechange',function(e){
						//$this.parse();
						$this.refresh();
					});
				
				Octane.handle('input click '+$this.model.name+':statechange',$this);
                
				$this.parse();
                 
                // loop bound model datapoint in scope
                /*for(var key in $this.scope){
                    if( ({}).hasOwnProperty.call($this.scope,key)){
                        // loop thru each element bound to the model datapoint
                        for(var i=0,n=$this.scope[key].length; i<n; i++){
                           $this.uptake($this.scope[key][i]);
                        }
                    }
                }*/
                    
				$this.refresh();
			})($this);
		}
		
		
	/*  prototype ViewModel */
	
		ViewModel.prototype = new Base();
		ViewModel.prototype.define({
			
            // find bound elements on the DOM
			parse	: function(){
						
						var $this = this,
                            $bindScope = document.querySelectorAll('[o-bind^="'+this.model.name+'."]'),
                            $updateScope = document.querySelectorAll('[o-update*="'+this.model.name+'."]'),
                            $scope = [];
                        
                        // union the two node lists
                        for(var b=0,B=$bindScope.length; b<B; b++){
                            $scope.push($bindScope[b]);
                        }
                        for(var u=0,U=$updateScope.length; u<U; u++){
                            if(!__.inArray($scope,$updateScope[u])){
                                $scope.push($updateScope[u]);
                            }
                        }
                        
                        // loop elements with this o-model
                        for(var i=0,n=$scope.length;i<n;i++){
                            
                            var el = $scope[i];
                                // remove model name from bind string
                                $bind = el.getAttribute('o-bind'),
                                $update = _.invert( JSON.parse(el.getAttribute('o-update')) ) || {};
                            
                            // element hasn't been parsed yet
                            if(!el._guid){
                                el._guid = Octane.GUID();
                                el._bind = $bind;
                                el._update = $update;
                                el._filters = JSON.parse( el.getAttribute('o-filters') );
                            }
                            
                            // create array for this.bindings[bind] if not already an array
                            if($bind){
                                if(!_.isArray(this.scope[$bind]) ) { 
                                    this.scope[$bind] = []; 
                                }
                            // push element into scope[key] for its two-way data bind
                                if(!__.inArray(this.scope[$bind],el)){
                                    this.scope[$bind].push(el);
                                }
                            }
                            
                            // push element to scope[key] for updates if not already in for its data-bind
                            for(var key in $update){
                                if( ({}).hasOwnProperty.call($update,key) ){
                                    if(!_.isArray(this.scope[key]) ) { this.scope[key] = []; }
                                    if(!__.inArray(this.scope[key],el) ){
                                        this.scope[key].push(el);
                                    }
                                }
                            }
                        }
					},
					
			// update all data on the DOM bound to this ViewModel's Model
			refresh 	: 	function (e){
								
                                // loop bound model datapoint in scope
                                for(var key in this.scope){
                                    if( ({}).hasOwnProperty.call(this.scope,key)){
                                        // loop thru each element bound to the model datapoint
                                        for(var i=0,n=this.scope[key].length; i<n; i++){

                                            var element = this.scope[key][i],
                                                // remove model name from string
                                                pointer = element._bind ? element._bind.split('.').slice(1).join('.') : '',
                                                toUpdate = element._update;

                                            element.value = this.model.get(pointer);
                                            
                                            // loop thru attributes to update
                                            for(var key in toUpdate){
                                                if( ({}).hasOwnProperty.call(toUpdate,key)){
                                                    // remove model name from string
                                                    pointer = key.split('.').slice(1).join('.');
                                                    update(element,toUpdate[key],this.model.get(pointer));
                                                }
                                            }
                                        }
                                    }
                                }
                
								// helper
								function update(el,attribute,fresh){
                                    
                                    var attrs = new __.Switch({
                                        'html' : function(){
                                                   
                                                    el.innerHTML = fresh;
                                                },
                                        'text' : function(){
                                                    el.textContent = fresh;
                                                },
                                        'default' : function(){
                                                    el.setAttribute(attribute,fresh);
                                                }
                                    });
                                    
                                    attrs.run(attribute);
								}			
							},
			
			// respond to user changes to DOM data bound to this model
			uptake		: 	function(element){
                                
								var 	o_bind = element._bind,
                                        // remove model name from string
                                        pointer = o_bind ? o_bind.split('.').slice(1).join('.') : '',
                                        $dirty={};
                
								if( this.scope[o_bind] && element.value != this.model.get(pointer) ){
								
                                    $dirty[pointer] = element.value;
                                    this.model.process($dirty);  	
								}				
							},
			handleEvent	: 	function (e){ 
								this.watcher.run(e.type,[e]);
							}
		});

	/* ------------------------------------------------------- */
	// base for Application Modules
	/* ------------------------------------------------------- */
		
		function Module (name) { 
			
			this.name = name;
            
            var conditions = [
                    [
                       ( _.isString(this.name) && !__.isBlank(this.name) ),
                        'Module name is undefined'
                    ]
                ],
                loadable = verify(conditions,'Module','global');
            if(!loadable){ return {instanced:false}; };
			
			this.define({
				instanced 		:	true,
				
				Model			:	function (name,options){
										options = _.isObject(options) ? options : {};
										options.context = this.name; 
										return new Model(name,options);
									},
				Controller		:	function ($model){ 
										return new Controller($model,this.name); 
									}
			});	
		}
		
		
		Module.prototype = new Base();
        Module.prototype.constructor = Module;
		
	/* ------------------------------------------------------- */
	//  methods for handling modules
	/* ------------------------------------------------------- */
		
		// add a module to Octane before init
		function addModule (id,dependencies,$module){
			
            $module = (__.typeOf(arguments[2]) == 'function') ? arguments[2] : arguments[1];
            $module.prototype = new Module(id);
            
            Octane.extend.call($module,{
                dependencies : (__.typeOf(arguments[1]) == 'array') ? arguments[1] : [],
                id           : id,
                loaded       : false
            });
            
			octane.modules[id] = $module;		
		}
		
		// called at init
		function initModules(options){
			
			options = options || {};
            
            // assign init arguments as properties of the module's constructor function
			for(var id in options){
                if( ({}).hasOwnProperty.call(options,id) && octane.modules[id]){
                   octane.modules[id].initArgs = _.isArray(options[id]) ? options[id] : [];
                }
            };
            
            // load each module
			for(var module in octane.modules){
				if( ({}).hasOwnProperty.call(octane.modules, module) ){
					loadModule(octane.modules[module]);
				}	
			}
		}
		
		// helper for initModules
		function loadModule($module){
            
			if($module.prototype instanceof Module && dependenciesMet($module)){
                
                // prevent the same module from loading twice
                if($module.loaded){ 
                    return;
                }else{
                    Octane.extend( $module.__construct($module.initArgs) );

                    octane.modules[$module.id].loaded = true;
                    
                    // hook-in for updating a loading screen
                    Octane.fire('loaded:module',{
                        detail:{
                            message:'Loading Module '+$module.id+'...',
                            progress: (Math.floor(99 / (Object.keys(octane.modules).length -2)))
                        }
                    });
                }
			}	
		}
		
		// helper for loadModules
		function dependenciesMet($module){
				
            var dependencies = _.isString($module.dependencies) ? $module.dependencies.split(',') : (_.isArray($module.dependencies) ? $module.dependencies : []);

            for(var i=0,n = dependencies.length; i<n; i++){
                var d = dependencies[i].trim(),
                    moduleD = octane.modules[d];

                if( !(moduleD && moduleD.prototype instanceof Module) ) {
                    errors.log('Could not load '+$module.name+' Module, missing dependency '+d);
                    return false;
                }else{
                    if(!moduleD.loaded){
                         loadModule(moduleD);
                    }
                }           
            }
            return true;
        }

		Octane.define({
                Module     : function(name,dependencies,$module){ 
                                return addModule(name,dependencies,$module);
                            },
                hasModule : function (name){ 
                                return octane.modules[name] ? octane.modules[name].loaded : false; 
                            }	
            })
        // artificially start the uptake circuit
           .define({
                process : function(model,$dirty){
                            var contrls = octane.controllers;
                            for(var i = 0,n= contrls.length; i<n; i++){
                                if(contrls[i].model.name == model){
                                    contrls[i].sanitize($dirty);
                                }
                            }
                }
            })
        // global model and controller
            .define({ $model : new Model('Octane')} )	
            .define({ $ctrl : new Controller(Octane.$model) })
        // Octane DOM elements
            .define({ dom:{} })
        // Octane ready handler
            .handle('Octane:ready',function(e){
                setTimeout(function (){
                    // unhide the rest of the octane's content hidden behind the loader
                    Octane.dom.container().setAttribute('style','visibility:visible;'); 
                    // route to url-parsed view|| home
                    Octane.route(e.detail);
                },500);
            });
        
        Octane.define.call(Octane.dom,{
                container : function(){
                    return document.getElementsByTagName('o-container')[0] || document.createElement('o-container');
                },
                canvas  : function(){
                    return document.getElementsByTagName('o-canvas')[0] || document.createElement('o-canvas');
                    
                },
                views    : function(){
                    return document.getElementsByTagName('o-view') || [];
                }
            });
        
        
		function init (options){
			
			options = options || {};
			if(octane.modules['Debug']){ options.Debug = [octane] };
            
            initModules(options);
			Octane.name = options.name || Octane.name;
            
            var features = document.getElementsByTagName('html')[0].getAttribute('class').split(' '),
                hasHistory = __.inArray(features,'history'),
                view = Octane.parseView(hasHistory) || 'home';
            
            Octane.fire('Octane:ready',{detail:view});
		}
        
       
		Octane.extend({
			
			/* Octane API */
			
				init : function(options){ return init(options); }
				
                // .trip(element)
				// .handle(event,handler)
				// .fire(event,data)
				
                // .Module(name,Constructor[,dependencies])
				// .Model(name,options)
				// .Controller($model)
				
                // .process($dirty)
				
                // .renderTranslator(langs[,container]) 	: extended from Translator Module
				// .translate([,data]) 						: extended from Translator Module
				// .getLang() 								: extended from Translator Module
				// .setLang(lang) 							: extended from Translator Module
				// .getLangContent(contentID) 				: extended from Translator Module
				// .setLangData(data) 						: extended from Translator Module
				
                // .errorLog()                              : extended from Testing Module (if active)
                // .getEvents()                             : extended from Testing Module (if active)
                // .getModels()                             : extended from Testing Module (if active)
				// .getControllers()                        : extended from Testing Module (if active)
				// .getViews()                              : extended from Testing Module (if active)
                
                // _proto_ .extend({})
				// _proto_ .define({property:value,...})
			
			/* Module methods */
			     
                // .Model(name,options)
                // .Controller($model)
			
			/* Model methods */
			
				// .set({key:value,...})	
				// .get([stateKey])
				// .access(dbKey)
                // .reScope()
			
			/* Controller methods */
			     
				// .audit(prop,filter)
                // .hook(prop,$caseObject)
				// .parser(prop,fn)
                // .task(datakey,function(e.detail))
				
                // .doAudit($data)
				// .applyParsers($data)
			
			/* ViewModel methods */
			
				// .parse()
				// .refresh()
				// .uptake()
			//		
		});
		

	})($,_,__);


    
	/* TODO - Octane extension methods */
	// add built in audits
    // add filters/lenses in refresh
	// add library injection (for routing animations, language data, etc)
	// build router with HTML5 history API, callbacks to include .translate() and ViewModel.refresh()
	// build selector module
	// build calculator in selector module using controller hooks and reactors
	// build modal view and routing
	
	
	
;// JavaScript Document

Octane.Module('Router',[],function (cfg) {
	
    if(_.isObject(cfg)){
        
        try{
            $animations = (cfg.animations['exits'] && cfg.animations['loads']) ? cfg.animations : Octane.lib('viewAnimations');
        }catch(e){
            $animations = Octane.lib('viewAnimations');
            Octane.hasModule('Debug') && Octane.log('Could not load user-defined view animations. Error: '+e+'. Using default');
        }
    }
    
	// add History.js so we can route
	(function(window,undefined){

        // Bind to StateChange Event
        History.Adapter.bind(window,'statechange',function(){ // Note: We are using statechange instead of popstate
            var State = History.getState(); // Note: We are using History.getState() instead of event.state
        });

	})(window);
	
	// Octane application's views object and animation library
	var $Views = {};
    
    
	function pushState(params){
		
		params = _.isObject(params) ? params : {};
		// update the language in the url
		var parsed = __.location().searchObject;	
		
		Octane.extend.call(parsed,params);
		
		var fragment = [];
		for(var key in parsed){
			if( ({}).hasOwnProperty.call(parsed,key) ){	
				fragment.push(key+'='+parsed[key]);
			}
		}
		
		fragment = fragment.join('&');
		fragment = '?'+fragment;
        
        var language = Octane.getLang(),
            title = __.titleize(params.view) || __.titleize(currentView);
		
		History.pushState( 
            { lang: language },
            Octane.name +' | '+ title,
            fragment
        );
	}
   
	var isRouting,
        currentView,
	    // store routes called while another route is executing its loading animation
	   routesQueue = [];
	
	// @param id [str]: id of the o-view to be called
	// @param callback [fn]: a function to be executed when the loading animation finishes
	// 	function's thisArg is bound to the view called
	// @param ghost [bool]: do not update the history with the view (default false)
	function route(id,ghost){
		
        ghost = _.isBoolean(ghost) ? ghost : false;
		var $view = $Views[id],
            $def = $.Deferred();
		
        // ensure the onscreen view isn't reanimated
        //////////////////////////////////////////////////////////////////////////////////////
                                                                                            //
            if($view instanceof View && $view != currentView){                              //
                                                                                            //
            // ensure a route isn't triggered while another route is animating              //
            //////////////////////////////////////////////////////////////////////////      //
                                                                                    //      //
                if(!isRouting){                                                     //      //
                                                                                    //      //
                    isRouting = true;                                               //      //
                                                                                    //      //
                // exit the current view before calling a new view                  //      //
                //////////////////////////////////////////////////////////          //      //
                                                                        //          //      //
                    if(currentView instanceof View){                    //          //      //
                        currentView.exit().done(function(){             //          //      // 
                            loadView($view,$def);                       //          //      //
                        });                                             //          //      //
                    }else{                                              //          //      //
                        loadView($view,$def);                           //          //      // 
                    }                                                   //          //      //
                //////////////////////////////////////////////////////////          //      //
                                                                                    //      //
                }else{                                                              //      //
                    routesQueue.push(id);                                           //      //
                }                                                                   //      //
            //////////////////////////////////////////////////////////////////////////      //
                                                                                            //
            }else{                                                                          //
                $def.reject();                                                              //
            }                                                                               //
                                                                                            //
        //////////////////////////////////////////////////////////////////////////////////////
        
        // helper
        function loadView($view,$def){
            
             $view.load().done(function(){
                !ghost && pushState({view:$view.id});

                $view.doCallbacks();
                //!ghost && Octane.fire('view:loaded',{detail:{id:id}});

                currentView = $view;

                // update current view in global state, jumpstart Circuit                          
                Octane.$model.process({ currentView : $view.id });

                isRouting = false;

                // route next view
                (routesQueue.length > 0) && route(routesQueue.pop());

                $def.resolve();
             });
        }
		
        // return promise
		return $def;
	}
	
	// add a callback to be executed when the specified view finishes its loading animation 
	function routeThen(id,callback){
		
		$Views[id] instanceof View && $Views[id].addCallback(callback);
		return this;
	}
	
	function remove(id){
		
		$Views[id] instanceof View && $Views[id].exit();
		Octane.$model.process({currentView:''});
	}
	
    
	function setRoutingButtons(){
		
		var btns = document.querySelectorAll('.o-btn');
		var n = btns.length;
		
		while(n--){
			var route = btns[n].getAttribute('o-route');
            
            // closure to capture the button and route during the loop
           (function(btn,route){ 
                btn.addEventListener('click',function(){
				    return Octane.route(route);
			     });
           })(btns[n],route);
		}
	}
	
    // parse URL for a view  
    function parseView(api){

        if(api){
            return __.location().searchObject.view || false;
        } else {
             var hash = window.location.hash,
                param,
                parsed = {};

            (function (){ 
               hash = hash.replace('#?','');
                hash = hash.split('&');
                for(var i=0,n=hash.length;i<n;i++){
                    param = hash[i].split('=');
                    parsed[param[0]] = param[1];
                }
           })();

           return parsed.view || false;
        }
     };
    
	function initialize(){
		
		var 	//$views = document.getElementsByTagName('o-view'),
                $views = Octane.dom.views(),
				id, config;
				
		for(var i=0,n=$views.length; i<n; i++){
			id = $views[i].id;
			config = JSON.parse($views[i].getAttribute('o-config'));
			!$Views[id] && ($Views[id] = new View(id,config));
		}
				
		setRoutingButtons();
		
        // for HTML5 vs. HTML4 browsers
        // detect with modernizr   
         var features = document.getElementsByTagName('html')[0].getAttribute('class').split(' '),
            historyAPI = __.inArray(features,'history'),
            stateChangeEvent = historyAPI ? 'popstate' : 'hashchange';   

            window.addEventListener(stateChangeEvent,function(){
                   
                var view = parseView(historyAPI);
                   view && Octane.route(view).done( function(){
                      } );
            });
        
            Octane.handle('translated resize orientationchange',function(){
                currentView && currentView.setCanvasHeight();
            });
	}
    
	// Router Public API				
	this.define({
		initRouter		: function(){
                                return initialize();
                            },
        parseView       : function(supportsHistoryAPI){
                                return parseView(supportsHistoryAPI);
                            },
		route			: function(id,ghost){
								return route(id,ghost).then( Octane.translate );
                            },
		routeThen		: function(id,callback){
								return routeThen(id,callback);
                            },
		exit			: function(id){
								return remove(id);
                            },
		pushState		: function (params){
							     pushState(params);
                            },
		getCurrentView : function(){
							return currentView;
                            }
	});
    
    if(Octane.hasModule('Debug')){
        this.define({
            getViews : function(){
                return $Views;
            }
        });
    }
    
    // update the page title when the view changes
     Octane.$ctrl.parser('currentView',function($dirty){
        $dirty.currentViewTitle = __.titleize($dirty.currentView);

        return $dirty;
    });
	
    
    // set-up for Views constructor
    var Base = Octane.constructor;
    //var $animations = Octane.library('viewAnimations') || {};
    
    
	/* ------------------------------------------------------- */
	//  Application Views
	//
	// @param id [string] id attribute of 'o-view' DOM element
	// options : {starts:'left',loads:['slide','left','swing',500], exits:['slide','right','swing',500]}
	// 
	// @option starts: initial postion of the ViewFrame, default is left
	// @option loads[from,easing,duration]
	// @opton exits[to,easing,duration]
	/* ------------------------------------------------------- */
			
		function View(id,config){
			if(!_.isString(id)) return {instanced:false};
			
			config = _.isObject(config) ? config : {};
			
			var $this = this; 
			
			// private properties
			var	//onscreen	= (config.starts == 'onscreen'),
				positions 	= ['left','right','top','bottom','behind','invisible','onscreen'],
                loadConfig = _.isObject(config.loads),
                exitConfig = _.isObject(config.exits),
				cfg = {
                    loadsBy         : loadConfig && config.loads.by || 'slide',
                    loadsFrom       : loadConfig && __.inArray(positions,config.loads.from) ? config.loads.from : 'left',
                    loadEasing      : loadConfig && config.loads.ease || 'swing',
                    loadDuration    : loadConfig && _.isNumber(config.loads.dur) ? config.loads.dur : 500,
                    onLoadComplete  : function($deferred){

                            // resolve the deferred object we pass in from the loading call
                            $deferred && $deferred.resolve(id);
                        },
                    exitsBy         : exitConfig && config.exits.by || 'slide',
                    exitsTo         : exitConfig && __.inArray(positions,config.exits.to) ? config.exits.to : 'right',
                    exitEasing      : exitConfig && config.exits.ease || 'swing',
                    exitDuration	: exitConfig && _.isNumber(config.exits.dur) ? config.exits.dur : 500,
                    onExitComplete	: function($deferred){

                            // resolve the deferred object we pass in from the exiting call
                            $deferred && $deferred.resolve(id);
                        }
				};
            
            this.define(cfg);
			
			this.define({
                
                instanced	: true,
				id			: id,
				elem		: document.getElementById(id),
				$elem 		: $('o-view#'+id),
				_guid		: Octane.GUID(),
                doneLoading : [],
				addCallback : function(callback){
								this.doneLoading.push(callback);
							}					
			});
            
            this.setPosition(this.loadsFrom);
		}
		
        View.prototype = new Base('Octane View');
    
        View.prototype.define({
            
            handleEvent : function(e){
					switch(e.type){
						case 'translated':
							this.setCanvasHeight();
						    break;
                        case 'resize':
                            this.setCanvasHeight();
                            break;
                        case 'orientationchange':
                            this.setCanvasHeight();
                            break;  
					}
				},
            
            load : function(){
                
                // scroll to top of page
                $('body').velocity('scroll',{duration:200});
                
                // make sure the view is visible
                this.$elem.css({
                    "visibility":"visible",
                    'display':'block',
                    'z-index':9999999999
                });
                
                if(this.loadsBy !== 'fade'){
                    this.$elem.css({
                        opacity:1
                    });
                }

                this.setCanvasHeight(); 
                
                // animate and return a deferred object
                var $def = $.Deferred();
				return $animations.loads[this.loadsBy].bind(this,$def)();
            },
                              
            exit : function (){
                
                var $this = this,
                    $def = $.Deferred();

                return $animations.exits[this.exitsBy].bind($this,$def)().done(function(){
                    
                    // make sure the view is hidden in its loadFrom position
                    $this.$elem.css({
                            'z-index':-1,
                            'visibility':'hidden',
                            'display':'none',
                            'opacity':0
                        });
                    
                    $this.setPosition(this.loadsFrom);
                });
            },
            
            setCanvasHeight : function(){
                
                // some jQuery to ensure view-canvas's height
                var height = [];
                this.$elem.children().each(function (){
                    height.push($(this).height());
                });
                var totalHeight = _.reduce(height,function(totalHeight,num){
                    return totalHeight + num;
                });

                document.querySelector('o-canvas').setAttribute('style','height:'+totalHeight+'px');
            },
                
                        
            setPosition : function (position){
                
                var $view = this.$elem,
                    anim = new __.Switch({

                    'left': function(){
                                $view.css({
                                    "left":-($(window).width()*1.1),
                                    "top":0,
                                    //"bottom":0
                                });
                    },
                    'right' : function() {
                                $view.css({
                                    "right":-($(window).width()*1.1),
                                    "top":0,
                                    //"bottom":0
                                });
                    },
                    'top' : function(){
                                $view.css({
                                    "top":-($(window).height()*1.1),
                                    "left":0,
                                    "right":0
                                });
                    },
                    'bottom' : function(){
                                $view.css({"bottom":-($(window).height()*1.1),
                                    "left":0,
                                    "right":0
                                });
                    },
                    'onscreen' :function(){
                                $view.css({
                                    "left":0,
                                    "right":0,
                                    "top":0,
                                    //"bottom":0
                                });
                    },
                    default : function(){ 
                                $view.css({
                                    "left":-($(window).width()*1.1),
                                    "top":0,
                                    //"bottom":0
                                });
                    }
                });

                anim.run(position);
            },
            
            doCallbacks : function (){
                    var callbacks = this.doneLoading;
            
                    for (var i=0,n = callbacks.length; i < n; i++){
                        _.isFunction(callbacks[i]) && callbacks[i].bind($this)();
                    }
            }
        
        });
		
		// initialize the router		
		initialize();
});
		
	
		
	






















	
	
	
	
	
	
	
	
	
	
	
	;        /* ------------------------------------------------------- */
		// View Animations
		/* ------------------------------------------------------- */
		
        Octane.Library('viewAnimations',{
		
			applyLoading : function(){},
			
			removeLoading : function(){},
				
			loads : {	
				slide : function ($deferred){
				
							var $this = this;
							var $view = $this.$elem;
                            var $config = {
                                duration    : $this.loadDuration,
                                easing      : $this.loadEasing,
                                complete    : function(){
                                    $this.onLoadComplete($deferred);
                                }
                            };
							var anim = new __.Switch({
								
								'left': function(){
									$view.velocity(
										{"left":"0%"},
										$config
									);
								},
								'right': function (){
									$view.velocity(
										{"right":"0%"},
										$config
									);
								},
								'top':	function(){	
									$view.velocity(
										{"top":"0%"},
										$config
									);
								},
								'bottom':function(){
									$view.velocity(
										{"bottom":"0%"},
										$config
									);
								}
							});
				
							anim.run($this.loadsFrom);
							return $deferred;
						}, // end load.slide
						
				fade	: function($deferred){
	
							var $this = this,
								$view = $this.$elem;
								
								$this.setPosition('onscreen');
								$view.velocity(
                                   'fadeIn',
									{
										display   : 'block',
										easing    : $this.loadEasing,
										duration  : $this.loadDuration,
										complete  : function(){
											$this.onLoadComplete($deferred);
										}
									});
								return $deferred;
						} // end loads.fade()
					}, // end load animations
			exits : {
				
				slide : function ($deferred){
							
							//console.log('slideOut called on '+this.id+', exiting to: ',config.exits.to);
							
							var $this = this;
							var $view = $this.$elem;
                            var $config = {
                                duration: $this.exitDuration,
                                easing: $this.exitEasing,
                                complete:function(){
                                    $this.onExitComplete($deferred);
                                }
                            }
							var anim = new __.Switch({
								'left':function(){
									$view.velocity(
										{
											"left":-($(window).width()*1.1),
											"right":$(window).width()*2.2
										},
                                        $config
									);
								},
								'right':function(){
									$view.velocity(
										{
											"right":-($(window).width()*1.1),
											"left":$(window).width()*2.2
										},
										$config
									);
								},
								'top':function(){	
									$view.velocity(
										{
											"top":-($(window).height()*1.1),
											"bottom":$(window).height()*2.2
										},
										$config
									);
								},
								'bottom':function(){
									$view.velocity(
										{
											"bottom":-($(window).height()*1.1),
											"top":$(window).height()*2.2
										},
										$config
									);
								}
							});
							
							anim.run($this.exitsTo);
							
							return $deferred;
						}, // end exits.slide()
			
				fade : function($deferred){
							
							var $this = this,
								$view = $this.$elem;
								
								$view.velocity(
									'fadeOut',
									{
										display:'none',
                                        easing: $this.exitEasing,
										duration: $this.exitDuration,
										complete:function(){
											$this.onExitComplete($deferred);
										}
									});	
							return $deferred;			
						} // end exits.fade()
			} // end exit animations
	}); // end library
			
			
			
			
			
			
			
			
			;// JavaScript Document

// translatorModule module for Selection tools

// @param table [JSON]: the translation table
// 	JSON format, linked as separate .js file ahead of this script	
//
// @param config [object]: a language object
//
// 		@option paginated [bool]: 
//				true:		the translation table is split into [page][contentID]
//				false:	the translation table is a dictionary of only [contentID]s *default*
//
// 		@option defaultLang [string]
//      
//      @option langSupport [array]: supported languages for the translator
//
Octane.Module('Translator', function (config){
	
		// dummy
		var $M = {};
		
		config = config || {};

	/* ------------------------------- */
	// private protected properties
	/* ------------------------------- */
			
			// set by param
			$M.rosettaStone = ( _.isObject(config.langData) ) 	? config.langData 	  : {};
			// set by config
			$M.isPaginated	= ( _.isBoolean(config.paginated) ) ? config.paginated 	  : false;
            $M.langSupport  = ( _.isArray(config.langSupport) ) ? config.langSupport  : ['English'];
			// immutable
			$M.dropdown		= 	{
									wrapper 	: $('o-control#translator'),
									outerUL 	: $('<ul class="nav nav-pills"></ul>'),
									outerLI 	: $('<li class="dropdown"></li>'),
									pill 		: $('<a id="selected-language" class="dropdown-toggle closed" data-toggle="dropdown"></a>'),
									caret 		: $('<span class="caret"></span>'),
									innerUL 	: $('<ul class="dropdown-menu" role="menu"></ul>'),
									classKey 	: 'language-selector',
									dataKey 	: 'language-selected'
								};
			$M.languages 	= [
								{
									key:'English',
									display:'English',
									abbr:'en',
									regexp:/^_?(english|eng|en)$/i
								},{
									key:'Russian',
									display:'Русский',
									abbr:'ru',
									regexp:/^_?(russian|rus|ru|Русский)$/i
								},{
									key:'Spanish',
									display:'Español',
									abbr:'es',
									regexp:/^_?(spanish|espanol|esp|es|español)$/i
								},{
									key:'French',
									display:'Françias',
									abbr:'fr',
									regexp:/^_?(french|francias|françias|fra|fr)$/i
								},{
									key:'German',
									display:'Deutsch',
									abbr:'de',
									regexp:/^_?(german|deutsch|ger|de)$/i
								},{
									key:'Chinese',
									display:'简体中文',
									abbr:'zh',
									regexp:/^_?(chinese|zh|简体中文)$/i
								},{
									key:'Portugese',
									display:'Portugese',
									abbr:'pt',
									regexp:/^_?(portugese|port|pt)$/i
								},{
									key:'Japanese',
									display:'日本語',
									abbr:'ja',
									regexp:/^_?(japanese|jap|ja|日本語|nihongo)$/i
								}
							];
// helpers
            
            // also set by config   
            $M.defaultLang	= supportsLang(config.defaultLang) || $M.languages[0];
										
	/* ------------------------------- */
	// private protected methods
	/* ------------------------------- */
			
			
		// set translation spans with the language text
		/* --------------------------------------------------------------------- */
			
			function translate (data){
	           
				if( _.isObject(data) ) $M.rosettaStone = data;
				
				var elems = document.querySelectorAll('[o-lang]');
				
				for(var i=0, n = elems.length; i<n; i++){
					translateElement(elems[i]);
                }
                	
				$M.dropdown.pill.html($M.lang.display+' ');//.append($M.dropdown.caret);
				Octane.fire('translated');
			};
			
            function translateElement(el){
                 
                var contentID = el.getAttribute('o-lang'),
                    content = fetch(contentID);
                // create or replace text node
                if(el.firstChild && el.firstChild.nodeType == 3){
                    el.firstChild.data = content;
                }else{
                    el.insertBefore(document.createTextNode(content),el.firstChild);
                }
            }
			
		// @param langs [array] array of languages for the dropdown
		// @param container [string || $ object] containing elem for the dropdown
		/* --------------------------------------------------------------------- */
			
			function renderControls(langs,container){
						
				var	$d 	= $M.dropdown;
					
				// set the wrapper to a diffrent elem if passed
				switch (true){
					case ( _.isString(container) ):
						$d.wrapper = $(container);
						break;
					case ( __.is$(container) ):
						$d.wrapper = container;
						break;
				}
				
				$d.outerUL.appendTo($d.wrapper);
				$d.outerLI
					.append($d.pill)
					.append($d.innerUL)
					.appendTo($d.outerUL);
				//$d.caret.appendTo($d.pill);
				
				langs	= _.isArray(langs) ? langs : [];
                
				var	n = langs.length,
					i, supported,innerLI;
				
				for(i=0; i < n; i++){
					supported = supportsLang(langs[i]);
					if(supported){
						innerLI = $('<li></li>');
						innerLI
							.addClass($d.classKey)
							.attr('data-'+$d.dataKey,supported.key)
							.html(supported.display)
							.appendTo($d.innerUL);
					}
				}

				// apply handlers to new DOM elems
				applyClickHandlers();
			};


		// find the language from the url and set $M.lang
		/* --------------------------------------------------------------------- */
			
			function findLang (){
				
				var parsed = __.location().searchObject;
				
				$M.lang = supportsLang(parsed.lang) || $M.defaultLang;
			};
			
			
			
		// return the module's language
		/* --------------------------------------------------------------------- */
			
			function getLang(){
				return $M.lang.key;
			};
			
			
			
		// define a language and re-translate
		// @param lang [string]: a language
		/* --------------------------------------------------------------------- */
			
			function setLang (lang){
				
				if( supportsLang(lang) ){
					$M.lang = supportsLang(lang);
                    // update the language in the url
					//Octane.pushState( {lang:$M.getLang()} );
					
					// TODO: replace URL with new language	with history API
					//window.location.search = '?lang='+$M.lang.key;
					
					return getLang();
				}
			};
			
			
			
		// return a specific content bit by its id
		// @param contentID [string]: content-id
		/* --------------------------------------------------------------------- */
			
			function fetch(contentID){
				
				var id,page,section,content;
				
				if($M.isPaginated){
						id = ( _.isString(contentID) ) ? contentID.split('-') : [];
						page = id[0];
						section = id[1];
						content = ($M.rosettaStone[page] && $M.rosettaStone[page][section]) ? $M.rosettaStone[page][section] : null;
				}else{
						content = $M.rosettaStone[contentID] ? $M.rosettaStone[contentID] : null;
				}
				
                if(content){
					return content[$M.lang.abbr] ? content[$M.lang.abbr] : content[$M.defaultLang.abbr];
				}else{
					return '';
				}
			};
		
		
	/* ------------------------------- */
	// private helpers
	/* ------------------------------- */
			
			
		// helper
		/* --------------------------------------------------------------------- */
			
			function applyClickHandlers(){
				var $this, lang;
				
				$('li.'+$M.dropdown.classKey).on('click',function (){
					$this = $(this);
					lang = $this.data($M.dropdown.dataKey);
					setLang(lang);
                    translate();
					$M.dropdown.pill.trigger('click');
						
				});
				
				$M.dropdown.pill.on('click',function (){
					var pill = $(this);
					if(pill.hasClass('closed')){
						pill.removeClass('closed').addClass('open');
						$M.dropdown.innerUL.show();
					}
					else if (pill.hasClass('open')){
						pill.removeClass('open').addClass('closed');
						$M.dropdown.innerUL.hide();
					}
				});			
			};
		
			
		// helper
		// determines if a language is supported
		// returns language object from $M.languages or false
		// @param lang [string]
		/* --------------------------------------------------------------------- */
			
			function supportsLang (lang){
				
				var 	n = $M.languages.length,
						i,$this;
				
				for(i = 0; i < n; i++){
					$this = $M.languages[i];
					if($this.regexp && $this.regexp.test && $this.regexp.test(lang)) return $this;
				}
				return false;
			};


	/* ------------------------------- */
	// create public methods
	/* ------------------------------- */
		
			
			this.define({
				
				renderTranslator		: 	function(langs,container){
												return renderControls(langs,container);
											},
				translate 				: 	function(data){
												return translate(data);
											},
                translateElement        :   function(el){
                                                translateElement(el);
                                            },
				getLang 				: 	function(){
												return getLang();
											},
				setLang 				: 	function(lang){
												return setLang(lang);
											}
			});
			
			

	/* ------------------------------- */
	// init
	/* ------------------------------- */
			
			findLang();
            renderControls($M.langSupport);
            translate();
			
			/*Octane.handle('popstate',function(){
				$M.findLang();
				console.log($M.lang);
				$M.translate();
			});*/
			

});

	