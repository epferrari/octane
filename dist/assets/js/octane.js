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
		

		
		
	;    /* ------------------------------------------------------- */
	/*                 OCTANE MVC FRAMEWORK                    */
	/* ------------------------------------------------------- */
    
                    // @author Ethan Ferrari
                    // ethanferrari.com/octane
                    // onefiremedia.com
                    // version 0.0.2
                    // January 2015
            
                /* API Methods */

                    // .trip(element)
                    // .handle(event,handler)
                    // .fire(event,data)
                    // .goose(model,$dirty)

                    // .library(name)
                    // .addLibrary(name,data)

                    // .module(name[,dependencies],Constructor)
                    // .model(name,options)
                    // .controller(model)
                    // .hasModule(module)

                    // .route(id[,ghost])                       : extended from Router Module
                    // .routeThen(id,callback)                  : extended from Router Module
                    // .parseView()                             : extended from Router Module
                    // .pushState(params)                       : extended from Router Module
                    // .currentView()                           : extended from Router Module

                    // .log()                                   : extended from debug module (if active)
                    // .getLog()                                : extended from debug module (if active)
                    // .getEvents()                             : extended from debug module (if active)
                    // .getModels()                             : extended from debug module (if active)
                    // .getControllers()                        : extended from debug module (if active)
                    // .getViews()                              : extended from debug module (if active)

                    // _proto_ .extend({})
                    // _proto_ .define({property:value,...})

                /* Module methods */

                    // .model(name,options)
                    // .controller($model)

                /* Model methods */

                    // .set({key:value,...})	
                    // .get([stateKey])
                    // .access(dbKey)
                    // .reScope()

                /* Controller methods */

                    // .filter(o-bind,filter)
                    // .hook(o-bind,$caseObject)
                    // .parser(o-bind,func(data[,async]))
                    // .task(o-bind,func(o-bind,data))

                    // .doFilter($data)
                    // .applyParsers($data)

                /* ViewModel methods */

                    // .parse()
                    // .refresh()
                    // .uptake()
	
    
	(function($,_,__){
		
       'use strict';
		// check that doubleUnder utility library is included
		if(!window.__) { return false; }
		// octane is already instanced
		if(window.octane) { return false; }
        
	/* ------------------------------------------------------- */
	// base extension utility constructor
	/* ------------------------------------------------------- */
		
		function Base(name){ this.name = _.isString(name) && name; }	
		
		// extend an object with the properties and method of another object
		// overwrites properties by default, set to false to only extend undefind properties
		Object.defineProperty(Base.prototype,'extend',{
			value: function  (obj,overwrite){
			
						overwrite = _.isBoolean(overwrite) ? overwrite : true;
				        var
                        keys,
                        key;
                
						if(_.isObject(obj)){
                            keys = Object.keys(obj);
							for(var i=0,n=keys.length; i<n; i++){
                                key = keys[i];
                                if(overwrite){ // do overwrite
                                    this[key] = obj[key];	
                                }else { // only write undefined properties
                                    if(!(this[key])) { this[key] = obj[key]; }	
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
									var
                                    keys = Object.keys(prop),
                                    key;
                                    
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
		
        // simple promise implementation
        function Pact(){}    
        Pact.prototype = new Base('Simple Promise');
        Pact.prototype.extend({
            state : 'pending',
            result : null,
            error : null
        });
        Pact.prototype.define({
            constructor : Pact,
            _isResolved : function(){
                return this.state == 'resolved';
            },
            _isRejected : function(){
                return this.state == 'rejected';
            },
            _isPending : function() {
                return this.state == 'pending';
            },
            resolveCallbacks : [],
            rejectCallbacks : [],
            then : function(resolve,reject){
            
                resolve = _.isFunction(resolve) ? resolve : function(){};
                reject = _.isFunction(reject) ? reject : function(){};
                //!_.isFunction(resolve.then) && resolve.prototype = new Pact();
                //!_.isFunction(reject.then) && reject.prototype = new Pact();
                
                this.resolveCallbacks.push(resolve);
                this.rejectCallbacks.push(reject);
                
                if(this.state == 'resolved'){
                    return resolve(this.result);
                }
                if(this.state == 'rejected'){
                    return reject(this.error);
                }
            },
            resolve : function(data){
                
                var callbacks = this.resolveCallbacks;
                this.state = 'resolved';
                this.result = data;
                for(var i=0,n=callbacks.length; i<n; i++){
                
                    setTimeout(function(){
                        callbacks[i].call && callbacks[i].call(null,data);
                    },0);
                }
             },
            reject : function(error){
                
                var callbacks = this.rejectCallbacks;
                this.state = 'rejected';
                this.error = error;
                for(var i=0,n=callbacks.length; i<n; i++){

                    setTimeout(function(){
                        callbacks[i].call && callbacks[i].call(null,error);
                    },0);
                }
            }
        });
			
		
	/* ------------------------------------------------------- */
	// define public octane object
	/* ------------------------------------------------------- */
		var octane = new Base('octane'); 
		
	/* ------------------------------------------------------- */
	// internal application object and properties
	/* ------------------------------------------------------- */
		
		var _octane = new Base('octane protected');
		_octane.define({
				modules		    : {},
				models		    : {},
				views		    : {},
				controllers     : {},
                eventRegister   : {}
		});
       
	
	/* ------------------------------------------------------- */
	/*                       GUID                              */
	/* ------------------------------------------------------- */		
		
		// set a unique identifier for the DOM element so we don't double count it
		octane.define({
			GUID : function(){
				var random4 = function() {
					return (((1 + Math.random()) * 0x10000)|0).toString(16).substring(1).toUpperCase();
				};
				return 'octane'+ random4() +'-'+ random4() +'-'+ random4() + random4();
			}
		});
	
	/* ------------------------------------------------------- */
	/*                       LOGGING                           */
	/* ------------------------------------------------------- */		
		
		_octane.extend({
			logfile    : [],
			log 	   : function(message){
							 _octane.logfile.push(message);
						  },
			getLogfile : function(){
							 return _octane.logfile;
						  }
		});
		
		// helper for dependencies, etc	
		function verify(conditions,constructor,$context){
		
			conditions = _.isArray(conditions) ? conditions : [];
		
            for(var	i=0, n = conditions.length;i<n;i++){
				if(!conditions[i][0]){
					_octane.log('Context: '+$context+'. A '+constructor+' failed; '+conditions[i][1] );
					return false;
				}		
			}
			return true;	
		}
	
        
	/* ------------------------------------------------------- */
	/*                          EVENTS                         */
	/* ------------------------------------------------------- */		
		
       
       octane.define({
           
			handle		: 	function(type,handler){
                                
                                var types = type ? type.split(' ') : [];
                                for(var i=0,n=types.length; i<n; i++){
								    window.addEventListener(types[i],handler,false);
                                    if( !_.isArray(_octane.eventRegister[types[i]]) ){ 
                                        _octane.eventRegister[types[i]] = [];
                                    }
								    _octane.eventRegister[types[i]].push(handler);
                                }
							},
			fire 		: 	function(type,detail){
								if(_.isString(type)){
									var e = detail ? __.customEvent(type,detail) : __.createEvent(type);
									window.dispatchEvent(e);
								}
							}	
		});
	
        
    /* ------------------------------------------------------- */
	/*                       TEMPLATES                         */
	/* ------------------------------------------------------- */
        
        _octane.templates = {};
        
        function parseTemplate(template,data){
            
            template = _.isString(template) ? template : '',
            data = _.isObject(data) ? data : {};
            
            var
            pattern = /\{\{([^{^}]+)\}\}/g,
            matches = template.match(pattern),
            key,re;
            
            if(_.isArray(matches)){
                for(var i=0,n=matches.length; i<n; i++){
                    key = matches[i].replace(/[{}]+/g,''); // 'something'
                    re = new RegExp("(\\{\\{"+key+"\\}\\})","g");
                    template = template.replace(re,data[key]);
                }
            }
            return template;
        }
        
        function getTemplates(){
            var tmpls = document.querySelectorAll('[type="text/octane"]');
            for(var i=0,t=tmpls.length; i<t; i++){
                setTemplate(tmpls[i]);
            }
            
            // helper
            function setTemplate(template){
                if(!_octane.templates[template.id]){
                    _octane.templates[template.id] = template.innerHTML;
                }else{
                    _octane.log('Could not create template '+template.id+'. Already exists');
                }
            }
                
        }
                                  
        octane.define({
            
            addTemplate : function(id,markup){
                
                if(_.isString(id) && _.isString(markup)){
                    if(!_octane.templates[id]){
                        _octane.templates[id] = markup;
                    }else{
                        _octane.log('Could not create template '+id+'. Already exists');
                    }
                }
            },
            template : function(id,data){
                
                var wrapper = document.createElement('o-template');
                wrapper.innerHTML = parseTemplate(_octane.templates[id],data);
                return wrapper;
            }            
        });
        
	
	/* ------------------------------------------------------- */
	/*                       FILTERS                           */
	/* ------------------------------------------------------- */
		
		_octane.filters = new __.Switch();
		
		octane.define({
			addFilter : function (name,valid,invalid){
                
                valid = valid || /.*/;
                invalid = invalid || /.*/;
                
                var func = function($data){
                    
                    switch(true){
                        case valid.test($data):
                            return {
                                data 	: $data,
                                status	: 'valid'
                            };
                        case (_.isEmpty($data) || _.isUndefined($data)):
                            return {
                                data 	: null,
                                status	: 'undefined'
                            };
                        case invalid.test($data):
                             return {
                                data 	: null,
                                status	: 'invalid'
                            };
                        default: 
                            return {
                                data 	: $data,
                                status	: 'default'
                            };
                        }
                };
                
				_octane.filters.addCase(name,func,true);	
			}
		});
		
		octane.addFilter('number',/^[-\d]+$/);
        octane.addFilter('email',/^[-0-9a-zA-Z]+[-0-9a-zA-Z.+_]+@(?:[A-Za-z0-9-]+\.)+[a-zA-Z]{2,4}$/);
        octane.addFilter('tel',/^[-0-9\.]{7,12}$/);
                    
	
	/* ------------------------------------------------------- */
	/*                       LIBRARIES                         */
	/* ------------------------------------------------------- */	
	
		_octane.libraries = {};
		
        function Library(name,data){
            
            if(!_.isObject(data)){
                this.reject('invalid library data, not an object');
            } else {
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
                this.resolve(lib);
            }
        }
        Library.prototype = new Pact();
       
		octane.define({
			addLibrary : function(name,lib){
				_octane.libraries[name] = _.isObject(lib) ? new Library(name,lib) : {};
			},
            library : function(name){
                return octane.hasLibrary(name).then(function(data){
                    return data;
                });
            },
			hasLibrary : function(name){
                var lib = _octane.libraries[name];
                if(lib instanceof Library){
                    return lib;
                } else {
                    return Promise.reject('Error: Library '+name+' does not exist');
                }
			}
		});
	
	
	/* ------------------------------------------------------- */
	/*                         MODELS                          */
	/* ------------------------------------------------------- */
	
		function Model(name,options){
			
			options = _.isObject(options) ? options : {};
			options.context = options.context || 'Application';
            
			var
            conditions = [
                [
                    _.isString(name),
                    'Model name must be a string.'
                ]
            ],
            loadable = verify(conditions,'Model',options.context);
                
			if(!loadable) return {instanced:false};
			
			// RESTful
			var 
            db = {},    
            $this = this;
            
            this.define({
				instanced	: true,
				name		: name,
                context     : options.context,
				state		: {}
            });
            var vm = new ViewModel($this);
            
			// public
			this.define({
				access		: function(key) { return db[key]; },
                reScope    : function(){ vm.parse(); }
			});
			
			// initialize
			(function ($this){

				_octane.models[name] = $this;
				
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
							var
                            updated = [],
                            $state 	= this.state,
                            keyStringsToParse = Object.keys(fresh);
                            
                            for(var i=0,n=keyStringsToParse.length; i<n; i++){
                                
                                var
                                keyString = keyStringsToParse[i],
                                keyArray = keyString.split('.'),
                                value = fresh[keyString],
                                k = keyArray.length,
                                modelUpdated;
                                
                                try{
                                    keyArray.reduce(parseString,$state);
            
                                    modelUpdated = true;
                                }catch(e){
                                    modelUpdated = false;
                                    _octane.log('Unable to set model data "'+keyString+'". Error: '+e);
                                }
                                modelUpdated && updated.push(keyString);
                            }
                            
                            var e = this.name+':statechange';
                            octane.fire(e,{detail:updated});
                                
                            // helpers
                            /* ------------------------------------------------------- */
                            
                                function parseString(o,x,index){

                                    if(index == (k-1)){
                                        return o[x] = value;
                                    }else{
                                        return o[x] = _.isObject(o[x]) ? o[x] : {};
                                    }
                                }
                
                            /* ------------------------------------------------------- */
                           
						},
			get	: 	function(keyString){
                                
                                var
                                $this = this,
                                stateData;
                                
                                if(keyString){
                                    var keyArray = keyString.split('.');
                                    
                                    try{
                                        stateData = keyArray.reduce(function(o,x,i){
                                            return o[x];
                                        },$this.state);
                                    }catch(e){
                                        stateData = '';
                                        _octane.log('Unable to get model data "'+keyString+'". Error: '+e);
                                    }
                                    return stateData;
                                } else {
                                    return this.state;
                                }
						},
            process      : function($dirty){
                                
                            _octane.controllers[this.name] && _octane.controllers[this.name].doFilter($dirty);
                }
		});
		
	/* define Model on octane - bridge to private properties and methods */
		
		octane.define({
			model 		: function (name,options){
                
                            if(_octane.models[name]){
                                return _octane.models[name];
                            }else{  
							     options = _.isObject(options) ? options : {}; 
							     return new Model(name,options);
                            }
						}
		});
        
    /* ------------------------------------------------------- */
	/*                      VIEW MODELS                        */
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
				
                //_octane.view_models.push($this);
				
				$this.watcher
					.addCase('input',function(e){
                        //console.log('dispatch element: ',e.srcElement);
                        //console.log('value at event handler: ',e.srcElement.value);
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
				
				octane.handle('input click '+$this.model.name+':statechange',$this);
				$this.parse();    
				$this.refresh();
			})($this);
		}
		
		
	/*  prototype ViewModel */
	
		ViewModel.prototype = new Base();
		ViewModel.prototype.define({
			
            // find bound elements on the DOM
			parse	: function(){
						
						var
                        $this = this,
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
                            
                            var
                            el = $scope[i],
                            // remove model name from bind string
                            $bind = el.getAttribute('o-bind'),
                            o_update = el.getAttribute('o-update'),
                            $update= {};

                            if(o_update){
                                // not a JSON string
                                if(o_update.length > 0 && o_update.indexOf("{") !== 0){
                                    $update[o_update] = 'html';
                                } else {
                                    $update = _.invert( JSON.parse(el.getAttribute('o-update')) ) || {};
                                }
                            }
                            
                            // element hasn't been parsed yet
                            if(!el._guid){
                                el._guid = octane.GUID();
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
                            var
                            $updateKeys = Object.keys($update),
                            key;
                            
                            for(var j=0,m=$updateKeys.length; j<m; j++){
                                key = $updateKeys[j];
                                if(!_.isArray(this.scope[key]) ) { this.scope[key] = []; }
                                if(!__.inArray(this.scope[key],el) ){
                                    this.scope[key].push(el);
                                }
                            }
                        }
					},
					
			// update all data on the DOM bound to this ViewModel's Model
			refresh 	: 	function (e){
								
                                // loop bound model datapoint in scope
                                var
                                scopeKeys = Object.keys(this.scope),
                                key;
                
                                for(var j=0,J=scopeKeys.length; j<J; j++){
                                    key = scopeKeys[j];
                                    // loop thru each element bound to the model datapoint
                                    for(var i=0,I=this.scope[key].length; i<I; i++){

                                        var
                                        element = this.scope[key][i],
                                        // remove model name from string
                                        pointer = element._bind ? element._bind.split('.').slice(1).join('.') : '',
                                        toUpdate = element._update,
                                        toUpdateKeys = Object.keys(toUpdate),
                                        ukey,
                                        upointer;

                                        element.value = this.model.get(pointer);

                                        // loop thru attributes to update
                                        for(var u=0,U = toUpdateKeys.length; u<U; u++){
                                            ukey = toUpdateKeys[u];
                                            // remove model name from string
                                            upointer = ukey.split('.').slice(1).join('.');
                                            update(element,toUpdate[ukey],this.model.get(upointer));
                                        }
                                    }
                                }
                
								// helper
                                /* ------------------------------------------------------- */
                                    
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
                                
                                /* ------------------------------------------------------- */
							},
			
			// respond to user changes to DOM data bound to this model
			uptake		: 	function(element){
                                
                                var 
                                o_bind = element._bind,
                                // remove model name from string
                                pointer = o_bind ? o_bind.split('.').slice(1).join('.') : '',
                                $dirty={};

                                if( this.scope[o_bind] && element.value != this.model.get(pointer) ){
                                    $dirty[pointer] = element.value;
                                    if(_octane.controllers[this.model.name]){
                                        _octane.controllers[this.model.name].doFilter($dirty);
                                    }
                                }				
							},
			handleEvent	: 	function (e){ 
								this.watcher.run(e.type,[e]);
							}
		});

	
	/* ------------------------------------------------------- */
	/*                     CONTROLLERS                         */
	/* ------------------------------------------------------- */
		
		function Controller(model,context){
			
            context = context || 'Application';
           
			// validate context
			var	$model = _octane.models[model] || {},
                conditions = [
					[
                        $model instanceof Model,
                        'defined model is not an instance of octane.Model'
                    ],[
                        $model.instanced,
                        'model '+model+' passed as argument was not initialized'
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
				filters          : {},
                parsers         : {},
			    hooks           : {}    
			});
			
			// add this Controller instance to the _octane's controllers object
			(function(){
				_octane.controllers[model] = $this;
				octane.handle($this.model.name+':statechange',$this);
			})();	
		}
		
	/* prototype Controller */
		
		Controller.prototype = new Base();
        Controller.prototype.constructor = Controller;
		Controller.prototype.define({
            
            // assign an _octane filter to be run on a 'dirty' data property
            filter		: function(o_bind,filter){
                                this.filters[o_bind] = filter;
                                return this; // chainable
                        },

            // a function to be applied in between filtering and the setting of data in the model
            // if one model data value changes depending on another, a parser is the place for that logic
            // key is the incoming data key to parse for, fn is the function to apply
            // parser param 'func' can take 2 arguments, the first is the bound dirty data,
            // the second is an arbitrarily named flag that tells the parser it should be a Promise
            // remember to resolve the promise or the data won't be set in the model
            parser			: function(o_bind,func){
                                    
                                var 
                                funcDeclaration= func.toString().split('{')[0],
                                pattern = /\(([^)]+)\)/,
                                argsString = pattern.exec(funcDeclaration)[1],
                                argsArray = argsString.split(','),
                                $this = this;
                
                                if(_.isFunction(func) && _.isUndefined(this.parsers[o_bind])){

                                    if(argsArray.length == 2){
                                        this.parsers[o_bind] = function($dirty){
                                            return new Promise(function(resolve,reject){
                                                // create object to resolve/reject promise in our parser function
                                                var $deferred = {
                                                    resolve:resolve,
                                                    reject:reject
                                                };
                                                // make sure 'this' in our hooks refers to this Controller
                                                func.bind($this)($dirty,$deferred);
                                            });
                                        };
                                    
                                    }else{
                                        this.parsers[o_bind] = function($dirty){
                                            // make sure 'this' in our hooks refers to this Controller
                                            return func.bind($this,$dirty)();
                                        };
                                    }
                                }
                                return this; // chainable	
                          },


            // add a new Switch instance with a case object to be processed
            // when a filter is called on the defined property
            hook			: function(o_bind,caseObject){
                                this.hooks[o_bind] = new __.Switch(caseObject);
                                return this; // chainable
                            },
            // add as function(keyString,data)
			task   : 	function(o_bind,func){
				                
								var 
                                $this = this,
                                bind,
                                data;
                               
								if(_.isFunction(func)){
                                    if(__.typeOf(o_bind) == 'string'){
                                        o_bind = o_bind.split(',');
                                    }
                                    for(var i=0,n=o_bind.length; i<n; i++){
                                        // closure to preserve scope
                                        bindTask(o_bind[i]);
                                    }
								}
								return this; // chainable
                
                                // helper
                                /* ------------------------------------------------------- */
                                    
                                    function bindTask(bind){
                                        bind = bind.trim();
                                        $this.tasks.addCase(bind,function(){
                                            var data = $this.model.get(bind);
                                            func.bind($this)(bind,data);
                                        });
                                    }
                                
                                /* ------------------------------------------------------- */
                
							},
			
			fetch	: 	function(dbKey){
				
								return this.model.access(dbKey);
							},
			
			doFilter : function($dirty){
								var $this = this;
								    
                                function filterAll($data){
									
                                    $data = _.isObject($data) ? $data : {};
									
                                    var 
                                    dataKeys = Object.keys($data),
                                    o_bind,
                                    $filter;
                                    
									for(var i=0,I=dataKeys.length; i<I; i++){
                                        o_bind = dataKeys[i];
                                        // look for an filter assigned to this o-bind keystring
                                        $filter = $this.filters[o_bind];
                                        // purge the dirty data, execture hooks, and return
                                        $data = $this.filters[o_bind] ? filterOne($filter,o_bind,$data) : $data;
                                    }
									return $data;   
								}
								
								this.applyParsers( filterAll($dirty) );	
                
                                // helper
                                /* ------------------------------------------------------- */

                                    function filterOne(filter,o_bind,$data){
                                        // if a filter exists, run it on the data
                                        // return object filtered data and detail about its filtration
                                        // 'valid','invalid', or 'undefined'
                                        var result = _octane.filters.run(filter,[$data[o_bind]]);
                                        // return the filtered data to the data object
                                        $data[o_bind] = result.data;

                                        // if hook exists for bindID, execute the hook with the result's filtered data
                                        // else return the filtered data
                                        return $this.hooks[o_bind] ? $this.hooks[o_bind].run(result.status,[$data]) : $data;
                                    }

                                /* ------------------------------------------------------- */
                                
							},
			
			applyParsers	: function($data){
                                
                                var
                                $this = this,
                                $maybePromise;
                
                                if(_.isObject($data)){
                                    
                                    var 
                                    dataKeys = Object.keys($data),
                                    o_bind,$filter;
									
                                    for(var i=0,I=dataKeys.length; i<I; i++){
                                        o_bind = dataKeys[i];
                                            
                                        $maybePromise = $this.parsers[o_bind] && $this.parsers[o_bind]($data);
                                        //$this.parsers[o_bind] && $this.parsers[o_bind]($data);
                                        if(_.isObject($maybePromise) && _.isFunction($maybePromise.then)){
                                            $maybePromise.then($this.model.set);
                                        }else{
                                            $this.model.set($data);
                                        }  
                                    }   
                                }
							},
            
			handleEvent : 	function(e){
								
								var 
                                $this = this,
								eventHandler = new __.Switch();
									
								eventHandler.addCase($this.model.name+':statechange',loopState);
								
                                // passed e.details, which on event "this.model.statechange"
                                // is an object of updated model states
								function loopState(dataBindKeys){
										for(var i=0,n=dataBindKeys.length; i<n; i++){
                                            // closure to trap current dataBindKey
                                            loopStateHelper(dataBindKeys[i]);
										}
								}
                                
                                eventHandler.run(e.type,[e.detail]);
                                
                                // helper
                                /* ------------------------------------------------------- */
                                    
                                    function loopStateHelper(key){
                                        setTimeout(function(){
                                              $this.tasks.run(key);
                                        },0);
                                    }
                
                                /* ------------------------------------------------------- */	
							}
		});
	
		octane.define({
			controller 	: function (model){ 
                                if(_octane.controllers[model]){
                                    return _octane.controllers[model];
                                }else{
                                    return new Controller(model,'Application');
                                }
                            }
		});
	
	
	/* ------------------------------------------------------- */
	/*                         MODULES                         */
	/* ------------------------------------------------------- */
		
        _octane.bootlog = [];
        function bootLog(message){
            _octane.bootlog.push(message);
            octane.model('bootlog').set({
                bootlog:_octane.bootlog,
                status:message
            });
        }
        
		function Module (cfg) { 
			this.extend(cfg);
		}
        
		Module.prototype = new Base();
        Module.prototype.define({
               
            _checkDependencies : function(){
                                    
                                    var 
                                    dependencies = this.dependencies || {},
                                    mods = dependencies.modules || [],
                                    libs = dependencies.libraries || [],
                                    results = [],
                                    message = [
                                        this.name+': checking dependencies...',
                                        this.name+': no dependencies, preparing to initialize...'
                                    ];
                
                                   bootLog(message[0]);
                                    
                                    if(_.isString(mods)) { mods = mods.split(','); }
                                    if(_.isString(libs)) { libs = libs.split(','); }
                                    
                                    if(mods.length === 0 && libs.length === 0){
                                        bootLog(message[1]);
                                        return Promise.resolve();
                                        
                                    } else {
                                        for(var i=0,n = mods.length; i<n; i++){
                                            results.push( this._checkModuleDependency(mods[i]) );               
                                        }

                                        for(var j=0,m = libs.length; j<m; j++){
                                           results.push( this._checkLibDependency(libs[j]) ); 
                                        }    
                                    }
                                    return Promise.all(results);
                                },
            
            _checkModuleDependency : function(d){
                                        
                                        
                                        d = d ? d.trim() : '';
                                        var
                                        $this = this,
                                        mod = _octane.modules[d],
                                        message = [
                                            this.name+': no dependencies, preparing to initialize...',
                                            this.name+': Could not load module, missing module dependency "'+d+'"',
                                            this.name+': dependency "'+d+'" loaded and initialized, continuing...',
                                            this.name+': dependency "'+d+'" not yet loaded, loading now...'
                                        ];
                                       
                                        if(!d || d.length === 0) {
                                            bootLog(message[0]);
                                            return Promise.resolve();
                                        }

                                       if( !(mod && mod instanceof Module) ) {
                                            // module is not present
                                            bootLog(message[1]);
                                            return Promise.reject(message[1]);
                                        } else if( mod && mod.loaded){
                                            bootLog(message[2]);
                                            return Promise.resolve();
                                        } else {
                                            // module is not loaded, try to load it
                                             if(!mod.loaded){
                                                 bootLog(message[3]);
                                                 return mod._load().then(function(){
                                                     // recheck dependencies
                                                     return $this._checkDependencies();
                                                })
                                                .catch(function(err){
                                                    bootLog(err);
                                                    Promise.reject(err);
                                                });
                                             }
                                        }    
                                },
                
            _checkLibDependency : function(lib){
                                    
                                    var message = [
                                            this.name+': library dependency "'+lib+'" found, continuing...',
                                            this.name+': could not load module, missing library "'+lib+'"'
                                        ];
                
                                     return octane.hasLibrary(lib).then(function(){
                                            bootLog(message[0]);
                                            return Promise.resolve();
                                        }).catch(function(err){
                                            bootLog(err);
                                            return Promise.reject(message[1]);
                                        });        
                                },
            
            _load               : function(){
                                    var $this = this;
                                    if(!this.loaded){
                                        return this._checkDependencies().then(function(){
                                            return $this._initialize();
                                        }).catch(function(err){
                                            bootLog(err);
                                            return $this._abort();
                                        });   
                                    } else {
                                        Promise.resolve($this);
                                    }
                                },
            _abort              : function(){
                                    this.define({loaded:false});
                                    delete octane[this.name];
                                    return Promise.reject(this.name+': failed to initialize!');
                                },
            _initialize         : function(){
                                    
                                    var
                                    $this = this,
                                    message = [
                                            this.name+': initializing...',
                                            this.name+': successfully initialized!',
                                            this.name+': already initialized, continuing...'
                                        ];
                                    
                                    if(!this.loaded){
                                        bootLog(message[0]);
                                        this.constructor.prototype = new Module({name:this.name});
                                            
                                        this.define({
                                            loaded : true,
                                            name    : this.name,
                                        }).define(this.constructor.__construct(this.cfg));

                                        Object.defineProperty(octane,$this.name, {
                                            value :$this,
                                            writatble : false,
                                            configurable : false
                                        });
                                        bootLog(message[1]);
                                        octane.goose('application',{
                                            loadingProgress : (Math.ceil(100 / Object.keys(_octane.modules).length))
                                        });
                                        // hook-in for updating a loading screen
                                        octane.fire('loaded:module',{
                                            detail:{moduleID: this.name }
                                        });
                                    }
                                    return Promise.resolve(this);
                                },
            model			:	function (name,options){
                                        if(_octane.models[name]){
                                            return _octane.models[name];
                                        }else{  
                                             options = _.isObject(options) ? options : {};
                                             options.context = this.name+' module';
                                             return new Model(name,options);
                                        }
									},
            controller		:	function (model){ 
                                     if(_octane.controllers[model]){
                                        return _octane.controllers[model];
                                    }else{
                                        return new Controller(model,this.name+' module');
                                    } 
                                }
        });
        
		// add a module to octane before init
		function addModule (name,dependencies,constructor){
            constructor = (__.typeOf(arguments[2]) == 'function') ? arguments[2] : arguments[1];
            
			_octane.modules[name] = new Module({
                name            : name,
                constructor     : constructor,
                dependencies    : (__.typeOf(arguments[1]) == 'object') ? arguments[1] : {},
                loaded          : false
            });
		}
		
		// called at octane.initialize()
		function initModules(options){
			
			options = options || {};

            var 
            moduleKeys = Object.keys(_octane.modules),
            modulesLoaded = [],
            module,name;
            
            // load router module first
            return _octane.modules['router']._load().then(function(){
                
                // load each module
                for(var j=0,m=moduleKeys.length; j<m; j++){
                    name = moduleKeys[j];
                    module = _octane.modules[name];
                    // don't reload the same module
                    if(!module.loaded){
                        // capture closure
                        (function(module){
                            // set init arguments to properties of the module's constructor function
                            module.cfg = _.isArray(options[name]) ? options[name] : [];
                            bootLog(module.name+': not loaded, loading...');
                            modulesLoaded.push( module._load() );
                        })(module);
                    }
                }
                return Promise.all(modulesLoaded);
            })
            .catch(function(err){
                console.log(err);
            });
		}
		
        
		octane.define({
            
            module     : function(name,dependencies,$module){ 
                            return addModule(name,dependencies,$module);
                        },
            hasModule : function (name){ 
                            return _octane.modules[name] ? _octane.modules[name].loaded : false; 
                        }	
        });
        
    /* ------------------------------------------------------- */
	/*                         CIRCUIT                         */
	/* ------------------------------------------------------- */
        
        octane.define({
            // artificially start the uptake circuit
             goose : function(model,$dirty){
                        _octane.controllers[model] && _octane.controllers[model].doFilter($dirty);
                    },
            // a custom event for the app to fire when user data changes 
            trip       :   function(elem){

                        var rand = Math.random(),
                            e = __.customEvent('input',{bubbles:true,detail:rand});

                        elem.dispatchEvent && elem.dispatchEvent(e);
                    },
         })
        
    /* ------------------------------------------------------- */
	/*                          MISC                           */
	/* ------------------------------------------------------- */
        
        // global model and controller
        // octane DOM elements
            .define({ 
                appModel : new Model('application'),
                $Controller : new Controller('application'),
                dom:{} 
            });
        
        
        octane.define.call(octane.dom,{
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
        
         octane.controller('application')
            .parser('loadingProgress',function($data){
                var currentProgress = this.model.get('loadingProgress') || 0;
                $data.loadingProgress = currentProgress + $data.loadingProgress;
            });
        
    
    /* ------------------------------------------------------- */
	/*                          INIT                           */
	/* ------------------------------------------------------- */
        
        octane.define({
            initialize : function(options){ return init(options); }		
		});
        
		function init (options){
			options = options || {};
            
            // initialize utilities
            var 
            utils = octane.library('startup-utilities') || {},
            utilsKeys = Object.keys(utils),
            util;
                
            for(var u=0,U=utilsKeys.length; u<U; u++){
                util = utilsKeys[u];    
                // hook for the loading message
                octane.fire('loading:utility',{detail:util});
                // init utility
               _.isFunction(utils[util]) && utils[util].call();
            }
            // add debugging support if module included, pass internal _octane app object
			if(_octane.modules['debug']){
                options.debug = [_octane];
            }
            initModules(options).then(function(){
                
                octane.name = options.name || octane.name; 
                // unhide the rest of content hidden behind the loader
                setTimeout(function(){
                    octane.dom.container().setAttribute('style','visibility:visible;'); 
                },1000);
                // route to url-parsed view|| home
                // var view = octane.parseView() || 'home';
                //octane.route(view);
                octane.fire('octane:ready');
            
            });
		}
        
       window.octane = window.$o = octane;

	})($,_,__);


    
	/* TODO - octane extension methods */
	// add built in filters
    // add filters/lenses in refresh
	// build modal view and routing
	
	
	
; // init external dependencies/utilities that help octane run
 
 octane.addLibrary('startup-utilities',{
    
    fastlickJS : function(){
        
        // attach fastclick.js for mobile touch
        if ('addEventListener' in document) {
            document.addEventListener('DOMContentLoaded', function() {
                FastClick.attach(document.body);
            }, false);
        }
    },
    
    
	historyJS : function(){
        
        // add History.js so we can route
        (function(window,undefined){

            // Bind to StateChange Event
            History.Adapter.bind(window,'statechange',function(){ // Note: We are using statechange instead of popstate
                var State = History.getState(); // Note: We are using History.getState() instead of event.state
            });

        })(window);
    }
});;// JavaScript Document

octane.module('router',{
        modules : 'octane-views'
    },function (cfg) {
	
    
	// octane's own pushstate method
	function pushState(params){
		
		params = _.isObject(params) ? params : {};
		// update the language in the url
		var parsed = __.location().searchObject;	
		
		octane.extend.call(parsed,params);
		
		var fragment = [],
            parsedKeys = Object.keys(parsed),
            key;
		for(var k=0,K=parsedKeys.length; k<K; k++){
			key = parsedKeys[k];
            fragment.push(key+'='+parsed[key]);
		}
		
		fragment = fragment.join('&');
		fragment = '?'+fragment;
        
        var language = octane.translator && octane.translator.getLang(),
            title = __.titleize(params.view) || __.titleize(currentView);
		
		History.pushState( 
            { lang: language },
            octane.name +' | '+ title,
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
        
        return new Promise(function(resolve,reject){
            
            ghost = _.isBoolean(ghost) ? ghost : false;
            var $view = octane.view(id);
           
            // ensure the onscreen view isn't reanimated
            //////////////////////////////////////////////////////////////////////////////////////
                                                                                                //
                if( $view && $view != currentView){                                             //
                                                                                                //
                // ensure a route isn't triggered while another route is animating              //
                //////////////////////////////////////////////////////////////////////////      //
                                                                                        //      //
                    if(!isRouting){                                                     //      //
                                                                                        //      //
                        isRouting = true;                                               //      //
                                                                                        //      //
                    // exit the current view before calling a new view                  //      //
                    //////////////////////////////////////////////////////////////      //      //
                                                                                //      //      //
                        if(currentView){                                        //      //      //
                            currentView.exit().done(function(){                 //      //      // 
                                loadView($view,ghost).done(function(result){    //      //      //
                                    octane.fire('routed:view');                 //      //      //
                                    resolve(result);                            //      //      //
                                });                                             //      //      //
                            });                                                 //      //      //
                        }else{                                                  //      //      //
                            loadView($view,ghost).done(resolve);                //      //      // 
                        }                                                       //      //      //
                    //////////////////////////////////////////////////////////////      //      //
                                                                                        //      //
                    }else{                                                              //      //
                        if(!__.inArray(routesQueue,id)){routesQueue.push(id);}          //      //
                    }                                                                   //      //
                //////////////////////////////////////////////////////////////////////////      //
                                                                                                //
                }else{                                                                          //
                    resolve();                                                                  //
                }                                                                               //
                                                                                                //
            //////////////////////////////////////////////////////////////////////////////////////
            
        });
    }
    // helper
    function loadView($view,ghost){

         return new Promise(function(resolve,reject){

            $view.load().done(function(){
                !ghost && pushState({view:$view.id});
                
                // update the current biew
                currentView = $view;
                // update current view in global state, jumpstart Circuit                          
                octane.goose('application',{ currentView : $view.id });
                // flag the route complete
                isRouting = false;
                // resolve this route
                resolve();
                // route next view
                (routesQueue.length > 0) && route(routesQueue.pop());
                
             });
         });
   }  
	
    
	// add a callback to be executed when the specified view finishes its loading animation 
	function routeThen(id,callback){
		
		octane.view(id) && octane.view(id).addCallback(callback);
		return octane;
	}
	
	function remove(id){
		
		octane.view(id) && octane.view(id).exit();
		octane.goose('application',{currentView:''});
	}
	
    
	function setRoutingButtons(){
		
		var btns = document.querySelectorAll('[o-route]');
		var n = btns.length;
		
		while(n--){
			  
            // closure to capture the button and route during the loop
           setRoutingButtonsHelper(btns[n]);
		}
	}
    
    function setRoutingButtonsHelper(btn,route){
        var route = btn.getAttribute('o-route');
	    btn.addEventListener('click',function(){
            octane.route(route);
        });
     }
        
        
    // parse URL for a view  
    function parseView(){
        
        // for HTML5 vs. HTML4 browsers
        // detect with modernizr   
        var html5 = __.inArray(document.getElementsByTagName('html')[0].getAttribute('class').split(' '),'history');
        
        if(html5){
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
     }
    
	function initialize(){
		
        var
        html5 = __.inArray(document.getElementsByTagName('html')[0].getAttribute('class').split(' '),'history'),
        stateChangeEvent = html5 ? 'popstate' : 'hashchange',
        id, config;
				
		setRoutingButtons(); 
        // change the view with browser's forward/back buttons
        window.addEventListener(stateChangeEvent,function(){       
            var view = parseView();
            view && octane.route(view).done( function(){} );
        });
        // resize canvas to proper dimensions
        octane.handle('translated resize orientationchange',function(){
            currentView && currentView.setCanvasHeight();
        });
	}
    
	// Router Public API				
	octane.define({
        parseView       : function(){
                                return parseView();
                            },
		route			: function(id,ghost){
								return route(id,ghost);
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
		currentView      : function(){
							return currentView;
                            }
	});
    
    
    
    // update the page title when the view changes
     octane.controller('application').parser('currentView',function($dirty){
        $dirty.currentViewTitle = __.titleize($dirty.currentView);

        return $dirty;
    });
	
    // initialize the router		
    initialize();
});
    
		
	
		
	






















	
	
	
	
	
	
	
	
	
	
	
	;        /* ------------------------------------------------------- */
		// View Animations
		/* ------------------------------------------------------- */
		
        octane.addLibrary('view-animations',{
		
			applyLoading : function(resolve){},
			
			removeLoading : function(resolve){},
				
			loads : {	
				slide : function (resolve){
							var $this = this,
                                $view = $this.$elem,
                                $config = {
                                    duration    : $this.loadDuration,
                                    easing      : $this.loadEasing,
                                    complete    : resolve
                                },
                                anim = new __.Switch({
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
						}, // end load.slide
						
				fade	: function(resolve){
	
							var $this = this,
								$view = $this.$elem;
								
								$this.setPosition('onscreen').then(function(){
                                    $view.velocity(
                                       'fadeIn',
                                        {
                                            display   : 'block',
                                            easing    : $this.loadEasing,
                                            duration  : $this.loadDuration,
                                            complete  : resolve
                                        });
                                });
						} // end loads.fade()
					}, // end load animations
			exits : {
				
				slide : function (resolve){
							
							var $this = this,
                                $view = $this.$elem,
                                $config = {
                                    duration    : $this.exitDuration,
                                    easing      : $this.exitEasing,
                                    complete    : resolve
                                },
                                anim = new __.Switch({
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
						}, // end exits.slide()
			
				fade : function(resolve){
							
							var $this = this,
								$view = $this.$elem;
								
								$view.velocity(
									'fadeOut',
									{
										display   :'none',
                                        easing    : $this.exitEasing,
										duration  : $this.exitDuration,
										complete  : resolve
									});		
						} // end exits.fade()
			} // end exit animations
	}); // end library
			
			
			
			
			
			
			
			
			;

        //  Octane Translator Module
        /* ------------------------------- */
        /*          PUBLIC API             */
        /* ------------------------------- */

        //  .renderControls(langs[,container])
        //  .translate([,data])
        //  .getLang()
        //  .setLang(lang)
        //  .getLangContent(contentID)
        //  .setLangData(data)

        /* ------------------------------- */
        /*              CONFIG             */
        /* ------------------------------- */

        
        //  @config langData [obj]: language data in JSON format
        //  @config paginated [bool]: 
       	//      true:	the translation table is split into [page][contentID]
        //      false:	the translation table is a dictionary of only [contentID]s (default)
        //  @config defaultLang [string]: a default language or (default:English)
        //  @config langSupport [array]: supported languages for the translator (default:['English'])

    octane.module('translator', function (config){

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
                // also set by config   
                $M.defaultLang	= supportsLang(config.defaultLang) || $M.languages[0];

        /* ------------------------------- */
        // private protected methods
        /* ------------------------------- */


            // set elements with o-lang attribute with language text
            /* --------------------------------------------------------------------- */

                function translate (data){

                    if( _.isObject(data) ) $M.rosettaStone = data;

                    var elems = document.querySelectorAll('[o-lang]');

                    for(var i=0, n = elems.length; i<n; i++){
                        translateElement(elems[i]);
                    }

                    $M.dropdown.pill.html($M.lang.display+' ');//.append($M.dropdown.caret);
                    octane.fire('translated');
                }

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
                }


            // find the language from the url and set $M.lang
            /* --------------------------------------------------------------------- */

                function findLang (){

                    var parsed = __.location().searchObject;

                    $M.lang = supportsLang(parsed.lang) || $M.defaultLang;
                }



            // return the module's language
            /* --------------------------------------------------------------------- */

                function getLang(){
                    return $M.lang.key;
                }



            // define a language and re-translate
            // @param lang [string]: a language
            /* --------------------------------------------------------------------- */

                function setLang (lang){

                    if( supportsLang(lang) ){
                        $M.lang = supportsLang(lang);
                        // update the language in the url
                        //octane.pushState( {lang:$M.getLang()} );

                        // TODO: replace URL with new language	with history API
                        //window.location.search = '?lang='+$M.lang.key;

                        return getLang();
                    }
                }



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
                }


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
                }


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
                }


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
                octane.handle('view:routed',translate);
                findLang();
                renderControls($M.langSupport);
                translate();
    });

	;// set-up for Views constructor

octane.module('octane-views',{
        libraries : 'view-animations',
    },
    function(cfg){
            
            var 
            Base = octane.constructor,
            $Views = {},
            $animations;
    
            try{
                $animations = (cfg.animations['exits'] && cfg.animations['loads']) ? cfg.animations : octane.library('view-animations');
            }catch(e){
                $animations = octane.library('view-animations');
                octane.hasModule('debug') && octane.log('Could not load user-defined view animations. Error: '+e+'. Using default');
            }

    /* ------------------------------------------------------- */
    //  Application View Constructor
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

            var $this = this,
                // private properties
                positions 	= ['left','right','top','bottom','behind','invisible','onscreen'],
                loadConfig = _.isObject(config.loads),
                exitConfig = _.isObject(config.exits),
                cfg = {
                    loadsBy         : loadConfig && config.loads.by || 'slide',
                    loadsFrom       : loadConfig && __.inArray(positions,config.loads.from) ? config.loads.from : 'left',
                    loadEasing      : loadConfig && config.loads.ease || 'swing',
                    loadDuration    : loadConfig && _.isNumber(config.loads.dur) ? config.loads.dur : 500,

                    exitsBy         : exitConfig && config.exits.by || 'slide',
                    exitsTo         : exitConfig && __.inArray(positions,config.exits.to) ? config.exits.to : 'right',
                    exitEasing      : exitConfig && config.exits.ease || 'swing',
                    exitDuration	: exitConfig && _.isNumber(config.exits.dur) ? config.exits.dur : 500
                };

            this.define(cfg);

            this.define({

                instanced	: true,
                id			: id,
                elem		: document.getElementById(id),
                $elem 		: $('o-view#'+id),
                _guid		: octane.GUID(),
                doneLoading : [],
                addCallback : function(callback){
                                _.isFunction(callback) && this.doneLoading.push(callback);
                            }					
            });

            this.setPosition(this.loadsFrom);
        }

        View.prototype = new Base('octane View');

        View.prototype.define({
            constructor : View,

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

                var $this = this;
                return new Promise(function(resolve){
                    // scroll to top of page
                    $('body').velocity('scroll',{duration:350});

                    // make sure the view is visible
                    $this.$elem.css({
                        "visibility":"visible",
                        'display':'block',
                        'z-index':999999999
                    });
                    if($this.loadsBy !== 'fade'){
                        $this.$elem.css({
                            opacity:1
                        });
                    }
                    // adjust the canvas height and load the view
                    $this.setCanvasHeight();
                    $animations.loads[$this.loadsBy].bind($this,resolve)();
                }).then(function(){
                    $this.doCallbacks();
                });
            },

            exit : function (){

                var $this = this;

                return new Promise(function(resolve){

                    $animations.exits[$this.exitsBy].bind($this,resolve)();
                }).then(function(){

                    // make sure the view is hidden in its loadFrom position
                    $this.$elem.css({
                            'z-index':-1,
                            'visibility':'hidden',
                            'display':'none',
                            'opacity':0
                        });

                    $this.setPosition($this.loadsFrom);
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
                var $this = this;
                return new Promise(function(resolve){
                    var $view = $this.$elem,
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
                    resolve();
                });
            },

            doCallbacks : function (){
                    var $this = this,
                        callbacks = this.doneLoading;

                    for (var i=0,n = callbacks.length; i < n; i++){
                        _.isFunction(callbacks[i]) && callbacks[i].bind($this)();
                    }
            }

        });
        
        function initialize(){
            
            var $views = octane.dom.views();
            // bind html views to View objects		
            for(var i=0,n=$views.length; i<n; i++){
                id = $views[i].id;
                config = JSON.parse($views[i].getAttribute('o-config'));
                !$Views[id] && ($Views[id] = new View(id,config));
            }
            octane.define({
                view : function(id){
                    return $Views[id] || false;
                }
            });
        }
    
        initialize();
                
        });