    /* ------------------------------------------------------- */
	/*                 OCTANE MVC FRAMEWORK                    */
	/* ------------------------------------------------------- */
    
                    // @author Ethan Ferrari
                    // ethanferrari.com/octane
                    // onefiremedia.com
                    // version 0.0.5
                    // January 2015
            
    
	(function($,_,__){
		
       'use strict';
        
        if(!_) { 
            throw new Error('Cannot run Octane. A Lodash (_) compatible utility library is not present. ');
            return false; 
        }
		if(!__) { 
            throw new Error('Cannot run Octane. The doubleUnder (__) utility library not present. ');
            return false; 
        }
		if(window.octane) { 
            throw new Error('Variable "octane" was already defined in global scope. Will be overwritten.');
        }
        
	/* ------------------------------------------------------- */
	// base extension utility constructor
	/* ------------------------------------------------------- */
		
        function OctaneBase(){}
        
        OctaneBase.prototype = {
            extend : function(extension){
               return _.extend(this,extension);
            }
        };
        
        Object.defineProperty(OctaneBase.prototype,'Base',{
            value : OctaneBase,
            writable : false,
            configurable : false
        });
        
		// augment an object with the properties and method of another object
		// overwrites properties by default, set to false to only augment undefined properties
		Object.defineProperty(OctaneBase.prototype,'augment',{
			value: function  (obj,overwrite){
			
						overwrite = _.isBoolean(overwrite) ? overwrite : true;
				        var $this = this;
                        var keys,key,n;
                
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
		Object.defineProperty(OctaneBase.prototype,'define',{
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
									var keys = Object.keys(prop);
                                    var key;
                                    
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
	   //          PUBLIC APPLICATION OBJECT
	   /* ------------------------------------------------------- */
        
        
        var Octane = new OctaneBase();
        Octane.initialized = false;
       
		
	/* ------------------------------------------------------- */
	// internal application object and properties
	/* ------------------------------------------------------- */
		
		var _octane = new OctaneBase();
		_octane.define({
				modules		    : {},
				models		    : {},
                Models          : {},
                Collections     : {},
				views		    : {},
				controllers     : {},
                eventRegister   : {}
		});
        
    /* ------------------------------------------------------- */
	// simple promise implementation
	/* ------------------------------------------------------- */
        
        
        function OctanePromise(fn){
            
            if( !_.isFunction(fn)){
                throw 'OctanePromise expects function as first argument';
            }
            state = 'pending';
            this.result = null;
            this.error = null;
            this.define({
                isResolved : function(){
                    return state == 'resolved';
                },
                isRejected : function(){
                    return state == 'rejected';
                },
                isPending : function(){
                    return state == 'pending';
                },
                resolveCallbacks : [],
                rejectCallbacks : []
            });
            
            var resolve = function(data){
                
                state = 'resolved';
                
                var callbacks = this.resolveCallbacks;
                var n = callbacks.length;
                var i=0;
                
                this.define({ 
                    result : data
                });
                for(;i<n;i++){
                    setTimeout(function(){
                        callbacks[i].call && callbacks[i].call(null,data);
                    },0);
                }
             };
            var reject = function(error){
                
                state = 'rejected';
                this.define({ error : error });
                
                var callbacks = this.rejectCallbacks;
                var n = callbacks.length;
                var i=0;
               
                for(;i<n;i++){
                    setTimeout(function(){
                        callbacks[i].call && callbacks[i].call(null,error);
                    },0);
                }
            }
            
            fn.apply(fn,[resolve.bind(this),reject.bind(this)]);
        }
        OctanePromise.resolve = function(data){
            return new OctanePromise(function(resolve){
                resolve(data);
            });
        }
        OctanePromise.reject = function(err){
            return new OctanePromise(function(resolve,reject){
                reject(err);
            });
        }
        
        OctanePromise.prototype = new OctaneBase;
        OctanePromise.prototype.constructor = OctanePromise;
        OctanePromise.prototype.define({
            then : function(resolve,reject){
            
                _.isFunction(resolve) ||( resolve = function(){} );
                _.isFunction(reject) || ( reject = false );
                
                this.resolveCallbacks.push(resolve);
                reject && this.rejectCallbacks.push(reject);
                
                if(this.isResolved()){
                    return resolve(this.result);
                }
                if(this.isRejected()){
                    reject && reject(this.error);
                    return this;
                }
            }
            
        });

    /* ------------------------------------------------------- */
	/*                     COMPILER AND HOOK                   */
	/* ------------------------------------------------------- */
        
        _octane.compilationTasks = [];
        
        Octane.define({
            compiler : function(task){
                _octane.compilationTasks.push(task);
                return this;
            },
            compile : function(){
                
                var tasksCompleted = [];
                var i=0;
                var n=_octane.compilationTasks.length;
                var callTask = function(task){
                    return new Promise(function(resolve){
                        _.isFunction(task) && task.call();
                        resolve();
                    });    
                };
                
                tasksCompleted = _octane.compilationTasks.map(callTask);
                return Promise.all(tasksCompleted);
            }
        });
	
	/* ------------------------------------------------------- */
	/*                       GUID                              */
	/* ------------------------------------------------------- */		
		
		// set a unique identifier for the DOM element so we don't double count it
		Octane.define({
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
        
        Octane.define({
            log : function(message){
                Octane.hasModule('Debug') && _octane.log(message);
            }
        });
		
        
        function OctaneError(message){
            this.message = message || 'An Octane error occurred.';
            this.stack = Error().stack;
        }
        
        OctaneError.prototype = Object.create(Error.prototype);
        OctaneError.prototype.constructor = OctaneError;
        OctaneError.prototype.name = 'OctaneError';
        
        Octane.define({
             error : function(message){
                 throw new OctaneError(message);
             }
        });
    
    /* ------------------------------------------------------- */
	/*                     XMLHttpRequest                      */
	/* ------------------------------------------------------- */
        
        function uriEncodeObject(source){
            
            source = _.isObject(source) ? source : {};

            var keys = Object.keys(source);
            var n = keys.length;
            var array = [];

            while(n--) {
             array.push(encodeURIComponent(keys[n]) + "=" + encodeURIComponent(source[keys[n]]));
            }

            return array.join("&");
        }
            
            
        function http(url,method,data,headers){
            return new Promise(function(resolve,reject){
                
                var encoded = uriEncodeObject(data);
                var $headers = {
                    'Content-Type':'application/x-www-form-urlencoded'
                    //'Content-Length':encoded.length
                };
                var request;
                var headerKeys;
                var header;
                var value;
                
                _.extend($headers,headers);
                headerKeys = Object.keys($headers);
                
                try{
                    request = new (window.XMLHttpRequest || window.ActiveXObject)("MSXML2.XMLHTTP.3.0");
                } catch(ex){
                    Octane.error('Could not create XMLHttpRequest object');
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
                                reject(Octane.error('The server responded with 400 not found'));
                            },
                            '500' : function(resolve,reject){
                                 reject(Octane.error('An internal server error occurred'));
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
        
        Http.prototype = new OctaneBase();
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
        
        Octane.define({
            http : function(url,headers){
                return new Http(url,headers);
            }
        });
        
        _octane.loadedCache = [];
        
        Octane.define({
            
            getLibrary : function(url){
                return new Promise(function(resolve,reject){
                    
                    var cleanURL = url.replace(/[.\/:]/g,'_');
                    var loaded = document.querySelectorAll('script#'+cleanURL); 
                    var script,content; 
                    
                    if(loaded.length !== 0){
                        // script is loaded
                        Octane.hasLibrary(cleanURL).then(resolve,reject);
                    } else {
                        
                        Octane.handle('script:loaded:'+cleanURL,function(){
                            content = _octane.loadedCache.pop();
                            Octane.addLibrary(cleanURL,content).then(resolve,reject);
                        });
                        Octane.handle('script:failed:'+cleanURL,function(){
                            reject('Script failed to load from '+url);
                        });
                        
                        script = document.createElement('script');
                        script.id = cleanURL;
                        script.src = url;
                        script.onload = function(){
                            Octane.fire('script:loaded:'+cleanURL);
                        };
                        script.onerror = function(){
                            Octane.fire('script:failed:'+cleanURL);
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
                       Octane.log('failed to parse JSON from Octane.jsonp() '+ex.message); 
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
            
            var elem = e.target || e.srcElement;
            var id = elem._guid;
            var handlers = _octane.eventHandlerMap[id] ? _octane.eventHandlerMap[id][e.type] : [];
            var swatch = new __.Switch({
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
           
        Octane.define({
			handle		: 	function(type,$elem,$handler){
                                
                                var types = type ? type.split(' ') : [];
                                var n=types.length;
                                var handler, elem;
                                
                                if(arguments.length == 3){
                                    handler = arguments[2];
                                    elem = arguments[1];
                                } else if (arguments.length == 2){
                                    handler = arguments[1];
                                    elem = window;
                                } else {
									return;
								}
                               
                                function addHandler(type,elem,handler){
                                    
                                    var id = elem._guid || (elem._guid = Octane.GUID());
                                   
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
            drop        :     function(){
                
                                var type,elem,handler;
                                var swatch = new __.Switch({
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
							},
            
            // programatically alert that user data has changed on a data-bound element
            trip : function(elem){

                        var rand = Math.random(),
                            e = __.customEvent('input',{bubbles:true,detail:rand});

                        elem.dispatchEvent && elem.dispatchEvent(e);
                    },
		});
	
        
                    
	
	/* ------------------------------------------------------- */
	/*                       LIBRARIES                         */
	/* ------------------------------------------------------- */	
	
		_octane.libraries = {};
		
        function Library(name,data){
            var $this = this;
            return new Promise(function(resolve,reject){
                if(!_.isObject(data)){
                    reject('invalid library data, not an object');
                } else {
                    var lib = _.isObject(data) ? data : {};
                    $this.name = name;
                    $this.checkout = function(){
                        return lib;
                    };
                    $this.contrib = function(prop,data){
                        if(!lib[prop]){
                            lib[prop] = data;
                        }
                    };
                    resolve(lib);
                }
            });
        }
        
		Octane.define({
			library : function(name,lib){
                if(_.isObject(lib)){
				    return _octane.libraries[name] = new Library(name,lib);
                } else {
                    return Promise.reject('could not create library '+name+'. Data was not an object');
                }
                
			},
            getLib : function(name){
                return Octane.hasLibrary(name).then(function(data){
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
	/*                     COLLECTIONS                         */
	/* ------------------------------------------------------- */
        
        // root factory
        function OctaneCollection(){
            this.models = [];
            this.initialize && this.initialize.apply(this,arguments);
        }
        
        OctaneCollection.prototype = new OctaneBase;
        
        // dummy
        OctaneCollection.prototype.initialize = function(){};
        OctaneCollection.prototype.model = OctaneModel;
        OctaneCollection.prototype.constructor = OctaneCollection;
        OctaneCollection.prototype.define({
            length : function(){
                return this.models.length;
            },
            execute : function(fn){
                
                if(!_.isFunction(fn)) { 
                    Octane.log('Argument passed to OctaneCollection.each must be function');
                    return false; 
                }
                _.forEach(this.models,function(model){
                    var data = model.get();
                    fn.apply(model,[data]);
                });
                
                /*var 
                i = 0,
                n=this.models.length,
                model,
                data;
                
                for(;i<n;i++){
                    model = this.models[i];
                    data = model.get();
                    fn.apply(model,[data]);
               }*/   
            },
            executeR : function(fn){
                
                if(!_.isFunction(fn) ) { 
                    Octane.log('Argument passed to OctaneCollection.reverse must be function');
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
            _template : function(template,target,append){
                
                _.forEach(this.models,function(model){
                    var data = model.get();
                    octane.template(templateID).inject(data).into(target,append);
                });   
            },
            _atIndex : function(index){
                return this.models[index];
            },
            // add new model(s) of Collection's Model type with an array of data objects
            // each model will be named as <Collection.name><Collection.length>
            _add : function(collection){
                
                var models = this.models;
                var Factory = this.model || OctaneModel;
                
                if(Factory){
                    _.forEach(collection,function(record){
                        var model = new Factory(record);
                        models.push( model );
                    });
                }
            },
            /* add a single named model of the Collection's Model type
            _create : function(){
                var Factory = this.model || OctaneModel;
                
                if(Factory){
                    var model = new Factory(arguments);
                    this.models.push(model);
                    return model;
                }
            },*/
            // insert a collection of models,
            // checking that they are saem type as Collection's Model Property
            _insert : function(collection){
               
                var Factory = this.model || OctaneModel;
                var push = this.push;
                
                _.isArray(collection) || (collection = []);
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
            // push a model to the collection
            _push : function(model){
                if( model instanceof this.model ){
                    this.models.push(model);
                } else {
                    Octane.log('could not add model to Collection '+this.name+'. Model must be instance of OctaneModel');
                }
            },   
            _pop : function(){
                return this.models.pop();
            },
            _shift : function(model){
                if(model instanceof this.model){
                    this.models.shift(model);
                }
            },
            _unshift : function(model){
                if(model instanceof this.model){
                    this.models.unshift(model);
                }
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
        
        // add read only _* methods to prototype as writable
        _.forOwn(OctaneCollection.prototype,function(method,methodName){
            if(methodName.indexOf('_') == 0){
                var writable = methodName.split('').slice(1).join('');
                OctaneCollection.prototype[writable] = function(){
                    method.apply(this,arguments);
                }
            }
        });
        
        // lodash Collection methods
        var _collections = ['all','any','at','collect','contains','countBy','detect','each','eachRight','every','filter','find','findLast','findWhere','foldl','foldr','forEach','forEachRight','groupBy','include','includes','indexBy','inject','invoke','map','max','min','partition','pluck','reduce','reduceRight','reject','sample','select','filter','shuffle','size','some','sortBy','sortByAll','where'];
        var _arrays = ['last','pull','unique','take','pullAt','remove'];
        
        // add lodash Collection methods to OctaneCollection
        // from Backbone.js 
        _.forEach(_collections.concat(_arrays),function(method){
            if(!_[method]){ return; }
            OctaneCollection.prototype[method] = function(){
                var args = Array.prototype.slice.call(arguments);
                args.unshift(this.models);
                return _[method].apply(_,args);
            }
        });
            
        Octane.define({
            Collection : OctaneCollection,
            // functional alias of new octane.Collection()
            collection : function (){
                return new OctaneCollection(arguments);
            }
        });
     
    /* ------------------------------------------------------- */
	/*                      VIEW MODEL                        */
	/* ------------------------------------------------------- */		
		
		function ViewModel(){
			this.define({ scope : {} });
            this.parse();
            this.refreshAll();
		}
		
		ViewModel.prototype = new OctaneBase;
		ViewModel.prototype.define({
            // find bound elements on the DOM
			parse	: function(){
						
						var $this = this;
                        var $bindScope = document.querySelectorAll('[o-bind],[o-update]');
                        var n=$bindScope.length;
                
                        while(n--){
                           this.watch($bindScope[n]);
                        }
					},
            // set up a watch on bound elements
			watch : function(elem){
                        
                            var $this = this;
                            var $scope = this.scope;
                            // element hasn't been parsed yet
                            if(!elem._watched){
                                elem._watched = true;
                                if(!elem._guid) elem._guid = Octane.GUID();
                                this._setFilters(elem);
                                this._watchBinds(elem);
                                this._watchUpdates(elem);
                            }
                        },
            _setFilters : function(elem){
                            var filter = elem.getAttribute('o-filter');
                            if(filter){
                                try{
                                    // split the filter between name and argument, if it has one
                                    filter = filter.split(',');
                                    _octane.filterMap[elem._guid] = filter;
                                } catch (ex){
                                    Octane.log(ex);
                                }
                            }
                        },
            _watchBinds : function(elem){
                            
                            var $this = this;
                            var oBind = elem.getAttribute('o-bind');
                            var $scope = this.scope;
                            var deep,l;

                            if(oBind){
                                elem._bind = oBind;

                                Octane
                                .handle('input click select',elem,$this.uptake)
                                .handle('statechange:'+oBind,$this.refresh);

                                deep = oBind.split('.'),
                                l = deep.length;
                                
                                // store reference to element in the ViewModel
                                // with its attr to update and the key to update with 
                                deep.reduce(function(o,x,i){
                                    if(i == (l-1)){
                                        var bindTarget = {
                                            key:oBind,
                                            elem:elem,
                                            attr:'value'
                                        };
                                        if(_.isObject(o[x]) ){
                                            o[x].__binds__.push(bindTarget);
                                        }else{
                                            o[x] = {__binds__ :[bindTarget]};
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
                                    
                                    Octane.handle('statechange:'+watch,$this.refresh.bind($this));
                                     return watch;
                                },'');
                            } // end if o-bind
                        },
            _watchUpdates : function(elem){
                        
                            var _oUpdate = elem.getAttribute('o-update');
                            var $this = this;
                            var $scope = this.scope;
                            var oUpdate;
                            
                            if(_oUpdate){
                                elem._update = oUpdate;
                                oUpdate = {};

                                // not a JSON string, default to updating HTML value
                                if(_oUpdate.length > 0 && _oUpdate.indexOf("{") !== 0){
                                    oUpdate[_oUpdate] = 'html';
                                } else {
                                    try{
                                        oUpdate = _.invert( JSON.parse(_oUpdate) ) || {};
                                    }catch(ex){
                                       Octane.log(ex.message + ' in ViewModel.parse(), element: '+elem );
                                    }
                                }
                                
                                // push element+attr to scope[key] for one-way updates 
                                _.forOwn(oUpdate,function(attr,key){
                                   
                                    var deep = key.split('.');
                                    var l = deep.length;
                                    
                                    // set event handlers for all levels of model change
                                    deep.reduce(function(o,x,i){
                                        var watch;
                                        if(i === 0){
                                            watch = x;
                                        }else{
                                            watch = o+'.'+x;
                                        }
                                        
                                        Octane.handle('statechange:'+watch,$this.refresh.bind($this));
                                         return watch;
                                    },'');
                                   
                                    // store reference to element in the ViewModel
                                    // with its attr to update and the model key to update with 
                                    deep.reduce(function(o,x,i,arr){

                                        if(i == (l-1)){ // last iteration
                                            var updateTarget = {
                                                key:key,
                                                elem:elem,
                                                attr:attr
                                            };
                                            if(_.isObject(o[x]) ){
                                                o[x].__binds__.push(updateTarget);
                                            }else{
                                                o[x] = { __binds__ : [updateTarget] };
                                            }
                                        } else {
                                            return o[x] = _.isObject(o[x]) ? o[x] : {__binds__:[]};
                                        }
                                    },$scope);
                                });
                            }  // end if o-update
            },
            	
			// run event type thru ViewModel scope to update elems/attrs bound to model
			refresh 	: 	function (e){
								
                                // ignore non statechange events
                                if(e.type.split(':')[0] != 'statechange') return;
                
                                // loop bound model datapoint in scope
                                var $update = this._update;
                                var $scope = this.scope;
                                // create array of nested keys, 
                                // ex. "statechange:App.loading.message" becomes ["App","loading","message"]
                                var updated = e.type ? e.type.replace('statechange:','').split('.') : [];
                                var toUpdate = updated.reduce(function(o,x,i){
                                    return _.isObject(o[x]) ? o[x] : {};   
                                },$scope);
								var targets;
                                
                                // recursively get targets
                                targets = this._getUpdateTargets(toUpdate);
                                // remove undefined
                                targets = _.compact(targets);
                                // flatten
                                targets = targets.__concatAll();
                                _.each(targets,function(target){
                                   $update(target.key,target.elem,target.attr);
                                });    
                                       
							},
            // recursively look through the ViewModel for targets to update
             _getUpdateTargets : function(object){
                                
                                var keys = Object.keys(object);
                                var $this = this;
                                    
                                return keys.__map(function(key){
                                    var prop = object[key];
                                    var _prop;

                                    if( _.isPlainObject(prop) ){
                                       if( _prop = $this._getUpdateTargets(prop)[0] ){ // nested object, loop it
                                            return _prop;
                                        }
                                    } else if (_.isArray(prop) ){ // prop = __binds__ = array of targets
                                        return prop; 
                                    }
                                });
                            },
            // perform an update on a single
			_update       : function(key,elem,attr){
                                        
                                var fresh = Octane.get(key);
                                var prop,updater;
                                
								if(__.isNull(fresh) || __.isUndefined(fresh)){
                                    fresh = '';
                                }
                                if(attr.indexOf('.') !== -1){
                                    // update style on element
                                    prop = attr.split('.')[1];

                                    elem.style[prop] = fresh;
                                } else {

                                    updater = new __.Switch({
                                        'html' : function(fresh){
                                            var filter;
                                            if(filter = _octane.filterMap[elem._guid]){
                                                try {
                                                    fresh = _octane.filters[filter[0]].apply(null,[fresh,filter[1]]);
                                                } catch(ex){
                                                    Octane.log(ex);
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
                                                    Octane.log(ex);
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
            // fire statechange on all bound models, thus updating the entire DOM
            // fired once ViewModel at initialization
            // expensive, should be avoided unless absolutely necessary
            refreshAll  : function(){
                            
                                var models = Object.keys(_octane.models);
                                var n = models.length;

                                while(n--){
                                    Octane.fire('statechange:'+models[n]);
                                }
                            },
           
			// respond to user changes to DOM data bound to this model
			uptake		: 	function(event,element){
                                
								var oBind = element._bind;
                                // remove model name from string
                               	var modelName = oBind ? Octane._parseModelName(oBind) : null;
                               	var pointer = oBind ? Octane._parseModelKey(oBind) : null;
                                
                                if(element.value != Octane.get(oBind) ){
                                   Octane.set(oBind,element.value);
                                }				
							},
            // expenive operation to re-parse the DOM and fire statechange on all bound models
            rescope     : function(){
                                this.parse();
                                this.refreshAll();
                            },
            // integrate a Backbone Model into Octane's data binding system
            bind : function(model,become){
                
                // protected via closure
                var isRegistered = false;
                var registeredTo = null;
                
                // save original methods
                model.__legacy__ = {
                    set : model.set,
                    get : model.get,
                    clear : model.clear
                }
                
                // attach to a named model for data-binding
                _.extend(model,{
                    become : function(name){
                        _octane.models[name] && _octane.models[name].detach();
                        _octane.models[name] = this;
                        isRegistered = true;
                        registeredTo = name;
                        Octane.fire('statechange:'+name);
                        return this;
                    },
                    detach : function(){
                        if( isRegistered ){
                            var name = registeredTo;
                            _octane.models[name] = null;
                            isRegistered = false;
                            registeredTo = null;
                            Octane.fire('statechange:'+name);   
                        }
                        return this;
                    },
                    isRegistered : function(){
                        return isRegistered;
                    },
                    registeredTo : function(){
                        return registeredTo;
                    },
                    set : function(){
                        OctaneModel.set.apply(this,arguments);
                    },
                    get : function(){
                        this.state = this.attributes;
                        return OctaneModel.prototype._get.apply(this,arguments);
                    },
                    clear: function(options) {
                        var attrs = {};
                        for (var key in this.attributes) attrs[key] = void 0;
                        return this.set(attrs, _.extend({}, options, {unset: true}));
                    }
                });
                if(become) model.become(become);
                return model;   
            },
            // remove an integrated Backbone Model
            unbind : function(bind){
                var model = _octane.models[bind];
                if(model){
                    if(model.__legacy__){
                        model.set = model.__legacy__.set;
                        model.get = model.__legacy__.get;
                        model.clear = model.__legacy__.clear;
                    }
                    if(model.isRegistered()){
                        model.detach();
                    }
                    // remove all traces of the intregration
                    delete model.attach;
                    delete model.detach;
                    delete model.isRegistered;
                    delete model.registeredTo;
                    delete model.__legacy__;
                    
                    return model;
                }
            }
		});
        
        
	/* ------------------------------------------------------- */
	/*                         MODELS                          */
	/* ------------------------------------------------------- */
	   
        // base Model factory
		function OctaneModel(data,bind){
            
            var isRegistered = false;
            var registeredTo= null;
            
            this.className = this.className || 'OctaneModel';
            this.define({
                guid : 'model_'+Octane.GUID(),
                state : {},
                become : function(name){
                    _octane.models[name] && _octane.models[name].detach();
                    _octane.models[name] = this;
                    isRegistered = true;
                    registeredTo = name;
                    Octane.fire('statechange:'+name);
                    return this;
                },
                detach : function(){
                    if( isRegistered ){
                        var name = registeredTo;
                        _octane.models[name] = null;
                        isRegistered = false;
                        registeredTo = null;
                        Octane.fire('statechange:'+name);   
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
            this.set(data);
            this.initialize && this.initialize.apply(this,arguments);
            if(bind) this.become(bind);
        }
        
        // static methods
        Octane.define.call(OctaneModel,{
            // static factory
            create : function(data,bind){
                return new this(data,bind);
            }, 
            // set method for Backbone models bound with Octane.ViewModel
            // very similar to OctaneModel.prototype._set, begging for a DRY refactor
            set : function(key,val,options){
                    
                    var attrs,attrs,cached,keys,attrKeys;
                    var $this=this;

                    if(__.typeOf(key) == 'object'){
                        attrs = key;
                        options = val;
                    } else {
                        (attrs = {})[key] = val;
                    }

                    _.extend((cached = {}),this.attributes);

                    // run hooks on attrs, which may mutate them or add other properties to attrs
                    if(this.isRegistered()){
                        _.forOwn(attrs,function(value,key){
                            _octane.hooks[$this.registeredTo()+'.'+key] && OctaneModel.prototype._applyHooks.apply($this,[key,attrs]);
                        });
                    }

                    _.forOwn(attrs,function(value,key){
                        var keyArray = key.split('.');
                        var attrKey = keyArray[0];
                        var k = keyArray.length;

                        // run the reducer from OctaneModel._set, but on the cached attrs
                        keyArray.reduce(function(o,x,index){
                            if(index == (k-1)){ // last iteration
                                return o[x] = value;
                            }else{
                                return o[x] = _.isObject(o[x]) ? o[x] : {};
                            }    
                        },cached);

                        if(cached[attrKey] != $this.attributes[attrKey]){
                            // apply model's original set method
                            $this.__legacy__.set.apply($this,[ attrKey,cached[attrKey],options ]);
                            // alert octane listeners
                            if($this.isRegistered()){
                                octane.fire('statechange:'+$this.registeredTo()+'.'+key);
                            }
                        }
                    });

                    return this.attributes;
                }
        }); // end static methods
        
		OctaneModel.prototype = new OctaneBase; 
        // dummies
        OctaneModel.prototype.initialize = function(){};
        OctaneModel.prototype.defaults = {};
        OctaneModel.prototype.constructor = OctaneModel;
		OctaneModel.prototype.define({
            
			_set	: function(){
                        
                        var setObject,keystrings,n,m,key,value;
                        
                        // handle key,value and {key:value}
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
                        
                        // apply any hooks
                        if( this.isRegistered() ){
                            while(n--){
                                _octane.hooks[this.registeredTo()+'.'+keystrings[n]] && this._applyHooks(keystrings[n],setObject);
                            }
                        }
                        
                        // re-measure in case there have been additional properties
                        // added to the setObject via hooks
                        keystrings = Object.keys(setObject);
                        m = keystrings.length;
                
                        // set each key in model state
                        while(m--){
                            key = keystrings[m]
                            value = setObject[key];
                            this._setState(key,value);
                        }
                        // alert any subscribers
                        if( this.isRegistered() ){
                            Octane.fire(this.registeredTo()+':statechange');
                            Octane.fire('statechange:'+this.registeredTo()); // can't remember which is linked to tasks and ViewModel...
                        }

                        return setObject;
                    },
            // use reduce to set a value using a nested key, ex "App.loading.message" would set {App:{loading:{message:value}}}
            _setState : function(keystring,value){
                            
                            var $state = this.state;
                            var keyArray = keystring.split('.');
                            var k = keyArray.length;
                            var modelUpdated;
                            
                            try{
                                keyArray.reduce(function(o,x,index){
                                    if(index == (k-1)){ // last iteration
                                        return o[x] = value;
                                    }else{
                                        return o[x] = _.isPlainObject(o[x]) ? o[x] : {}; // create if object if not already
                                    }    
                                },$state);
                                modelUpdated = true;
                            }catch(e){
                                modelUpdated = false;
                                Octane.log('Unable to set model data "'+keystring+'". Error: '+e);
                            }
                            
                            modelUpdated && this.isRegistered() &&  Octane.fire('statechange:'+this.registeredTo()+'.'+keystring);
                        
                    },
            // helper, applies hooks on changed model state attributes before they get set
            _applyHooks : function(keystring,setObject){
                            
                            if( this.isRegistered() ){
                                var 
                                name = this.registeredTo(),
                                hooks = _octane.hooks[name+'.'+keystring];
                                if(_.isArray(hooks)){
                                    _.each(hooks,function(hook){
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
                
                            _.each(keys,function(key){
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
                
                            var $this = this;
                            var data;

                            if(keystring && _.isString(keystring)){
                               
                                var keyArray = keystring.split('.');
                                var l = keyArray.length;

                                try{
                                    data = keyArray.reduce(function(o,x,i){
                                        return o[x];  
                                    },$this.state);
                                }catch(ex){
                                    data = '';
                                   Octane.log('Unable to get model data "'+keystring+'". Error: '+ex.message);
                                }
                                return data;
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
                                delete this.attributes[prop];
                                this.isRegistered() && Octane.fire('statechange:'+this.registeredTo()+'.'+prop);
                            }
                            // alert any subscribers
                            if( this.isRegistered() ){
                                Octane.fire(this.registeredTo()+':statechange');
                                Octane.fire( 'statechange:'+this.registeredTo() ); // can't remember which is linked to tasks and ViewModel...
                            }
                            return this;
                        },
            reset   : function(defaults){
                            this.clear().set(defaults || this.defaults);
                    }
		});
        // overwritable aliases for extension classes
        OctaneModel.prototype.augment({
            get : function(){
                    return this._get.apply(this,arguments);
            },
            set :  function(){
                    return this._set.apply(this,arguments);
            },
            unset :  function(){
                    return this._unset.apply(this,arguments);
            },
            clear : function(){
                return this._clear();
            },
            destroy : function(){
                this._destroy();
            }
        });
        
        
        
        // prototype chaining Backbone.js style
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
           
            if(config.constructor != Object && _.isFunction(config.constructor)){
               childFactory = config.constructor;
            } else {
                childFactory = function(){ 
                    //parentFactory.prototype.initialize.apply(this,arguments);
                    return parentFactory.apply(this,arguments);
                };
            }
            
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
		
        // a factory for creating constructor functions
        // that can inherit from each other
        // imbued with the static methods define and extend that cannot be overwritten
        var Factory = function(){
            this.initialize.apply(this,arguments);
        };
        Factory.prototype = new OctaneBase;
        Factory.prototype.initialize = function(){};
        Octane.define.apply(Factory,[{
            define : Octane.define
        }]);
        Factory.define('extend',extend);
        
		
        
        Octane.define({
            
            Factory     : Factory,
            Model       : OctaneModel,
            
            
            
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
            // access a bound model's get method from the application object
            get         : function(modelStateKey){
                            
                            var modelName = Octane._parseModelName(modelStateKey);
                            var stateKey = Octane._parseModelKey(modelStateKey);
                            var model = _octane.models[modelName];
                            
                            if(model && stateKey){
                                return model.get(stateKey);
                            } else if(model){
                                return model.get();
                            }
                        },
            // access a bound model's set method from the application object
            set         : function(){
                            
                            var arg0 = arguments[0];
                            var arg1 = arguments[1];
                            var swatch,fresh,keys,i,n;
                            
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
                            n=keys.length;
                            i=0;
                            for(;i<n;i++){
                               doSet( keys[i] );
                            }
                            
                            // helper
                            function doSet(keystring){
                                
                                var modelName = Octane._parseModelName(keystring);
                                var key = Octane._parseModelKey(keystring);
                                var value = fresh[keystring];
                                var model = _octane.models[modelName];
                                
                                model && model.set(key,value);
                            }
                
                        },
            // access a bound model's unset method from the application object
            unset       : function(){
                            
                            
                            var subject = arguments[0];
                            var toUnset, swatch;
                
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
                                
                                var  modelName = Octane._parseModelName(keystring);
                                var key = Octane._parseModelKey(keystring);
                                var model = _octane.models[modelName];
                               
                                model && model.unset(key);
                            });
                        },
            // get the model name from a keystring, ex "App.loading.message" would return "App"
            _parseModelName  : function(bind){
                            try {
                                return bind.split('.')[0];
                            } catch (ex){
                               Octane.error('could not parse model name from '+bind+': '+ex.message);
                                return false;
                            }
                        },
            // get the nested key from a keystring, ex "App.loading.message" would return "loading.message"
            _parseModelKey   : function(o_bind){
                            try{
                                return o_bind.split('.').slice(1).join('.');
                            } catch (ex){
                                Octane.error('could not parse model key from '+o_bind+': '+ex.message);
                                return false;
                            }
                        }
            
		});
        
    /* ------------------------------------------------------- */
    /*                       FILTERS                           */
    /* ------------------------------------------------------- */

        _octane.filters = {};
        _octane.filterMap = {};

        Octane.define({
            filter : function (name,func){
                _octane.filters[name] = func;	
            }
        });
       
        
       /* ------------------------------------------------------- */
	   /*                          TASKS                          */
	   /* ------------------------------------------------------- */
        
        
        // param 1 : a model key to listen for change on
        // add param 2 as function(data held in model[key])
        function task(key,$task){
				               
            var cache ={};
            var keyArray = key.split('.');
            
            keyArray.reduce(function(o,x,i,a){
                var watch;
                if(i === 0){
                    watch = x;
                }else{
                    watch = o+'.'+x;
                }
                Octane.handle('statechange:'+watch,function(e){
                    var currentVal = Octane.get(key);
                    if(currentVal != cache[key]){
                        cache[key] = currentVal;
                        $task(currentVal,key);
                    }
                });
                return watch;
            },'');    
        }
        
        Octane.define({ 
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
         
         Octane.define({ 
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
			this.define({
				name		: name,
                view        : document.querySelector('o-view#'+viewID)
			});
			
			// add this Controller instance to the _octane's controllers object
            _octane.controllers[name] = this;
		}
		
		Controller.prototype = new OctaneBase;
        Controller.prototype.constructor = Controller;

	
		Octane.define({
			controller 	: function (name,viewID){
							if(!name){
								return new Controller(Octane.GUID(),viewID);
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
		
        
        _octane.moduleConfigs = {};
        _octane.moduleExports = {};
        var bootlog = _octane.bootlog = [];
        
		function OctaneModule (name,dependencies){
            this.initialized = false;
            this.name = name;
            this.dependencies = dependencies;
        }
       
        OctaneModule.prototype = new OctaneBase;
        OctaneModule.prototype.initialize = function(){};
        OctaneModule.prototype.constructor = OctaneModule;
        OctaneModule.prototype.define({
            
            import          	:   function(module){
                                    	return _octane.moduleExports[module];
                                },
            export          	:   function(exports){
                                    
                                    _.isObject(_octane.moduleExports[this.name]) || (_octane.moduleExports[this.name] = {});
                                    
                                    try{
                                        _.extend(_octane.moduleExports[this.name],exports);
                                    }catch (ex){
                                        Octane.log('Could not create exports, '+this.name+' module. '+ex.message);
                                    }
                                },
            _initialize         : function(){
                                    
                                    this.dependenciesLoaded = [];
                                    
                                    var $this = this;
                                    var config = _octane.moduleConfigs[this.name] || {};
                                    var message = [
                                        this.name+': initializing...',
                                        this.name+': successfully initialized!',
                                        this.name+': already initialized, continuing...',
                                        this.name+': failed to initialize!'
                                    ]; 
                                    
                                    if(!this.initialized){
                                        return OctaneModule.checkDependencies(this)
                                            .then(function(){
                                            
                                                bootlog.push(message[1]);
                                                $this.initialize(config);
                                                Octane.App.set({
                                                    "loadingProgress" : (Math.ceil(100 / Object.keys(_octane.modules).length))
                                                });
                                                // hook-in for updating a loading screen
                                                Octane.fire('loaded:module',{
                                                    detail:{moduleID: $this.name }
                                                });
                                                $this.initialized = true;
                                                return Promise.resolve($this);
                                            })
                                            .catch(function(err){
                                                bootlog.push(err);
                                                $this.initialized = false;
                                                return Promise.reject(message[3]);
                                            });   
                                    } else {
                                        return Promise.resolve(this);
                                    }
                                },
            checkDependency     :   function (dependency){
                                        
                                        dependency = dependency ? dependency.trim() : '';
                                        
                                        var $this = this;
                                        var dep = _octane.modules[dependency];
                                        var message = [
                                            this.name+': no dependencies, preparing to initialize...',
                                            this.name+': Could not load module, missing module dependency "'+ dependency +'"',
                                            this.name+': dependency "'+ dependency +'" loaded and initialized, continuing...',
                                            this.name+': dependency "'+ dependency +'" not yet loaded, loading now...'
                                        ];
                                       
                                        switch(true){
                                            case (!dependency || dependency.length === 0) : // no dependency
                                                bootlog.push(message[0]);
                                                return Promise.resolve();
                                            case ( !(dep && dep instanceof OctaneModule) ) : // module is not present, fail
                                                bootlog.push(message[1]);
                                                return Promise.reject(message[1]);
                                            case ( dep && dep.initialized) : // module is already loaded, continue
                                                bootlog.push(message[2]);
                                                // remove dependency from list
                                                this.dependenciesLoaded.push(dependency);
                                                _.pull(this.dependencies,name);
                                                return Promise.resolve();
                                            case (!dep.initialized): // module is not loaded, try to load it
                                                bootlog.push(message[3]);
                                                return dep._initialize().then(function(){
                                                    $this.dependenciesLoaded.push(dependency);
                                                    _.pull($this.dependencies,name);
                                                })
                                                .catch(function(err){
                                                    bootlog.push(err);
                                                    Promise.reject(err);
                                                });
                                        } 
                                }
        });
        
        // Static methods
        _.extend(OctaneModule,{
            checkDependencies   : function(module){

                                        var deps = module.dependencies || [];
                                        var n = deps.length;
                                        var results = [];
                                        var message = [
                                            module.name+': checking dependencies...',
                                            module.name+': no dependencies, preparing to initialize...'
                                        ];

                                        bootlog.push(message[0]);

                                        if(n === 0){
                                            bootlog.push(message[1]);
                                            return Promise.resolve();   
                                        } else {
                                            while(n--){
                                                results.push(module.checkDependency(deps[n]));               
                                            }
                                            return Promise.all(results);
                                        }       
                                }
        });
        
        
		
		
		// called at Octane.initialize()
		var initModules = function(initConfig){
			
			_.isPlainObject(initConfig) || (initConfig = {});
            
            _.extend(_octane.moduleConfigs,initConfig);
            
            // load router module first
            return _octane.modules['StartupUtilities']._initialize()
                .then(function(){
                    return _octane.modules['Router']._initialize();
                })
                .then(function(){
                
                    var modules = _octane.modules;
                    var moduleNames = Object.keys(modules);
                    var m = moduleNames.length;
                    var modulesLoaded = [];    
                    var tryLoading = function(moduleName){
                        
                        var initConfig;
                        var moduleConfig;
                        var module = modules[moduleName];
                        
                        if(!module.initialized){
                            bootlog.push(moduleName+': not loaded, loading...');
                            modulesLoaded.push( module._initialize());
                        }
                    };
                    
                    // load each module
                    while(m--){
                        tryLoading( moduleNames[m] );
                    }
                
                    return Promise.all(modulesLoaded);
                })
                .catch(function(err){
                    bootlog.push(err);
                });
		}
		
        
		Octane.define({
            Module      : OctaneModule,
            module     : function(name,dependencies){ 
                            return (_octane.modules[name] = new OctaneModule(name,dependencies) );
                        },
            hasModule : function (name){ 
                            return (_octane.modules[name] && _octane.modules[name].initialized);
                        },
            moduleConfig : function(module,cfg){
                            _.isPlainObject(cfg) && (_octane.moduleConfigs[module] = cfg);
                        }
        });
        
   
        
    /* ------------------------------------------------------- */
	/*                          DOM                            */
	/* ------------------------------------------------------- */
        
        
        
        // global model and controller
        // octane DOM elements
            
        
        Octane.define({ dom : {} });
        
        Octane.define.call(Octane.dom,{
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
            
            _.isString(template) || (template = ''),
            _.isObject(data) || (data = {});
            
            var pattern = /\{\{([^{^}]+)\}\}/g;
            var matches = template.match(pattern);
            
            if(_.isArray(matches)){
                matches.forEach(function(match){
                   
                 	var key = match.replace(/[{}]+/g,'');
                	var regexp = new RegExp("(\\{\\{"+key+"\\}\\})","g");
                   	var keySplit = key.split('.');
               		var l = keySplit.length;
                 	var value = keySplit.reduce(function (prev,curr,index,arr){
                        if(index == (l-1) && _.isObject(prev)){ // last iteration
                           return prev[curr];
                        }
                        if(_.isObject(prev)){ 
                            return prev[curr]; // go one level deeper
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
            
			var tmpls = document.querySelectorAll('script[type="text/octane-template"]');
            var t = tmpls.length;
            var setTemplate = function setTemplate(template){
                if(!_octane.templates[template.id]){
                    _octane.templates[template.id] = template.innerHTML;
                }else{
                    Octane.error('Could not create template '+template.id+'. Already exists');
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
        Template.prototype = new OctaneBase;
        Template.prototype.define({
            
			create : function(content){
                if(_.isString(content)){
                    if(!_octane.templates[this.id]){
                        _octane.templates[this.id] = content;
                    }else{
                        Octane.error('Could not create template '+this.id+'. Already exists');
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
                
                var div = document.createElement('div');
				var firstChild = elem.firstChild;
                var nodes, node;
                
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
        
        Octane.define({
            template : function(id){
                return new Template(id);
            }
        });
            
        
    /* ------------------------------------------------------- */
	/*             O-ACTION HANDLER ASSIGNMENT                 */
	/* ------------------------------------------------------- */
        
        Octane.compiler( function applyActionHandlers(){
            
            var triggers = document.querySelectorAll('[o-action]');
            var t = triggers.length;
            var setHandler = function(elem){
                
                var o_action = elem.getAttribute('o-action');
                var actionObj, action, event, controller, method;
                
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
                
               Octane.handle(event,elem,function(e){
                    try{
                        controller[method].apply(controller);
                    } catch (ex){
                        Octane.log(ex);
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
        
        
        
        Octane.define({
            initialize : function initialize (config){
                
                _.isObject(config) ||(config={});
                
                // don't reinitialize
                if(Octane.initialized){ return }
                else { Octane.define({initialized : true }) }
               
                // parse the DOM initially to create virtual DOM model
                Octane.define({
                    // default application models
                    ViewModel   : new ViewModel(),
                    App         : new OctaneModel().become('App'),
                    uiMessages  : new OctaneModel().become('uiMessages'),
                    uiStyles    : new OctaneModel().become('uiStyles')
                });
                
                Octane.App.set({
                    loadingProgress : 0,
                    name : config.appName
                });
                
                Octane.hook('App.loadingProgress',function($state){
                    var currentProgress = Octane.get('App.loadingProgress') || 0;
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
                    return Octane.compile();
                }).then(function(){
                    Octane.fire('octane:ready');    
                });
            }
        });
        
        window.octane = window.$o = Octane;
        
	})($,_,__);