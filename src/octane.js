    /* ------------------------------------------------------- */
	/*                 OCTANE MVC FRAMEWORK                    */
	/* ------------------------------------------------------- */
    
                    // @author Ethan Ferrari
                    // ethanferrari.com/octane
                    // onefiremedia.com
                    // version 0.0.4
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

                    // .route(id[,ghost])                       : augmented from Router Module
                    // .routeIf(id,condition,onFail)            : augmented from Router Module
                    // .routeThen(id,callback)                  : augmented from Router Module
                    // .parseView()                             : augmented from Router Module
                    // .pushState(params)                       : augmented from Router Module
                    // .currentView()                           : augmented from Router Module

                    // .log()                                   : augmented from debug module (if active)
                    // .getLog()                                : augmented from debug module (if active)
                    // .getEvents()                             : augmented from debug module (if active)
                    // .getModels()                             : augmented from debug module (if active)
                    // .getControllers()                        : augmented from debug module (if active)
                    // .getViews()                              : augmented from debug module (if active)

                    // _proto_ .augment({})
                    // _proto_ .define({property:value,...})

                /* Module methods */

                   

                /* Model methods */

                  


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
        
        Base.prototype.extend = function(extension){
            return _.extend(this,extension);
        }
		
		// augment an object with the properties and method of another object
		// overwrites properties by default, set to false to only augment undefined properties
		Object.defineProperty(Base.prototype,'augment',{
			value: function  (obj,overwrite){
			
						overwrite = _.isBoolean(overwrite) ? overwrite : true;
				        var
                        $this = this,
                        keys,
                        key,
                        n;
                
						if(_.isObject(obj)){
                            keys = Object.keys(obj),
                            n = keys.length;
                            
							while(n--){
                                key = keys[n];
                                if(overwrite){ // do overwrite, bind methods to current object
                                    this[key] = obj[key];
                                }else { // only write undefined properties
                                    if(!(this[key])) {
                                        this[key] = obj[key];
                                        //this[key] = _.isFunction(obj[key]) ? obj[key].bind($this) : obj[key];
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
        }
        
        var $O = Octane.prototype = new Base();
        $O.constructor = Octane;
        $O.initialized = false;
        $O.define({
            base : function(){
                return new Base();
            }
        });
        
        window.octane = window.$o = new Octane();
		
	/* ------------------------------------------------------- */
	// internal application object and properties
	/* ------------------------------------------------------- */
		
		var _octane = new Base();
		_octane.define({
				modules		    : {},
				models		    : {},
                Models          : {},
                Collections     : {},
				views		    : {},
				controllers     : {},
                eventRegister   : {}
		});
        
        
        // simple promise implementation
        function Pact(){}    
        Pact.prototype = new Base();
        Pact.prototype.augment({
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
                tasksCompleted = [],
                i=0,n=_octane.compilationTasks.length,
                callTask = function(task){
                    return new Promise(function(resolve){
                        _.isFunction(task) && task.call();
                        resolve();
                    });    
                };
                
                for(; i<n; i++){
                    tasksCompleted.push(callTask(_octane.compilationTasks[i]));
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
				return random4() +'-'+ random4() +'-'+ random4() + random4();
			}
		});
	
	/* ------------------------------------------------------- */
	/*                   ERRORS & LOGGING                      */
	/* ------------------------------------------------------- */		
		
		_octane.augment({
			logfile    : [],
			log 	   : function(message){
                 _octane.logfile.push(message);
            }
		});
        
        $O.define({
            log : function(message){
                $O.hasModule('Debug') && _octane.log(message);
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
        
        function uriEncodeObject(source){
            
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
                encoded = uriEncodeObject(data),
                $headers = {
                    'Content-Type':'application/x-www-form-urlencoded'
                    //'Content-Length':encoded.length
                },
                request,
                headerKeys,
                header,
                value;
                
                _.extend($headers,headers);
                headerKeys = Object.keys($headers);
                
                try{
                    request = new (window.XMLHttpRequest || window.ActiveXObject)("MSXML2.XMLHTTP.3.0");
                } catch(ex){
                    $O.error('Could not create XMLHttpRequest object');
                }
                
                request.onreadystatechange = function(){
                    if(request.readyState === 4){
                        new __.Switch({
                            '200' : function(resolve){
                                var response;

                                try {
                                    response = JSON.parse(request.responseText);
                                } catch(ex){
                                    response = request.responseText;
                                }
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
                };  
               
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
            
            getLibrary : function(url){
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
        _octane.eventHandler = function(e){
            
            var 
            elem = e.target || e.srcElement,
            id = elem._guid,
            handlers = _octane.eventHandlerMap[id] ? _octane.eventHandlerMap[id][e.type] : [],
            swatch = new __.Switch({
                'function' : function(elem,handler,e){
                   try{
                       handler(e,elem);
                   }catch(ex){/* ignore */}
                },
                'object' : function(elem,handler,e){
                    try{
                        handler.handleEvent(e,elem);
                    }catch(ex){/* ignore */}
                }
            });
            try{
                handlers.__forEach(function(handler){
                    swatch.run(__.typeOf(handler),[elem,handler,e]);
                });
            }catch(ex){/* ignore */}
        };
       
            
        $O.define({
			handle		: 	function(type,$elem,$handler){
                                
                                var 
                                types = type ? type.split(' ') : [],
                                n=types.length,
                                handler,
                                elem;
                                
                                if(arguments.length == 3){
                                    handler = arguments[2];
                                    elem = arguments[1];
                                } else if (arguments.length == 2){
                                    handler = arguments[1];
                                    elem = window;
                                }
                               
                                function addHandler(type,elem,handler){
                                    
                                    var id;
                                    
                                    elem._guid = elem._guid || $O.GUID();
                                    id = elem._guid;
                                   
                                    try{
                                       _octane.eventHandlerMap[id][type].push(handler);
                                    } catch(ex){
                                       try{
                                            _octane.eventHandlerMap[id][type] = [];
                                            _octane.eventHandlerMap[id][type].push(handler);
                                       } catch (ex){
                                            _octane.eventHandlerMap[id] = {};
                                            _octane.eventHandlerMap[id][type] = [];
                                            _octane.eventHandlerMap[id][type].push(handler);
                                       }
                                    } 
                                }
                                
                                while(n--){
                                    addHandler(types[n],elem,handler); 
                                    window.addEventListener(types[n],_octane.eventHandler,false);
                                }
                                return this; // chainable
							},
            drop      : function(){
                
                                var 
                                type,
                                elem,
                                handler,
                                swatch = new __.Switch({
                                    '3' :function(args){
                                        handler = args[2];
                                        elem = args[1];
                                        type = args[0];
                                        try{
                                            _.pull(_octane.eventHandlerMap[elem._guid][type],handler);
                                        }catch(ex){ /* ignore */ }
                                    },
                                    '2' : function(args){
                                        elem = args[1];
                                        type = args[0];
                                        try{
                                            delete _octane.eventHandlerMap[elem._guid][type];
                                        }catch(ex){ /* ignore */ }
                                    },
                                    '1' : function(args){
                                        elem = arguments[0];
                                        try{
                                            delete _octane.eventHandlerMap[elem._guid];
                                        }catch(ex){ /* ignore */ }
                                    }
                                }).run(arguments.length,[arguments]);
                               
                                return this; // chainable
                        },
			fire 		: 	function(type,detail){
								if(_.isString(type)){
									var e = detail ? __.customEvent(type,detail) : __.createEvent(type);
									window.dispatchEvent(e);
								}
							}                           
		});
	
        
                    
	
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
    /*
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
        
    DataStore.prototype = new Base;
        
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
                    }
                    if($store && dbKey){
                        return $store.query(dbKey);
                    }
        },
        rebase : function(storeID,data){
            
                    _octane.dataStores[storeID] && _octane.dataStores[storeID].rebase(data);
        }
    });*/
    /* ------------------------------------------------------- */
	/*                     COLLECTIONS                         */
	/* ------------------------------------------------------- */
        
        // root factory
        function OctaneCollection(){
            this.define({
            	models : [] 
            });
            this.initialize && this.initialize.apply(this,arguments);
        }
        
        OctaneCollection.prototype = new Base;
        
        // dummy
        OctaneCollection.prototype.initialize = function(){};
        OctaneCollection.prototype.model = OctaneModel;
        OctaneCollection.prototype.constructor = OctaneCollection;
        OctaneCollection.prototype.define({
            length : function(){
                return this.models.length;
            },
            fetch : function(){
               // get models from _octane.models where model.classname = this.model 
            },
            each : function(fn){
                
                if(!_.isFunction(fn)) { 
                    $O.log('Argument passed to OctaneCollection.each must be function');
                    return false; 
                }
                var 
                i = 0,
                n=this.models.length,
                model,
                data;
                
                for(;i<n;i++){
                    model = this.models[i];
                    data = model.get();
                    fn.apply(model,[data]);
                }
                _.forEach(this.models,function(model){
                    var data = model.get();
                    fn.apply(model,[data]);
                });
            },
            reverse : function(fn){
                
                if(!_.isFunction(fn) ) { 
                    $O.log('Argument passed to OctaneCollection.reverse must be function');
                    return false; 
                }
                //var
                //n=this.models.length,
                //model,
                //data;
                
                //while(n--){
                _.forEachRight(this.models,function(model){
                    var data = model.get();
                    fn.apply(model,[data]);
                });
                //}
            },
            // add new model(s) of Collection's Model type with an array of data objects
            // each model will be named as <Collection.name><Collection.length>
            _add : function(collection){
                
                var
                i=0,
                n = collection.length,
                l = this.models.length,
                models = this.models,
                Factory = this.model || OctaneModel,
                name = this.name,
                model;
                
                if(Factory){
                    _.forEach(collection,function(record){
                        var model = new Factory(name+l+i);
                        model.set(record);
                        models.push( model );
                    });
                }
            },
            // add a single named model of the Collection's Model type
            _create : function(){
                var Factory = this.model || OctaneModel;
                
                if(Factory){
                    var model = new Factory(arguments);
                    this.models.push(model);
                    return model;
                }
            },
            //insert a collection of models,
            // checking that they are saem type as Collection's Model Property
            _insert : function(collection){
               
                var
                Factory = this.model || OctaneModel,
                push = this.push;
                collection.__forEach(function(model){
                    model instanceof Factory && push(model);
                });
            },
            // get a model from the collection by id
            _get : function(name){
                
                return _.find(this.models,function(model){
                    return model.name == name;
                });
            },    
            // get a model by its index
            _at : function(index){
                return index ? this.models[index] : false;
            },
            // push a model to the collection
            _push : function(model){
                if( model instanceof this.model ){
                    this.models.push(model);
                } else {
                    $O.log('could not add model to Collection '+this.name+'. Model must be instance of OctaneModel');
                }
            },   
            _pop : function(){
                return this.models.pop();
            },
            _pull : function (model){
                return _.pull(this.models,model);
            },
            _remove : function (model){
                _.pull(this.models,model);
            },
            _removeAt : function(index){
                var model = this.models[index];
                _.pull(this.models,index);
            },
            _reset : function(collection){
                var
                currentLength = this.models.length;
                
                this.models.splice(0,currentLength);
                _.isArray(collection) && this.add(collection);
            }
        });
        
        // overwritable aliases
        OctaneCollection.prototype.augment({
            add : function(){
                return this._add.apply(this,arguments);
            },
            create : function(name,defaults){
                return this._create.apply(this,[name,defaults]);
            },
            insert : function(collection){
                return this._insert.apply(this,[collection]);
            },
            reset : function(collection){
                return this._reset.apply(this,[collection]);
            },
            at  : function(index){
                return this._at.apply(this,[index]);
            },
            get : function(name){
                return this._get.apply(this,[name]);
            },
            push : function(model){
                return this._push.apply(this,[model]);
            },
            pull : function(model){
                return this._pull.apply(this,[model]);
            },
            pop : function(){
                return this._pop.apply(this);
            },
            remove : function(model){
                return this._remove.apply(this,[model]);
            },
            removeAt : function(index){
                return this.removeAt.apply(this,[index]);
            }       
        });
            
            
            
        $O.define({
            Collection : OctaneCollection,
            // functional alias of new octane.Collection()
            collection : function (){
                return new OctaneCollection(arguments);
            }
        });
            
        
	/* ------------------------------------------------------- */
	/*                         MODELS                          */
	/* ------------------------------------------------------- */
	   
        // base factory
		function OctaneModel(defaults){
            
            var
            isRegistered = false,
            registeredTo= null;
            
            this.className = this.className || 'OctaneModel';
            this.define({
                guid : 'model_'+$O.GUID(),
                state : {},
                become : function(name){
                    _octane.models[name] && _octane.models[name].detach();
                    _octane.models[name] = this;
                    isRegistered = true;
                    registeredTo = name;
                    $O.fire('statechange:'+name);
                    return this;
                },
                detach : function(){
                    if( isRegistered ){
                        var name = registeredTo;
                        _octane.models[name] = null;
                        isRegistered = false;
                        registeredTo = null;
                        $O.fire('statechange:'+name);   
                    }
                    return this;
                },
                isRegistered : function(){
                    return isRegistered;
                },
                registeredTo : function(){
                    return registeredTo;
                }
            });
            this.set(this.defaults);
            this.set(defaults);
            this.initialize && this.initialize.apply(this,arguments);
        }
        
        // functional factory
        OctaneModel.create = function(data){
            return new OctaneModel(data);
        };
       
        // dummies
        OctaneModel.prototype.initialize = function(){};
        OctaneModel.prototype.defaults = {};
        
        // OctaneModel prototype methods
		OctaneModel.prototype = new Base;
        OctaneModel.prototype.constructor = OctaneModel;
		OctaneModel.prototype.define({
            
			_set	: function(){
                        
                        var 
                        setObject,
                        keystrings,
                        i,n,j,m;

                        if(_.isString(arguments[0])){
                            setObject = {};
                            setObject[arguments[0]] = arguments[1];
                        } else if(_.isObject(arguments[0])){
                            setObject = arguments[0];
                        } else {
                            return {};
                        }

                        // array for state properties changed
                        keystrings = Object.keys(setObject);
                        n = keystrings.length;
                        i=0;
                        
                        // apply the hooks
                        if( this.isRegistered() ){
                            while(n--){
                                _octane.hooks[this.registeredTo()+'.'+keystrings[n]] && this._applyHooks(keystrings[n],setObject);
                            }
                        }
                        
                        // re-measure in case there have been additional properties
                        // added to the setObject via hooks
                        keystrings = Object.keys(setObject);
                        j=0;m = keystrings.length;
                
                        // set each key in model state
                        for(;j<m;j++){
                            this._setKey(keystrings[j],setObject);
                        }
                        // alert any subscribers
                        if( this.isRegistered() ){
                            $O.fire(this.registeredTo()+':statechange');
                            $O.fire('statechange:'+this.registeredTo()); // can't remember which is linked to tasks and ViewModel...
                        }

                        return setObject;
                    },
            _setKey : function(keystring,setObject){
                            var
                            $state = this.state,
                            keyArray = keystring.split('.'),
                            value = setObject[keystring],
                            k = keyArray.length,
                            modelUpdated;
                            
                            try{
                                keyArray.reduce(function(o,x,index){
                                    if(index == (k-1)){ // last iteration
                                        return o[x] = value;
                                    }else{
                                        return o[x] = _.isObject(o[x]) ? o[x] : {};
                                    }    
                                },$state);
                                modelUpdated = true;
                            }catch(e){
                                modelUpdated = false;
                                $O.log('Unable to set model data "'+keystring+'". Error: '+e);
                            }
                            
                            this.isRegistered() &&  $O.fire('statechange:'+this.registeredTo()+'.'+keystring);
                        
                    }, 
            _applyHooks : function(keystring,setObject){
                            
                            if( this.isRegistered() ){
                                var 
                                name = this.registeredTo(),
                                hooks = _octane.hooks[name+'.'+keystring];
                                if(_.isArray(hooks)){
                                    hooks.__forEach(function(hook){
                                        _.extend( setObject,hook(setObject));
                                    });
                                }
                            }
                    },
            _unset : function(){
                
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
            _destroy:   function(){
                            
                            var 
                            keys = Object.keys(this.state),
                            n = keys.length;
                
                            while(n--){
                                delete this.state[keys[n]];
                            }
                            if( this.isRegistered()){
                                this.detach();
                            }
                        },               
			_get	: 	function(keystring){
                
                            var
                            $this = this,
                            stateData;

                            if(keystring && _.isString(keystring)){
                                var 
                                keyArray = keystring.split('.'),
                                l = keyArray.length;

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
            _clear : function(){
                            var 
                            stateProps = Object.keys(this.state),
                            n=stateProps.length,
                            prop;
                            
                            while(n--){
                                prop = stateProps[n];
                                delete this.state[prop];
                                this.isRegistered() && $O.fire('statechange:'+this.registeredTo()+'.'+prop);
                            }
                            // alert any subscribers
                            if( this.isRegistered() ){
                                $O.fire(this.registeredTo()+':statechange');
                                $O.fire( 'statechange:'+this.registeredTo() ); // can't remember which is linked to tasks and ViewModel...
                            }
                            return this;
                        },
            reset   : function(defaults){
                            this.clear().set(defaults || this.defaults);
                    }
		});
        
        OctaneModel.prototype.augment({
            // writeable aliases
            get : function(keystring){
                    return this._get(keystring);
            },
            set :  function(){
                    return this._set.apply(this,arguments);
            },
            unset :  function(keystring){
                    return this._unset(keystring);
            },
            clear : function(){
                return this._clear();
            },
            destroy : function(){
                this._destroy();
            }
        });
        
        // prototype chaining 
        var extend = function(){
            
            var className,config,staticMethods,parentFactory,parentDefaults,childFactory,Factory;
            
            if(__.typeOf(arguments[0]) == 'string'){
                className = arguments[0];
                config = _.isPlainObject(arguments[1]) ? arguments[1] : {};
                staticMethods = _.isPlainObject(arguments[2]) ? arguments[2] : {};
            }else{
                config = _.isPlainObject(arguments[0]) ? arguments[0] : {};
                staticMethods = _.isPlainObject(arguments[1]) ? arguments[1] : {};
            }
             
            parentFactory = this;
            parentDefaults = parentFactory.prototype.defaults || {};
           
            childFactory = function(){ return parentFactory.apply(this,arguments);};
            
            _.extend(childFactory,parentFactory,staticMethods);
            
            Factory = function(){ this.constructor = childFactory; };
            Factory.prototype = parentFactory.prototype;
            childFactory.prototype = new Factory;
            
            
            childFactory.prototype.defaults = {};
            childFactory.prototype.className = className || 'OctaneModel';
            _.extend(childFactory.prototype, config);
            _.extend(childFactory.prototype.defaults, parentDefaults, config.defaults);
            
            return childFactory;
        }
        
        OctaneModel.extend = OctaneCollection.extend = extend;
		
		$O.define({
            Model       : OctaneModel,
            
            App         : new OctaneModel().become('App'),
            
            uiMessages  : new OctaneModel().become('uiMessages'),
            uiStyles    : new OctaneModel().become('uiStyles'),
            // functional alias for calling new octane.Model()
            // returns a named model if it already exists
			model 		: function (name){
                            var model;
                            if(_octane.models[name]){
                                model = _octane.models[name];
                            } else {
                                model = new OctaneModel().become(name);
                            }
                            return model;       
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
                                'object' : function(arg0){
                                    fresh = arg0;
                                },
                                'default' : function(){
                                    fresh = {};
                                }
                            }).run(__.typeOf(arg0),[arg0,arg1]);
                            
                           
                            keys = Object.keys(fresh);
                            var i=0,n=keys.length;
                            for(;i<n;i++){
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
    /*                       FILTERS                           */
    /* ------------------------------------------------------- */

        _octane.filters = {};
        _octane.filterMap = {};

        $O.define({
            filter : function (name,func){

                _octane.filters[name] = func;	
            }
        });
        
    /* ------------------------------------------------------- */
	/*                      VIEW MODEL                        */
	/* ------------------------------------------------------- */		
		
		function ViewModel(){
            
			this.define({
				scope : {},
			});
		}
		
		
	/*  prototype ViewModel */
	
		ViewModel.prototype = new Base();
		ViewModel.prototype.define({
            
            init : function(){
                        this.parse();
                        this.refreshAll();
                    },            
			watch : function(elem){
                        var
                        $this = this,
                        $sender = this.uptake,
                        filter = elem.getAttribute('o-filter'),
                        $scope = this.scope;
                        // element hasn't been parsed yet
                        if(!elem._watched){
                            
                            elem._watched = true;
                            if(!elem._guid) { elem._guid = $O.GUID(); }
                            if(filter){
                                try{
                                    filter = filter.split(',');
                                    _octane.filterMap[elem._guid] = filter;
                                } catch (ex){
                                    $O.log(ex);
                                }
                            }
                            
                            var 
                            oBind = elem.getAttribute('o-bind'),
                            _oUpdate = elem.getAttribute('o-update'),
                            oUpdate, 
                            deep,
                            l;

                            if(oBind){
                                elem._bind = oBind;

                                $O
                                .handle('input click select',elem,$this.uptake)
                                .handle('statechange:'+oBind,$this.refresh);

                                deep = oBind.split('.'),
                                l = deep.length;
                                
                                // store reference to element in the ViewModel
                                // with its attr to update and the key to update with 
                                deep.reduce(function(o,x,i){
                                    if(i == (l-1)){
                                        var z = {
                                            key:oBind,
                                            elem:elem,
                                            attr:'value'
                                        };
                                        if(_.isObject(o[x]) ){
                                            o[x].__binds__.push(z);
                                        }else{
                                            o[x] = {__binds__ :[z]};
                                        }
                                    } else {   
                                        return o[x] = _.isObject(o[x]) ? o[x] : {__binds__ :[]};
                                    }
                                },$scope);
                               
                                // set event handlers for all levels of model change
                                deep.reduce(function(o,x,i){
                                   var watch;
                                    if(i === 0){
                                        watch = x;
                                    }else{
                                        watch = o+'.'+x;
                                    }
                                    
                                    $O.handle('statechange:'+watch,$this.refresh.bind($this));
                                     return watch;
                                },'');
                            } // end if o-bind

                            if(_oUpdate){
                                elem._update = oUpdate;
                                oUpdate = {};

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
                                
                                // push element+attr to scope[key] for one-way updates 
                                _.forOwn(oUpdate,function(attr,key){
                                   
                                    var 
                                    deep = key.split('.'),
                                    l = deep.length;
                                    
                                    // set event handlers for all levels of model change
                                    deep.reduce(function(o,x,i){
                                        var watch;
                                        if(i === 0){
                                            watch = x;
                                        }else{
                                            watch = o+'.'+x;
                                        }
                                        
                                        $O.handle('statechange:'+watch,$this.refresh.bind($this));
                                         return watch;
                                    },'');
                                   
                                    // store reference to element in the ViewModel
                                    // with its attr to update and the key to update with 
                                    deep.reduce(function(o,x,i,arr){

                                        if(i == (l-1)){ // last iteration
                                            var z = {
                                                key:key,
                                                elem:elem,
                                                attr:attr
                                            };
                                            if(_.isObject(o[x]) ){
                                                o[x].__binds__.push(z);
                                            }else{
                                                o[x] = { __binds__ : [z] };
                                            }
                                        } else {
                                            return o[x] = _.isObject(o[x]) ? o[x] : {__binds__:[]};
                                        }
                                    },$scope);
                                });
                            }  // end if o-update
                        } // end if !elem._guid
            },
            // find bound elements on the DOM
			parse	: function(){
						
						var
                        $this = this,
                        $bindScope = document.querySelectorAll('[o-bind],[o-update]'),
                        n=$bindScope.length;
                
                        while(n--){
                           this.watch($bindScope[n]);
                        }
					},		
			// run event type thru ViewModel scope to update elems
			refresh 	: 	function (e){
								
                                // loop bound model datapoint in scope
                                var
                                $update = this.update,
                                $scope = this.scope,
                                toUpdate,
                                updated = e.type ? e.type.replace('statechange:','').split('.') : [],
                                l= updated.length,
                                toRecurse = updated.reduce(function(o,x,i){
                                    return _.isObject(o[x]) ? o[x] : {};   
                                },$scope);
                                
                                toUpdate = ViewModel.prototype.updateRecursively(toRecurse);
                                toUpdate = _.compact(toUpdate);
                                toUpdate = toUpdate.__concatAll();
                                toUpdate.__forEach(function(group){
                                   $update(group.key,group.elem,group.attr);
                                });    
                                       
							},
            refreshAll  : function(){
                            
                                var 
                                models = Object.keys(_octane.models),
                                n = models.length;

                                while(n--){
                                    $O.fire('statechange:'+models[n]);
                                }
                            },
            updateRecursively : function(object){
                                
                                var
                                keys = Object.keys(object);
                                    
                                return keys.__map(function(key){
                                    var 
                                    prop = object[key],
                                    _prop;

                                    if( _.isPlainObject(prop) ){
                                       if( _prop = ViewModel.prototype.updateRecursively(prop)[0] ){ // nested 
                                            return _prop;
                                        }
                                    } else if (_.isArray(prop) ){ // __binds__
                                        return prop; 
                                    }
                                });
                            },
			update       : function(key,elem,attr){
                                        
                                var fresh = $O.get(key);
                                if(__.isNull(fresh) || __.isUndefined(fresh)){
                                    fresh = '';
                                }
                                if(attr.indexOf('.') !== -1){
                                    // update style on element
                                    var 
                                    prop = attr.split('.')[1];

                                    elem.style[prop] = fresh;
                                } else {

                                    var updater = new __.Switch({
                                        'html' : function(fresh){
                                            var filter;
                                            if(filter = _octane.filterMap[elem._guid]){
                                                try {
                                                    fresh = _octane.filters[filter[0]].apply(null,[fresh,filter[1]]);
                                                } catch(ex){
                                                    $O.log(ex);
                                                }
                                            }
                                            elem.innerHTML = fresh;
                                        },
                                        'text' : function(fresh){
                                            var filter;
                                            if(filter = _octane.filterMap[elem._guid]){
                                                try {
                                                    fresh = _octane.filters[filter[0]].apply(null,[fresh,filter[1]]);
                                                } catch(ex){
                                                    $O.log(ex);
                                                }
                                            }
                                            elem.textContent = fresh;
                                        },
                                        'value' : function(fresh){
                                            elem.value = fresh;
                                        },
                                        'default' : function(fresh,attr){
                                            elem.setAttribute(attr,fresh);
                                        }
                                    }).run(attr,[fresh,attr]);
                                }
                            },
			// respond to user changes to DOM data bound to this model
			uptake		: 	function(event,element){
                                var 
                                oBind = element._bind,
                                // remove model name from string
                                modelName = oBind ? $O._parseModelName(oBind) : null,
                                pointer = oBind ? $O._parseModelKey(oBind) : null;
                                
                                if(element.value != $O.get(oBind) ){
                                   $O.set(oBind,element.value);
                                }				
							}
		});
        
        _octane.ViewModel = new ViewModel();
        
        $O.define({
            rescope : function(){
                _octane.ViewModel.parse();
                _octane.ViewModel.refreshAll();
            }    
        });
        
        
        
       /* ------------------------------------------------------- */
	   /*                          TASKS                          */
	   /* ------------------------------------------------------- */
        
        
        // param 1 : a model key to listen for change on
        // add param 2 as function(data held in model[key])
        function task(key,$task){
				               
            var
            cache ={},
            keyArray = key.split('.');
            
            keyArray.reduce(function(o,x,i,a){
                var watch;
                if(i === 0){
                    watch = x;
                }else{
                    watch = o+'.'+x;
                }
                $O.handle('statechange:'+watch,function(e){
                    var currentVal = $O.get(key);
                    if(currentVal != cache[key]){
                        cache[key] = currentVal;
                        $task(currentVal,key);
                    }
                });
                return watch;
            },'');    
        }
        
        $O.define({ 
            task : function(key,$task){
                task(key,$task);
                return this;
            }
        });
                                
        
    /* ------------------------------------------------------- */
	/*                          HOOKS                          */
	/* ------------------------------------------------------- */
	   
        _octane.hooks = {};
        
        // a function to be applied before the setting of data in the model
        // if one model data value changes depending on another, a hook is the place for that logic
        // key is the incoming data key to parse for, func is the function to apply
         
         $O.define({ 
             hook : function hook(oBind,func){

                try{
                    _octane.hooks[oBind].push(func);
                } catch(ex){
                    _octane.hooks[oBind] = [];
                    _octane.hooks[oBind].push(func);
                }

                return this; // chainable	
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
                view        : document.querySelector('o-view#'+viewID)
			});
			
			// add this Controller instance to the _octane's controllers object
            _octane.controllers[name] = $this;
		}
		
	/* prototype Controller */
		
		Controller.prototype = new Base();
        Controller.prototype.constructor = Controller;

	
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
			this.augment(cfg);
		}
        
		Module.prototype = new Base();
        Module.prototype.constructor=Module;
        Module.prototype.define({
             import           :   function(module){
                                    return _octane.moduleExports[module];
                                },
             export          :   function(exports){
                                    if(!_.isObject(_octane.moduleExports[this.name])){
                                        _octane.moduleExports[this.name] = {};
                                    }
                                    try{
                                        _.extend(_octane.moduleExports[this.name],exports);
                                    }catch (ex){
                                        $O.error('Could not create augment exports, '+this.name+' module. '+ex.message);
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
                                    delete window.octane[this.name];
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

                                        Object.defineProperty(window.octane,$this.name, {
                                            value :$this,
                                            writatble : false,
                                            configurable : false
                                        });
                                        
                                        try{
                                            this.initialize && this.initialize();
                                        }catch(ex){
                                            $O.log(ex);
                                        }
                                        
                                        bootLog(message[1]);
                                        $O.App.set({
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
                    m=moduleKeys.length,
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
                            module.cfg = _.extend(moduleConfig,initConfig);
                            modulesLoaded.push( module._load() );
                        }
                    };
                    
                    // load each module
                    while(m--){
                        moduleName = moduleKeys[m];
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
            modalContainer : function(){
                return document.getElementsByTagName('o-modal-container')[0] || document.createElement('o-modal-container');
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
                    
                    value = keySplit.reduce(function (prev,curr,index,arr){
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
            get : function(){
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
                
                var i=0,n=nodes.length;
                if(prepend){
                     for(;i<n;i++){
                        node = nodes[i];
                        if(node && node.nodeType == (Node.ELEMENT_NODE || Node.TEXT_NODE)){
                            elem.insertBefore(node,firstChild);
                        }
                    }
                } else {
                    for(;i<n;i++){
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
                
               $O.handle(event,elem,function(e){
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
               
                // parse the DOM initially to create virtual DOM model
                _octane.ViewModel.init();
                
                $O.App.set({
                    loadingProgess : 0,
                    name : config.appName
                });
                
                $O.hook('App.loadingProgress',function($state){
                    var currentProgress = $O.get('App.loadingProgress') || 0;
                    $state.loadingProgress = currentProgress + $state.loadingProgress;
                    return $state;
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
        
        
        
	})($,_,__);


    
	/* TODO - octane extension methods */
	// add built in filters
    // add filters/lenses in refresh
	// build modal view and routing
	
	
	
