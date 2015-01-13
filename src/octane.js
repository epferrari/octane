    /* ------------------------------------------------------- */
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
                    // .routeIf(id,condition,onFail)            : extended from Router Module
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
                                    if(!(this[key])) {
                                        var $this = this;
                                        this[key] = _.isFunction(obj[key]) ? obj[key].bind($this) : obj[key];
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
		
    /* ------------------------------------------------------- */
	// define public octane constructor
	/* ------------------------------------------------------- */
        
        function Octane(name){
            this.name = name;
        };
        Octane.prototype = new Base('Octane Application');
        Octane.prototype.constructor = Octane;
        Octane.prototype.initialized = false; 
		
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
	/*                       GUID                              */
	/* ------------------------------------------------------- */		
		
		// set a unique identifier for the DOM element so we don't double count it
		Octane.prototype.define({
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
			getLog     : function(){
							 for(var i=0,I=_octane.logfile.length; i<I; i++){
                                 console.log(_octane.logfile[i]);
                             }
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
        
        function OctaneError(message){
            this.message = message || 'An Octane error occurred.';
            this.stack = Error().stack;
        }
        Octane.prototype.define({
            log : function(message){
                Octane.prototype.hasModule('debug') && _octane.log(message);
            }
        });
        OctaneError.prototype = Object.create(Error.prototype);
        OctaneError.prototype.constructor = OctaneError;
        OctaneError.prototype.name = 'OctaneError';
        
        Octane.prototype.define({
             error : function(message){
                 throw new OctaneError(message);
             }
        });
    
    /* ------------------------------------------------------- */
	/*                     XMLHttpRequest                      */
	/* ------------------------------------------------------- */
        
    
        Octane.prototype.define({
            
            xhr : function(cfg){
                    return new Promise(function(RESOLVE,REJECT){

                        var
                        xhr,
                        error,
                        params = {
                            url : false,
                            type : 'POST',
                            send : null,
                            responseType : 'text',
                        };

                        if(_.isString(cfg) && cfg.length !== 0){
                           params.url = cfg;
                        } else if(_.isObject(cfg)){
                            Octane.prototype.extend(params,cfg);
                        } else {
                            error = Octane.prototype.error('Octane.ajax must have a url');
                            REJECT(error);
                            return;
                        }

                        if (window.XMLHttpRequest) {
                          xhr = new XMLHttpRequest();
                        } else if (window.ActiveXObject){
                            try {
                                xhr = new ActiveXObject("Msxml2.XMLHTTP");
                            }catch(e){
                                try {
                                    xhr = new ActiveXObject("Microsoft.XMLHTTP");
                                }catch(e){
                                    error = Octane.prototype.error('Could not create XMLHttpRequest '+e.message);
                                    REJECT(error);
                                }
                            }
                        }

                        xhr.onreadystatechange = checkRequest;
                        xhr.open(params.type,params.url);
                        xhr.send(params.send);

                        function checkRequest(){
                            if(xhr.readyState === 4){
                                new __.Switch({
                                    '200' : function(xhr,params,RESOLVE,REJECT){
                                         var response;
                                        
                                        if(params.responseType == ('json' || "JSON")){
                                            response = returnJSON(xhr.responseText);
                                        } else {
                                            response = xhr.responseText;
                                        }
                                        response ? 
                                            RESOLVE(response) :
                                            REJECT(Octane.prototype.error('Error parsing response as JSON: Octane.ajax()')); 
                                    },
                                    '404' : function(){
                                        REJECT(Octane.prototype.error('The server responded with 400 not found'));
                                    },
                                    '500' : function(){
                                         REJECT(Octane.prototype.error('An internal server error occurred'));
                                    }
                                }).run(xhr.status,[xhr,params,RESOLVE,REJECT]);
                            }
                        }

                        function returnJSON(response){

                            try{
                                return JSON.parse(response);
                            }catch(e){
                                return false;
                            }
                        }
                    }); // end Promise()
                }, // end Octane.xhr()
            getLibrary : function(url,fn){
                return new Promise(function(resolve,reject){
                     
                    var
                    script,
                    content,
                    cleanURL = url.replace(/[.\/:]/g,'_'),
                    loaded = document.querySelectorAll('script#'+cleanURL);
                    
                    if(loaded.length !== 0){
                        // script is loaded
                        Octane.prototype.hasLibrary(cleanURL).then(resolve,reject);
                    } else {
                        
                        Octane.prototype.handle('script:loaded:'+cleanURL,function(){
                            content = _octane.cacheJSON.pop();
                            Octane.prototype.addLibrary(cleanURL,content).then(resolve,reject);
                        });
                        Octane.prototype.handle('script:failed:'+cleanURL,function(){
                            reject('Script failed to load from '+url);
                        });
                        
                        script = document.createElement('script');
                        script.id = cleanURL;
                        script.src = url;
                        script.onload = function(){
                            Octane.prototype.fire('script:loaded:'+cleanURL);
                        };
                        script.onerror = function(){
                            Octane.prototype.fire('script:failed:'+cleanURL);
                        };
                        
                        document.body.appendChild(script);
                    }
                });
            },
            jsonp : function(json){
                if(_.isString(json)){
                    try{
                        json = JSON.parse(json);
                    }catch(exc){
                       Octane.prototype.error('failed to parse JSON from Octane.jsonp() '+exc.message); 
                    }
                } 
                if(_.isObject(json)){
                    _octane.cacheJSON.push(json);
                }       
            }       
        });
      
        _octane.cacheJSON = [];
        
	/* ------------------------------------------------------- */
	/*                          EVENTS                         */
	/* ------------------------------------------------------- */		
		
       
       Octane.prototype.define({
           
			handle		: 	function(type,elem,handler){
                                
                                handler = (arguments.length == 3) ? arguments[2] : arguments[1];
                                
                                var 
                                types = type ? type.split(' ') : [],
                                numArgs = new __.Switch();
                               
                                numArgs
                                .addCase('2',function(type,handler){

                                    window.addEventListener(types[i],handler,false);
                                    if( !_.isArray(_octane.eventRegister[types[i]]) ){ 
                                        _octane.eventRegister[types[i]] = [];
                                    }
                                    _octane.eventRegister[types[i]].push(handler);

                                })
                                .addCase('3',function(type,handler,elem){

                                    window.addEventListener(type,function(e){
                                       
                                        if(e.srcElement == elem){
                                            var swatch = new __.Switch({
                                                'function' : function(e){
                                                   try{
                                                       handler.apply(elem,[e]);
                                                   }catch(exception){
                                                       _octane.log(exception);
                                                   }
                                                },
                                                'object' : function(elem,e){
                                                    try{
                                                        handler.handleEvent.apply(handler,[e]);
                                                    }catch(exception){
                                                        _octane.log(exception);
                                                    }
                                                }
                                            }).run(__.typeOf(handler),[elem,e]);
                                        }
                                    });
                                });
                                
                                for(var i=0,n=types.length; i<n; i++){
                                    numArgs.run(arguments.length,[types[i],handler,elem]);   
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
                                  
        Octane.prototype.define({
            
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
		
		Octane.prototype.define({
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
		
		Octane.prototype.addFilter('number',/^[-\d]+$/);
        Octane.prototype.addFilter('email',/^[-0-9a-zA-Z]+[-0-9a-zA-Z.+_]+@(?:[A-Za-z0-9-]+\.)+[a-zA-Z]{2,4}$/);
        Octane.prototype.addFilter('tel',/^[-0-9\.]{7,12}$/);
                    
	
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
       
		Octane.prototype.define({
			addLibrary : function(name,lib){
                if(_.isObject(lib)){
				    return _octane.libraries[name] = new Library(name,lib);
                } else {
                    return Promise.reject('could not create library '+name+'. Data was not an object');
                }
                
			},
            library : function(name){
                return Octane.prototype.hasLibrary(name).then(function(data){
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
			set	: function(){
                
                            var fresh;
							
                            if(_.isString(arguments[0])){
                                fresh = {};
                                fresh[arguments[0]] = arguments[1];
                            } else if(_.isObject(arguments[0])){
                                fresh = arguments[0];
                            } else {
                                return;
                            }
							
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
                            Octane.prototype.fire(e,{detail:updated});
                
                            return fresh;
                                
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
                        },
            controller   : function(){
                                if(_octane.controllers[this.name]){
                                    return _octane.controllers[this.name];
                                } else {
                                    return new Controller(this.name,this.context);
                                }
                            }
		});
		
	/* define Model on octane - bridge to private properties and methods */
		
		Octane.prototype.define({
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
				
				Octane.prototype.handle('input click '+$this.model.name+':statechange',$this);
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
                                    try{
                                        $update = _.invert( JSON.parse(el.getAttribute('o-update')) ) || {};
                                    }catch(exc){
                                        octane.log(exc);
                                        octane.error('JSON.parse() could not parse o-update string. ViewModel.parse() on element '+el);
                                    }
                                }
                            }
                            
                            // element hasn't been parsed yet
                            if(!el._guid){
                                el._guid = Octane.prototype.GUID();
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

                                        var o_update = new __.Switch({
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
                                        o_update.run(attribute);
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
                        'defined model is not an instance of Octane.prototype.Model'
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
				Octane.prototype.handle($this.model.name+':statechange',$this);
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
            // param 1 : a model key or array of model keys to listen for change on
            // add param 2 as function(model key,data held in model[key])
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
	
		Octane.prototype.define({
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
            Octane.prototype.model('bootlog').set({
                bootlog:_octane.bootlog,
                status:message
            });
        }
        _octane.moduleExports = {};
        
		function Module (cfg) { 
			this.extend(cfg);
		}
        
		Module.prototype = new Base();
        Module.prototype.extend({
            constructor         : Module
        });
        Module.prototype.define({
             import           :   function(module){
                                    return _octane.moduleExports[module];
                                },
             export          :   function(exports){
                                    if(!_.isObject(_octane.moduleExports[this.name])){
                                        _octane.moduleExports[this.name] = {};
                                    }
                                    try{
                                        Octane.prototype.extend.apply(_octane.moduleExports[this.name],[exports]);
                                    }catch (exc){
                                        Octane.prototype.error('Could not create extend exports, '+this.name+' module. '+exc.message);
                                    }
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
                                },
            _checkDependencies : function(){
                                    
                                    var 
                                    deps = this.dependencies || [],
                                    $this = this,
                                    results = [],
                                    message = [
                                        this.name+': checking dependencies...',
                                        this.name+': no dependencies, preparing to initialize...'
                                    ];
                
                                   bootLog(message[0]);
                                    
                                    if(deps.length === 0){
                                        bootLog(message[1]);
                                        return Promise.resolve();
                                        
                                    } else {
                                        for(var i=0,n = deps.length; i<n; i++){
                                            results.push( checkModuleDependency(deps[i]) );               
                                        }
                                    }
                                    
                
                                    //helper
                                    function checkModuleDependency(depName){
                                        
                                        depName = depName ? depName.trim() : '';
                                        var
                                        dep = _octane.modules[depName],
                                        message = [
                                            $this.name+': no dependencies, preparing to initialize...',
                                            $this.name+': Could not load module, missing module dependency "'+depName+'"',
                                            $this.name+': dependency "'+depName+'" loaded and initialized, continuing...',
                                            $this.name+': dependency "'+depName+'" not yet loaded, loading now...'
                                        ];
                                       
                                        if(!depName || depName.length === 0) {
                                            bootLog(message[0]);
                                            return Promise.resolve();
                                        }

                                        if( !(dep && dep instanceof Module) ) {
                                            // module is not present, fail
                                            bootLog(message[1]);
                                            return Promise.reject(message[1]);
                                        } else if( dep && dep.loaded){
                                            // module is already loaded, continue
                                            bootLog(message[2]);
                                            return Promise.resolve();
                                        } else {
                                            // module is not loaded, try to load it
                                            if(!dep.loaded){
                                                bootLog(message[3]);
                                                return dep._load().then(function(){
                                                     // recheck dependencies
                                                     return $this._checkDependencies();
                                                })
                                                .catch(function(err){
                                                    bootLog(err);
                                                    Promise.reject(err);
                                                });
                                            }
                                        } 
                                    }
                
                                    return Promise.all(results);
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
                                            
                                        this
                                        .define({
                                            loaded : true,
                                            name    : this.name,
                                            exports : this.constructor.prototype.exports
                                        })
                                        .define(this.constructor.__construct(this.cfg));

                                        Object.defineProperty(octane,$this.name, {
                                            value :$this,
                                            writatble : false,
                                            configurable : false
                                        });
                                        bootLog(message[1]);
                                        Octane.prototype.goose('application',{
                                            loadingProgress : (Math.ceil(100 / Object.keys(_octane.modules).length))
                                        });
                                        // hook-in for updating a loading screen
                                        Octane.prototype.fire('loaded:module',{
                                            detail:{moduleID: this.name }
                                        });
                                    }
                                    return Promise.resolve(this);
                                }
        });
        
		// add a module to octane before init
		function addModule (name,dependencies,constructor){
            constructor = (__.typeOf(arguments[2]) == 'function') ? arguments[2] : arguments[1];
            
			_octane.modules[name] = new Module({
                name            : name,
                constructor     : constructor,
                dependencies    : (__.typeOf(arguments[1]) == 'array') ? arguments[1] : [],
                loaded          : false
            });
		}
		
		// called at Octane.prototype.initialize()
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
                bootLog(err);
            });
		}
		
        
		Octane.prototype.define({
            
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
        
        Octane.prototype.define({
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
        
        
        Octane.prototype.define.call(Octane.prototype.dom,{
            container : function(){
                return document.getElementsByTagName('o-container')[0] || document.createElement('o-container');
            },
            canvas  : function(){
                return document.getElementsByTagName('o-canvas')[0] || document.createElement('o-canvas');

            },
            views    : function(){
                return document.getElementsByTagName('o-view') || [];
            },
            zIndexOverlay   : 999999999,
            zIndexMenu      : 99999998,
            zIndexView      : 99999997,
            zIndexHidden    : -1
        });
        
         Octane.prototype.controller('application')
            .parser('loadingProgress',function($data){
                var currentProgress = this.model.get('loadingProgress') || 0;
                $data.loadingProgress = currentProgress + $data.loadingProgress;
            });
        
    
    /* ------------------------------------------------------- */
	/*                          INIT                           */
	/* ------------------------------------------------------- */
        
        Octane.prototype.define({
            initialize :init
		});
        
		function init (options){
			options = options || {};
            
            // don't reinitialize
            if(Octane.prototype.initialized){
                return;
            } else {
                Octane.prototype.define({
                    initialized : true 
                });
            }
            
            octane.name = options.name;
            
            // initialize utilities
            var 
            utils = Octane.prototype.library('startup-utilities') || {},
            utilsKeys = Object.keys(utils),
            util;
                
            for(var u=0,U=utilsKeys.length; u<U; u++){
                util = utilsKeys[u];    
                // hook for the loading message
                Octane.prototype.fire('loading:utility',{detail:util});
                // init utility
               _.isFunction(utils[util]) && utils[util].call();
            }
            // add debugging support if module included, pass internal _octane app object
			if(_octane.modules['debug']){
                options.debug = [_octane];
            }
            initModules(options).then(function(){
                
                // unhide the rest of content hidden behind the loader
                setTimeout(function(){
                    Octane.prototype.dom.container().setAttribute('style','visibility:visible;'); 
                },1000);
                // route to url-parsed view|| home
                // var view = Octane.prototype.parseView() || 'home';
                //Octane.prototype.route(view);
                Octane.prototype.fire('octane:ready');
            
            });
		}
        
        window.octane = window.$o = new Octane();
        
	})($,_,__);


    
	/* TODO - octane extension methods */
	// add built in filters
    // add filters/lenses in refresh
	// build modal view and routing
	
	
	
