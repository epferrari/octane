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
                    // .rescope()

                /* Controller methods */

                    // .filter(o-bind,filter)
                    // .hook(o-bind,$caseObject)
                    // .hook(o-bind,func(data[,async]))
                    // .task(o-bind,func(o-bind,data))

                    // .doFilter($data)
                    // .applyHooks($data)

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
		
		function Base(){}
        
		
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
        
        function Octane(){
            this.name = 'Octane Application';
        };
        
        var $O = Octane.prototype = new Base();
        $O.constructor = Octane;
        $O.initialized = false;
        $O.define({
            base : function(){
                return new Base();
            }
        });
		
	/* ------------------------------------------------------- */
	// internal application object and properties
	/* ------------------------------------------------------- */
		
		var _octane = new Base();
		_octane.define({
				modules		    : {},
				models		    : {},
                Models          : [],
				views		    : {},
				controllers     : {},
                eventRegister   : {}
		});
        
        
        // simple promise implementation
        function Pact(){}    
        Pact.prototype = new Base();
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
	/*                     COMPILER AND HOOK                   */
	/* ------------------------------------------------------- */
        
        _octane.compilationTasks = [];
        
        $O.define({
            compiler : function(task){
                _octane.compilationTasks.push(task);
            },
            compile : function(){
                
                var 
                task,
                tasksCompleted = [];
                
                for(var i=0,n=_octane.compilationTasks.length; i<n; i++){
                    tasksCompleted.push((function(task){
                        return new Promise(function(resolve){
                            _.isFunction(task) && task.call();
                            resolve();
                        });    
                    })(_octane.compilationTasks[i]));
                }
                return Promise.all(tasksCompleted);
            }
        });
	
	/* ------------------------------------------------------- */
	/*                       GUID                              */
	/* ------------------------------------------------------- */		
		
		// set a unique identifier for the DOM element so we don't double count it
		$O.define({
			GUID : function(){
				var random4 = function() {
					return (((1 + Math.random()) * 0x10000)|0).toString(16).substring(1).toUpperCase();
				};
				return 'octane'+ random4() +'-'+ random4() +'-'+ random4() + random4();
			}
		});
	
	/* ------------------------------------------------------- */
	/*                   ERRORS & LOGGING                      */
	/* ------------------------------------------------------- */		
		
		_octane.extend({
			logfile    : [],
			log 	   : function(message){
                 _octane.logfile.push(message);
            }
		});
        
        $O.define({
            log : function(message){
                $O.hasModule('debug') && _octane.log(message);
            }
        });
		
        
        function OctaneError(message){
            this.message = message || 'An Octane error occurred.';
            this.stack = Error().stack;
        }
        
        OctaneError.prototype = Object.create(Error.prototype);
        OctaneError.prototype.constructor = OctaneError;
        OctaneError.prototype.name = 'OctaneError';
        
        $O.define({
             error : function(message){
                 throw new OctaneError(message);
             }
        });
    
    /* ------------------------------------------------------- */
	/*                     XMLHttpRequest                      */
	/* ------------------------------------------------------- */
        
        function URIencodeObject(source){
            
            source = _.isObject(source) ? source : {};
            var 
            keys = Object.keys(source),
            n = keys.length,
            array = [];

          while(n--) {
             array.push(encodeURIComponent(keys[n]) + "=" + encodeURIComponent(source[keys[n]]));
          }

          return array.join("&");
        }
            
            
        function http(url,method,data,headers){
            return new Promise(function(resolve,reject){
                var
                encoded = URIencodeObject(data),
                $headers = {
                    'Content-Type':'application/x-www-form-urlencoded',
                    'Content-Length':encoded.length
                },
                request,
                headerKeys,
                $headers,
                header,
                value;
                
                $O.extend.apply($headers,[headers]);
                headerKeys = Object.keys($headers);
                
                try{
                    request = new(window.XMLHttpRequest || window.ActiveXObject)("MSXML2.XMLHTTP.3.0");
                } catch(ex){
                    $O.error('Could not create XMLHttpRequest object');
                }
                
                request.onreadystatechange = function(){
                    if(request.readyState === 4){
                        new __.Switch({
                            '200' : function(resolve,reject){
                                var response;

                                try {
                                    response = JSON.parse(request.responseText);
                                } catch(ex){
                                    response = request.responseText;
                                }
                                console.log(request.getAllResponseHeaders());
                                resolve(response);
                            },
                            '404' : function(reslove,reject){
                                reject($O.error('The server responded with 400 not found'));
                            },
                            '500' : function(resolve,reject){
                                 reject($O.error('An internal server error occurred'));
                            }
                        }).run(request.status,[resolve,reject]);
                    }
                }    
               
                request.open(method,url,true);
                
               for(var i=0,n = headerKeys.length; i<n; i++){
                    header = headerKeys[i];
                    value = $headers[header];
                    request.setRequestHeader(header,value);
                }
                request.send(encoded);
            });
                
            
        }
        
        function Http(url,headers){
            this.url = url;
            this.headers = _.isObject(headers) ? headers : {};
        }
        
        Http.prototype = new Base();
        Http.prototype.define({
            
            get : function(){
                return http(this.url,'GET',null,this.headers);
            },
            post : function(data){
                return http(this.url,'POST',data,this.headers);
            },    
            put : function(data){
                return http(this.url,'PUT',data,this.headers);
            },
            delete : function(){
                return http(this.url,'DELETE',null,this.headers);
            }
        });
        
        $O.define({
            http : function(url,headers){
                return new Http(url,headers);
            }
        });
        
        _octane.loadedCache = [];
        
        $O.define({
            
            getLibrary : function(url,fn){
                return new Promise(function(resolve,reject){
                     
                    var
                    script,
                    content,
                    cleanURL = url.replace(/[.\/:]/g,'_'),
                    loaded = document.querySelectorAll('script#'+cleanURL);
                    
                    if(loaded.length !== 0){
                        // script is loaded
                        $O.hasLibrary(cleanURL).then(resolve,reject);
                    } else {
                        
                        $O.handle('script:loaded:'+cleanURL,function(){
                            content = _octane.loadedCache.pop();
                            $O.addLibrary(cleanURL,content).then(resolve,reject);
                        });
                        $O.handle('script:failed:'+cleanURL,function(){
                            reject('Script failed to load from '+url);
                        });
                        
                        script = document.createElement('script');
                        script.id = cleanURL;
                        script.src = url;
                        script.onload = function(){
                            $O.fire('script:loaded:'+cleanURL);
                        };
                        script.onerror = function(){
                            $O.fire('script:failed:'+cleanURL);
                        };
                        
                        document.body.appendChild(script);
                    }
                });
            },
            jsonp : function(json){
                if(_.isString(json)){
                    try{
                        json = JSON.parse(json);
                    }catch(ex){
                       $O.log('failed to parse JSON from Octane.jsonp() '+ex.message); 
                    }
                } 
                if(_.isObject(json)){
                    _octane.loadedCache.push(json);
                }       
            }       
        });
      
        
        
	/* ------------------------------------------------------- */
	/*                          EVENTS                         */
	/* ------------------------------------------------------- */		
		
        _octane.eventHandlerMap = {};
        _octane.handleMappedEvents = function(e){
            
            var 
            elem = e.srcElement,
            handler = _octane.eventHandlerMap[elem._guid+'-'+e.type],
            swatch = new __.Switch({
                'function' : function(e){
                   try{
                       handler.apply(elem,[e]);
                   }catch(ex){
                       _octane.log(ex);
                   }
                },
                'object' : function(elem,e){
                    try{
                        handler.handleEvent.apply(handler,[e]);
                    }catch(ex){
                        _octane.log(e);
                    }
                }
            }).run(__.typeOf(handler),[elem,e]);
        };
       
            
        $O.define({
           
			handle		: 	function(type,elem,handler){
                                
                                handler = (arguments.length == 3) ? arguments[2] : arguments[1];
                                
                                var 
                                types = type ? type.split(' ') : [],
                                argsLength = arguments.length,
                                numArgs = new __.Switch();
                               
                                numArgs.addCase('2',function(type,handler){
                                    
                                    window.addEventListener(type,handler,false);
                                    if( !_.isArray(_octane.eventRegister[types[i]]) ){ 
                                        _octane.eventRegister[type] = [];
                                    }
                                    _octane.eventRegister[type].push(handler);

                                })
                                .addCase('3',function(type,handler,elem){
                                    if(!elem._guid){
                                        elem._guid = $O.GUID();
                                    }
                                    _octane.eventHandlerMap[elem._guid+'-'+type] = handler;
                                    window.addEventListener(type,_octane.handleMappedEvents,false);
                                });
                                
                                for(var i=0,n=types.length; i<n; i++){
                                    numArgs.run(argsLength,[types[i],handler,elem]);   
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
	/*                       FILTERS                           */
	/* ------------------------------------------------------- */
		
		_octane.filters = new __.Switch();
		
		$O.define({
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
		
		$O.addFilter('number',/^[-\d]+$/);
        $O.addFilter('email',/^[-0-9a-zA-Z]+[-0-9a-zA-Z.+_]+@(?:[A-Za-z0-9-]+\.)+[a-zA-Z]{2,4}$/);
        $O.addFilter('tel',/^[-0-9\.]{7,12}$/);
                    
	
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
       
		$O.define({
			library : function(name,lib){
                if(_.isObject(lib)){
				    return _octane.libraries[name] = new Library(name,lib);
                } else {
                    return Promise.reject('could not create library '+name+'. Data was not an object');
                }
                
			},
            getLib : function(name){
                return $O.hasLibrary(name).then(function(data){
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
	/*                        DataStores                       */
	/* ------------------------------------------------------- */ 
    
    _octane.datastores = {};
        
    function DataStore(id,db){
        
        this.id = id;
        var $db = db;
        
        this.define({
            query : function(keystring){ 
                                                
                        var dbData,keyArray;

                        if(keystring){
                            keyArray = keystring.split('.');

                            try{
                                dbData = keyArray.reduce(function(o,x,i){
                                    return o[x];
                                },$db);
                            }catch(ex){
                                dbData = null;
                                $O.log('Unable to get DataStore data "'+keystring+'". Error: '+ex.message);
                            }
                            return dbData;
                        }
                    },
            rebase  : function(db) {
                        $db = _.isObject(db) && db;
                    }
        });
        
    }
        
    DataStore.prototype = new Base();
        
    $O.define({
        storage : function(storeId,db){
        
                    if(!_octane.datastores[storeId]){
                        _octane.datastores[storeId]= new DataStore(storeId,db);
                    }else{
                        $O.error('cannot recreate storage object '+storeId+'. Use .rebase() instead');
                    }
                },
        hasStore : function(storeId){
                    return new Promise(function(resolve){
                        if(_octane.datastores[storeId]){
                            resolve();
                        }
                    });
                },
        lookup : function(storeKey){
                    var 
                    storeID = storeKey.split('.')[0],
                    dbKey = storeKey.split('.').slice(1).join('.'),
                    $store =  _octane.dataStores[storeID];
                    if(!$store){
                        return false;
                    };
                    if($store && dbKey){
                        return $store.query(dbKey);
                    }
        },
        rebase : function(storeID,data){
            
                    _octane.dataStores[storeID] && _octane.dataStores[storeID].rebase(data);
        }
    });
   
        
	/* ------------------------------------------------------- */
	/*                         MODELS                          */
	/* ------------------------------------------------------- */
	
		function Model(name){
            this.name = name;
            this.state = {};
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
                                 $O.log('Unable to set model data "'+keyString+'". Error: '+e);
                            }
                            modelUpdated && updated.push(keyString);
                        }

                        $O.fire(this.name+':statechange');

                        return fresh;

                        // helpers
                        /* ------------------------------------------------------- */

                            function parseString(o,x,index){

                                if(index == (k-1)){
                                    if(value == null){
                                        delete o[x];
                                        return;
                                    } else {
                                        return o[x] = value;
                                    }
                                }else{
                                    return o[x] = _.isObject(o[x]) ? o[x] : {};
                                }
                            }

                        /* ------------------------------------------------------- */

                    },
            unset : function(){
                
                            var
                            keys,
                            toUnset = {};
							
                            if(_.isString(arguments[0])){
                                keys = [ arguments[0] ];
                            } else if(_.isArray(arguments[0])){
                                keys = arguments[0];
                            } else {
                                return;
                            }
                
                            keys.forEach(function(key){
                                toUnset[key] = null;
                            });
                
                            this.set(toUnset);
                        
                        },
			get	: 	function(keystring){
                
                            var
                            $this = this,
                            stateData;

                            if(keystring && _.isString(keystring)){
                                var keyArray = keystring.split('.');

                                try{
                                    stateData = keyArray.reduce(function(o,x,i){
                                        return o[x];
                                    },$this.state);
                                }catch(ex){
                                    stateData = '';
                                   $O.log('Unable to get model data "'+keystring+'". Error: '+ex.message);
                                }
                                return stateData;
                            } else {
                                return this.state;
                            }
						},
            clear : function(){
                            var 
                            stateProps = Object.keys(this.state),
                            cleared = {};
                            
                            for(var i=0,n=stateProps.length; i<n; i++){
                                //cleared[stateProps[i]] = null;
                                delete this.state[stateProps[i]];
                            }
                            octane.fire(this.name+':statechange');
                           // this.set(cleared);
                            return this;
                        }                   
          
		});
		
		$O.define({
            Model       : function(Name,config){
                            
                            config = config || {};
                            
                            var 
                            classDefaults = config.defaults || {},
                            extend = config.extend || {},
                            initialize = config.initialize || false;
                            
                            
                            function _Model(name,instanceDefaults){
                                
                                this.define({name: name});
                                
                                
                                // protected
                                var
                                vm = new ViewModel(this),
                                _defaults = _.isObject(instanceDefaults) ? $O.extend.apply(classDefaults,[instanceDefaults,true]) : classDefaults;
                                
                                this.define({
                                    state		: {},
                                    rescope : vm.parse.bind(vm)
                                });
                                
                                this.set(_defaults);
                                _octane.models[this.name] = this;
                                try{
                                    _octane.Models[Name].push(this);
                                } catch (ex){
                                    _octane.Models[Name] = [];
                                    _octane.Models[Name].push(this);
                                }
                                
                                _.isFunction(initialize) && initialize.apply(this);
                            }
                
                            _Model.prototype = new Model(Name);
                            _Model.prototype.extend(extend);
                            _Model.prototype.define({
                                reset : function(){
                                    
                                    this.clear().set(_defaults);
                                }
                            });
                
                            return _Model;
                        },
                         
			model 		: function (name,defaults){
                           
                            if(!name){
                                $O.error('model must have name');
                                return false;
                            }
                            if(_octane.models[name]){
                                return _octane.models[name];
                            }
                            
                            var singleton = $O.Model(name);
                            
                            return new singleton(name,defaults);
                        },
            
            get         : function(modelStateKey){
                            
                            var 
                            modelName = $O._parseModelName(modelStateKey),
                            stateKey = $O._parseModelKey(modelStateKey),
                            model = _octane.models[modelName];
                            
                            if(model && stateKey){
                                return model.get(stateKey);
                            } else if(model){
                                return model.get();
                            }
                        },
            set         : function(){
                            
                            var
                            arg0 = arguments[0],
                            arg1 = arguments[1],
                            fresh,
                            keys,
                            swatch;
                            
                            swatch = new __.Switch({
                                'string' : function(arg0,arg1){
                                    fresh = {};
                                    fresh[arg0] = arg1;
                                },
                                'object' : function(arg0,arg1){
                                    fresh = arg0;
                                },
                                'default' : function(){
                                    fresh = {};
                                }
                            }).run(__.typeOf(arg0),[arg0,arg1]);
                            
                           
                            keys = Object.keys(fresh);
                            for(var i=0,F=keys.length; i<F; i++){
                               doSet( keys[i] );
                            }
                            
                            // helper
                            function doSet(keystring){
                                
                                var
                                modelName = $O._parseModelName(keystring),
                                key = $O._parseModelKey(keystring),
                                value = fresh[keystring],
                                model = _octane.models[modelName];
                                
                               model && model.set(key,value);
                            }
                
                        },
            unset       : function(){
                            
                            
                            var
                            subject = arguments[0],
                            toUnset,
                            swatch;
                
                            swatch = new __.Switch({
                                'string' : function(sub){
                                    toUnset = sub.split(',');
                                    toUnset = toUnset.map(function(key){
                                       return key.trim();
                                    });
                                },
                                'array' : function(sub){
                                    toUnset = sub;
                                },
                                'default' : function(){
                                    toUnset = [];
                                }
                            }).run(__.typeOf(subject),[subject]);

                            toUnset.forEach(function(keystring){
                                
                                var
                                modelName = $O._parseModelName(keystring),
                                key = $O._parseModelKey(keystring),
                                model = _octane.models[modelName];
                               
                                model && model.unset(key);
                            });
                        },
            _parseModelName  : function(bind){
                            try {
                                return bind.split('.')[0];
                            } catch (ex){
                               $O.error('could not parse model name from '+bind+': '+ex.message);
                                return false;
                            }
                        },
            _parseModelKey   : function(o_bind){
                            try{
                                return o_bind.split('.').slice(1).join('.');
                            } catch (ex){
                                $O.error('could not parse model key from '+o_bind+': '+ex.message);
                                return false;
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
            this.init();
		}
		
		
	/*  prototype ViewModel */
	
		ViewModel.prototype = new Base();
		ViewModel.prototype.define({
            
            init : function(){
				        
                        var $this = this;
                        this.watcher
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

                        $O.handle('input click '+$this.model.name+':statechange',$this);
                        this.parse();    
                        this.refresh();
                    },
			
            // find bound elements on the DOM
			parse	: function(){
						
						var
                        $this = this,
                        $scope = this.scope,
                        $bindScope = document.querySelectorAll('[o-bind^="'+this.model.name+'."]'),
                        $updateScope = document.querySelectorAll('[o-update*="'+this.model.name+'."]'),
                        scopedElems = [];
                        
                        // union the two node lists
                        for(var b=0,B=$bindScope.length; b<B; b++){
                            scopedElems.push($bindScope[b]);
                        }
                        for(var u=0,U=$updateScope.length; u<U; u++){
                            if(!__.inArray(scopedElems,$updateScope[u])){
                                scopedElems.push($updateScope[u]);
                            }
                        }
                        
                
                        // loop elements with this o-model
                        scopedElems.__forEach(function(elem){
                            
                            // element hasn't been parsed yet
                            if(!elem._guid){
                                
                                var 
                                oBind = elem.getAttribute('o-bind'),
                                _oUpdate = elem.getAttribute('o-update'),
                                oUpdate = {};
                            
                           
                                elem._guid = $O.GUID();
                                elem._bind = oBind;
                                elem._update = oUpdate;
                                try{
                                    elem._filters = JSON.parse( elem.getAttribute('o-filters') );
                                } catch (ex){
                                    $O.log(ex);
                                }
                    
                                if(_oUpdate){
                                    // not a JSON string
                                    if(_oUpdate.length > 0 && _oUpdate.indexOf("{") !== 0){
                                        oUpdate[_oUpdate] = 'html';
                                    } else {
                                        try{
                                            oUpdate = _.invert( JSON.parse(_oUpdate) ) || {};
                                        }catch(ex){
                                           $O.log(ex.message + ' in ViewModel.parse(), element: '+elem );
                                        }
                                    }
                                }

                                // create array for this.bindings[bind] if not already an array
                                if(oBind){
                                    if(!$scope[oBind]) {  $scope[oBind] = []; }
                                // push element into scope[key] for its two-way data bind
                                    //if(!__.inArray(this.scope[oBind],[elem,'value'])){
                                    $scope[oBind].push([oBind,elem,'value']);
                                    //}
                                }

                                // push element+attr to scope[key] for one-way updates 
                                _.forOwn(oUpdate,function(attr,key){
                                    if(!$scope[key]) {  $scope[key] = []; }
                                    $scope[key].push([key,elem,attr]); 
                                });
                                
                            }
                        });
					},
					
			// update all data on the DOM bound to this ViewModel's Model
			refresh 	: 	function (e){
								
                                // loop bound model datapoint in scope
                                var
                                $scope = this.scope,
                                scopeKeys = Object.keys($scope),
                                toUpdate;
                                
                
                               scopeKeys.__forEach( function(key){
                                  
                                    $scope[key].__forEach(function(group){
                                       
                                        update(group[0],group[1],group[2]);
                                    })
                                });
                                
                                    
                                
                                // helper
                                /* ------------------------------------------------------- */
                                    
                                    function update(key,elem,attr){
                                        
                                        var fresh = $O.get(key);
                                        
                                        if(__.isNull(fresh) || __.isUndefined(fresh)){
                                            fresh = null;
                                        }
                                        if(attr.indexOf('.') !== -1){
                                            // update style on element
                                            var 
                                            prop = attr.split('.')[1];
                                            
                                            elem.style[prop] = fresh;
                                        } else {
                                            
                                            var updater = new __.Switch({
                                                'html' : function(fresh){
                                                    elem.innerHTML = fresh;
                                                },
                                                'text' : function(fresh){
                                                    elem.textContent = fresh;
                                                },
                                                'value' : function(fresh){
                                                    elem.value = fresh;
                                                },
                                                'default' : function(fresh,attr){
                                                    console.log(elem);
                                                    console.log(attr);
                                                    console.log(fresh);
                                                    elem.setAttribute(attr,fresh);
                                                }
                                            }).run(attr,[fresh,attr]);
                                        }
                                    }
                                
                                /* ------------------------------------------------------- */
                                       
							},
			
			// respond to user changes to DOM data bound to this model
			uptake		: 	function(element){
                                
                                var 
                                o_bind = element._bind,
                                // remove model name from string
                                pointer = o_bind ? $O._parseModelKey(o_bind) : null,
                                $state={};

                                if( this.scope[o_bind] && element.value != this.model.get(pointer) ){
                                    $state[pointer] = element.value;
                                    
                                    var 
                                    parsed = false,
                                    controllerIDs = Object.keys(_octane.controllers),
                                    controller;
                                    
                                    for(var c=0,C=controllerIDs.length; c<C; c++){
                                        controller = _octane.controllers[controllerIDs[c]];
                                        if(controller.hooks[o_bind]){
                                            controller.applyHooks(this.model.name,$state);
                                            parsed = true;
                                        }
                                    }
                                    !parsed && this.model.set($state);
                                   
                                    /*if(_octane.controllers[this.model.name]){
                                        _octane.controllers[this.model.name].applyHooks(this.model.name,$state);
                                    } else {
                                        this.model.set($state);
                                    }*/
                                }				
							},
			handleEvent	: 	function (e){ 
								this.watcher.run(e.type,[e]);
							}
		});

	
	/* ------------------------------------------------------- */
	/*                     CONTROLLERS                         */
	/* ------------------------------------------------------- */
		
		function Controller(name,viewID){
			
			
			var $this = this;
			// private properties
					
			// semi-public	API	
			this.define({
				name		: name,
				filters     : {},
                hooks       : {},
                view        : document.querySelector('o-view#'+viewID)
			});
			
			// add this Controller instance to the _octane's controllers object
            _octane.controllers[name] = $this;
		}
		
	/* prototype Controller */
		
		Controller.prototype = new Base();
        Controller.prototype.constructor = Controller;
		Controller.prototype.define({
            
            // a function to be applied in between filtering and the setting of data in the model
            // if one model data value changes depending on another, a hook is the place for that logic
            // key is the incoming data key to parse for, fn is the function to apply
            // hook param 'func' can take 2 arguments, the first is the bound dirty data,
            // the second is an arbitrarily named flag that tells the hook it should be a Promise
            // remember to resolve the promise or the data won't be set in the model
            hook			: function(o_bind,func){
                                   
                                var 
                                funcDeclaration= func.toString().split('{')[0],
                                pattern = /\(([^)]+)\)/,
                                argsString = pattern.exec(funcDeclaration)[1],
                                argsArray = argsString.split(','),
                                $this = this;
                                
                                // confirm we have an array of hooks
                                this.hooks[o_bind] = _.isArray(this.hooks[o_bind]) ? this.hooks[o_bind] : [];
                
                                if(_.isFunction(func)){

                                    if(argsArray.length == 2){
                                        this.hooks[o_bind].push(function($state){
                                            return new Promise(function(resolve,reject){
                                                // create object to resolve/reject promise in our hook function
                                                var promise = {
                                                    resolve:resolve,
                                                    reject:reject
                                                };
                                                // make sure 'this' in our hooks refers to this Controller
                                                func.bind($this)($state,promise);
                                            });
                                        });
                                    }else{
                                        this.hooks[o_bind].push(function($state){
                                            // make sure 'this' in our hooks refers to this Controller
                                            return func.bind($this,$state)();
                                        });
                                    }
                                }
                                return this; // chainable	
                          },


            
            // param 1 : a model key or array of model keys to listen for change on
            // add param 2 as function(model key,data held in model[key])
			task   : 	function(props,task){
				               
                                var 
                                $controller = this,
                                models = {},
                                cache ={};
                                
                                if(!_.isArray(props)){
                                    props = [props];
                                }
                                
                                for(var m=0,M=props.length; m<M; m++){
                                    addBindHandler(props[m],task);   
                                }
                                
                                // helper
                                function addBindHandler(prop,task){
                                    var 
                                    model =  $O._parseModelName(prop),
                                    bind = $O._parseModelKey(prop);
                                    
                                    $O.handle(model+':statechange',function(e){
                                        var currentVal = $O.get(prop);
                                        if(currentVal != cache[prop]){
                                            cache[prop] = currentVal;
                                            task.apply($controller,[currentVal]);
                                        }
                                    });
                                }
                                
								return $controller; // chainable
							},
			
			
			applyHooks	: function(model,$state){
                                
                                var
                                $this = this;
                                if(_.isObject($state)){
                                    
                                    var 
                                    stateKeys = Object.keys($state),
                                    o_bind,hooks;
									
                                    for(var i=0,I=stateKeys.length; i<I; i++){
                                        
                                        (function(key){
                                            o_bind = model+'.'+key;
                                            hooks = $this.hooks[o_bind];

                                            if(hooks && _.isArray(hooks)){
                                                for(var p=0,P=hooks.length; p<P; p++){
                                                    applyHook($state,hooks[p],hooks);    
                                                }  
                                            } else {
                                                _octane.models[model].set($state);
                                            }
                                        })(stateKeys[i]);
                                    }
                                }
                
                                // helper
                                function applyHook($state,hook,hooks){
                                    var
                                    nextHook = hooks.indexOf(hook) +1, // resolves to 0 if no next hook
                                    $maybePromise = hook && hook($state);
                                    
                                    if(_.isObject($maybePromise) && _.isFunction($maybePromise.then)){
                                        if(nextHook){
                                            $maybePromise.then(function(data){
                                                applyHook(data,hooks[nextHook],hooks);
                                            });
                                        } else {
                                            try {
                                                $maybePromise.then(_octane.models[model].set);
                                            }catch(ex){
                                                $O.log(ex);
                                            }
                                        }
                                    } else {
                                        if(nextHook){
                                            applyHook($state,hooks[nextHook],hooks);
                                        } else {
                                            try{
                                                _octane.models[model].set($state);
                                            }catch(ex){
                                                $O.log(ex);
                                            }
                                        }
                                    }
                                }
							},
             // assign an _octane filter to be run on a 'dirty' data property
            filter		: function(o_bind,filter){
                                this.filters[o_bind] = filter;
                                return this; // chainable
                        },
            // add a new Switch instance with a case object to be processed
            // when a filter is called on the defined property
            /*hook			: function(o_bind,caseObject){
                                this.hooks[o_bind] = new __.Switch(caseObject);
                                return this; // chainable
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
								
								this.applyHooks( filterAll($dirty) );	
                
                                // helper
                                /* ------------------------------------------------------- 

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

                                /* ------------------------------------------------------- 
                                
							},*/
		});
	
		$O.define({
			controller 	: function (name,viewID){
                                if(!name){
                                    return new Controller($O.GUID(),viewID);
                                } else if(!_octane.controllers[name]){
                                    return new Controller(name,viewID);
                                } else {
                                    return _octane.controllers[name];
                                }
                            }                    
		});
	
	
	/* ------------------------------------------------------- */
	/*                         MODULES                         */
	/* ------------------------------------------------------- */
		
        _octane.bootlog = [];
        _octane.moduleConfigs = {};
        
        function bootLog(message){
            _octane.bootlog.push(message);
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
                                        $O.extend.apply(_octane.moduleExports[this.name],[exports]);
                                    }catch (ex){
                                        $O.error('Could not create extend exports, '+this.name+' module. '+ex.message);
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
                                            // remove dependency from list
                                            //_.pull(deps,depName);
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
                                    this.loaded = false;
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
                                            name    : this.name
                                        })
                                        .define(this.constructor.__construct([this.cfg]));

                                        Object.defineProperty(octane,$this.name, {
                                            value :$this,
                                            writatble : false,
                                            configurable : false
                                        });
                                        
                                        try{
                                            this.initialize && this.initialize();
                                        }catch(ex){
                                            octane.log(ex);
                                        }
                                        
                                        bootLog(message[1]);
                                        $O.goose("application",{
                                            "loadingProgress" : (Math.ceil(100 / Object.keys(_octane.modules).length))
                                        });
                                        // hook-in for updating a loading screen
                                        $O.fire('loaded:module',{
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
                loaded          : false,
                cfg             : [{}]
            });
		}
		
		// called at $O.initialize()
		function initModules(options){
			
			options = options || {};

            // load router module first
            return _octane.modules['StartupUtilities']._load()
                .then(function(){
                    return _octane.modules['Router']._load();
                })
                .then(function(){
                
                    var 
                    moduleName,
                    moduleKeys = Object.keys(_octane.modules),
                    modulesLoaded = [],
                    tryLoading = function(moduleName){
                        
                        var 
                        initConfig,
                        moduleConfig,
                        module = _octane.modules[moduleName];
                        
                        if(!module.loaded){
                            bootLog(moduleName+': not loaded, loading...');
                            
                            // assign config properties, those
                            initConfig = _.isPlainObject(options[moduleName]) ? options[moduleName] : {};
                            moduleConfig = _.isPlainObject(_octane.moduleConfigs[moduleName]) ? _octane.moduleConfigs[moduleName] : {};
                            module.cfg = $O.extend.apply(moduleConfig,[initConfig,true]);
                            modulesLoaded.push( module._load() );
                        }
                    };
                            
                    // load each module
                    for(var i=0,m=moduleKeys.length; i<m; i++){
                        var moduleName = moduleKeys[i];
                        tryLoading(moduleName);
                    }
                
                    return Promise.all(modulesLoaded);
                })
                .catch(function(err){
                    bootLog(err);
                });
		}
		
        
		$O.define({
            
            module     : function(name,dependencies,$module){ 
                            return addModule(name,dependencies,$module);
                        },
            hasModule : function (name){ 
                            return _octane.modules[name] ? _octane.modules[name].loaded : false; 
                        },
            moduleConfig : function(module,cfg){
                            if(_.isPlainObject(cfg)){
                                _octane.moduleConfigs[module] = cfg;
                            }
                        }
        });
        
    /* ------------------------------------------------------- */
	/*                         CIRCUIT                         */
	/* ------------------------------------------------------- */
      
        $O.define({
            // artificially start the uptake circuit
            goose : function(model,$state){
                        var
                        controllers = _octane.controllers,
                        controllerIDs = Object.keys(controllers),
                        id;
                
                        for(var i=0,c=controllerIDs.length; i<c; i++){
                            controllers[controllerIDs[i]].applyHooks(model,$state);
                        }
                    },
            // a custom event for the app to fire when user data changes 
            trip       :   function(elem){

                        var rand = Math.random(),
                            e = __.customEvent('input',{bubbles:true,detail:rand});

                        elem.dispatchEvent && elem.dispatchEvent(e);
                    },
         });
        
    /* ------------------------------------------------------- */
	/*                          DOM                            */
	/* ------------------------------------------------------- */
        
        
        
        // global model and controller
        // octane DOM elements
            
        
        $O.define({ dom : {} });
        
        $O.define.call($O.dom,{
            loadingContainer : function(){
                return document.getElementsByTagName('o-loading-container')[0] || document.createElement('o-loading-container');
            },
            bgContainer : function(){
                return document.getElementsByTagName('o-background')[0] || document.createElement('o-background');
            },
            appContainer : function(){
                return document.getElementsByTagName('o-app-container')[0] || document.createElement('o-app-container');
            },
            viewContainer  : function(){
                return document.getElementsByTagName('o-view-container')[0] || document.createElement('o-view-container');

            },
            views    : function(){
                return document.getElementsByTagName('o-view') || [];
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
            matches = template.match(pattern);
            
            if(_.isArray(matches)){
                matches.forEach(function(match){
                   
                    var
                    key = match.replace(/[{}]+/g,''),
                    regexp = new RegExp("(\\{\\{"+key+"\\}\\})","g"),
                    keySplit = key.split('.'),
                    l = keySplit.length,
                    value;
                    
                    value = keySplit.reduce(function (prev,curr,index,array){
                        //console.log('previous',prev);
                        //console.log('current',curr);
                        var val = prev[curr];
                        if(index == (l-1)){ 
                            return val; // last iteration, return value
                        } else if(_.isObject(prev)){ 
                            return val; // go one level deeper
                        } else { 
                            return null; // no further nesting, value defined in key does not exist
                        }
                    },data); // start with data object passed to template
                    
                    template = template.replace(regexp,value);
                });
            }
            return template;
        }
        
         (function parseTemplatesFromDOM(){
            var 
            tmpls = document.querySelectorAll('script[type="text/octane-template"]'),
            t = tmpls.length,
            setTemplate = function setTemplate(template){
                if(!_octane.templates[template.id]){
                    _octane.templates[template.id] = template.innerHTML;
                }else{
                    $O.error('Could not create template '+template.id+'. Already exists');
                }
            };
            
            while(t--){
                setTemplate(tmpls[t]);
            }        
        })();
        
        
        function Template(id){
            this.id = id;
            this.content = _octane.templates[this.id] || '';
            
        }
        Template.prototype = new Base();
        Template.prototype.define({
            create : function(content){
                if(_.isString(content)){
                    if(!_octane.templates[this.id]){
                        _octane.templates[this.id] = content;
                    }else{
                        $O.error('Could not create template '+this.id+'. Already exists');
                    }
                }
            },
            get : function(data){
                
                return this.content;
            },
            inject : function(data){
                
                this.content = parseTemplate(_octane.templates[this.id],data);
                return this; // chainable
            },
            into : function(elem,prepend){
                
                var 
                div = document.createElement('div'),
                nodes,
                node,
                firstChild = elem.firstChild;
                
                div.innerHTML = this.content;
                div.normalize();
                nodes = div.childNodes;
                
                if(prepend){
                     for(var i=0,n=nodes.length; i<n; i++){
                        node = nodes[i];
                        if(node && node.nodeType == (Node.ELEMENT_NODE || Node.TEXT_NODE)){
                            elem.insertBefore(node,firstChild);
                        }
                    }
                } else {
                    for(var i=0,n=nodes.length; i<n; i++){
                        node = nodes[i];
                        if(node && node.nodeType == (Node.ELEMENT_NODE || Node.TEXT_NODE)){
                            elem.appendChild(nodes[i]);
                        }
                    }
                }
            }
        });
            
            
        
        $O.define({
            template : function(id){
                return new Template(id);
            }
        });
            
        
    /* ------------------------------------------------------- */
	/*             O-ACTION HANDLER ASSIGNMENT                 */
	/* ------------------------------------------------------- */
        
        $O.compiler( function applyActionHandlers(){
            
            var 
            triggers = document.querySelectorAll('[o-action]'),
            t = triggers.length,
            setHandler = function(elem){
                
                var 
                o_action = elem.getAttribute('o-action'),
                actionObj,
                action,
                event,
                controller,
                method;
                
                try{
                    actionObj = JSON.parse(o_action);
                    event = Object.keys(actionObj)[0];
                    action = actionObj[event];
                }catch(ex){
                    event = 'click';
                    action = o_action;
                }
                
                controller = _octane.controllers[ action.split('.')[0] ];
                method = action.split('.')[1];
                
                octane.handle(event,elem,function(e){
                    try{
                        controller[method].apply(controller);
                    } catch (ex){
                        $O.log(ex);
                    }
                });
            };
            
            while(t--){
                setHandler(triggers[t]);
            }
        });
    
    /* ------------------------------------------------------- */
	/*                          INIT                           */
	/* ------------------------------------------------------- */
        
        $O.define({
                appModel : $O.model('application',{singleton:true}),
                appController : $O.controller('AppController')
            });
        
        $O.define({
            initialize : function initialize (config){
                
                config = _.isObject(config) ? config : {};
                
                // don't reinitialize
                if($O.initialized){
                    return;
                } else {
                    $O.define({
                        initialized : true 
                    });
                }
                
                $O.appModel.set('name',config.appName);
                $O.appController.hook('application.loadingProgress',function($state){
                    var currentProgress = $O.appModel.get('loadingProgress') || 0;
                    $state.loadingProgress = currentProgress + $state.loadingProgress;
                });

                // add debugging support if module included, 
                // pass internal _octane app object as module config
                if(_octane.modules['Debug']){
                    config.Debug = {protected : _octane};
                }
                
                // load modules -> compile -> ready
                return initModules(config).then(function(){
                    return $O.compile();
                }).then(function(){
                    $O.fire('octane:ready');    
                });
            }
        });
        
        window.octane = window.$o = new Octane();
        
	})($,_,__);


    
	/* TODO - octane extension methods */
	// add built in filters
    // add filters/lenses in refresh
	// build modal view and routing
	
	
	
