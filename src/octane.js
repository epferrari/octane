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
	/*                         BASE                            */
	/* ------------------------------------------------------- */










        function OctaneBase(){}




        OctaneBase.prototype = {
            extend : function(extension){
               return _.extend(this,extension);
            }
        };




        Object.defineProperty(OctaneBase.prototype,'Base',{
            value : function(){
                return new OctaneBase();
            },
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
		Object.defineProperty(OctaneBase.prototype,'engrave',{
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

    // quick method to define immutable properties
		Object.defineProperty(OctaneBase.prototype,'defineProp',{
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

        Object.defineProperty(OctaneBase.prototype,'defineGetter',{
            value : function(name,getter){
               Object.defineProperty(this,name,{
                   get: getter,
                   configurable : false
               })
            },
            writable: false,
            configurable : false
        });

        Object.defineProperty(OctaneBase.prototype,'defineSetter',{
            value : function(name,setter){
               Object.defineProperty(this,name,{
                   set: setter,
                   configurable : false
               })
            },
            writable: false,
            configurable : false
        });

				Object.defineProperty(OctaneBase.prototype,'accessors',{
						value : function(name,pair){
							Object.defineProperty(this,name,{
								get : pair.get,
								set : pair.set,
								configurable: false
							})
						},
						writable: false,
						configurable: false
				})


    /* ------------------------------------------------------- */
    /*        PUBLIC & PRIVATE APPLICATION OBJECTS             */
    /* ------------------------------------------------------- */










        var _octane = new OctaneBase();
        var Octane = new OctaneBase();
        Octane.initialized = false;










    /* ------------------------------------------------------- */
	/*                       GUID                              */
	/* ------------------------------------------------------- */










		// set a unique identifier for the DOM element so we don't double count it
		Octane.defineProp({
			GUID     : function(){
                        var random4 = function() {
                            return (((1 + Math.random()) * 0x10000)|0).toString(16).substring(1).toUpperCase();
                        };
                        return random4() +'-'+ random4() +'-'+ random4() + random4();
                    }
		});










    /* ------------------------------------------------------- */
	/*       COMPILER, ORDINANCES, AND DESIGNATE HOOK          */
	/* ------------------------------------------------------- */










        var Compiler = {

            ordinances : {},

            designate : function(selector,task){

                task._compilerId || (task._compilerId = Octane.GUID());

                var ords = this.ordinances;
                ( ords[selector] || (ords[selector] = []) ).push(task);
            },

            applyOrdinance : function(context,selector){

                if(!selector){
                    selector = context;
                    context = document;
                }
                var tasks = this.ordinances[selector];

                return new Promise(function(resolve,reject){
                    _.each(context.querySelectorAll(selector),function(elem){
                        _.each(tasks,function(task){

                            var taskId = task._compilerId;
                            var ordValue; // the value of a selector's attribute, ex o-sync="ordValue"

                            // set hash so we don't re-apply a task
                            elem._compiled || (elem._compiled = {});
                            if(!elem._compiled[taskId]){

                                // pass the value of the ordinance to the task
                                // *if the ordinance is an attribute, selected by wrapped []
                                var ord = selector.match(/\[(.*)\]/);
                                _.isArray(ord) && (ord = ord[1]);
                                ordValue = elem.getAttribute(ord);

                                try{
                                    // run the task
                                    task(elem,ordValue);
                                    // set hashed taskId to true so it doesn't re-run on the same element
                                    elem._compiled[taskId] = true;
                                } catch (ex){
                                    Octane.log(ex);
                                }
                            }
                        });
                    });
                    resolve();
                });

            },
            run : function(context){

                context || (context = document);

                var $this = this;
                var tasksCompleted = (Object.keys(this.ordinances)).map(function(selector){
                    return $this.applyOrdinance(context,selector);
                });

                return Promise.all(tasksCompleted);
            }
        };




        Octane.defineProp({

            compiler : function(selector,task){
                        Compiler.designate.apply(Compiler,[selector,task]);
                        return Octane;
                    },

            // alias of .compiler
            designate : function(selector,task){
                        Compiler.designate.apply(Compiler,[selector,task]);
                        return Octane;
                    },

            recompile : Compiler.run.bind(Compiler)
        });










    /* ------------------------------------------------------- */
	/*                        PROMISES                         */
	/* ------------------------------------------------------- */










        function OctanePromise(fn){

            if( !_.isFunction(fn)){
                throw 'OctanePromise expects function as first argument';
            }
            state = 'pending';
            this.result = null;
            this.error = null;
            this.engrave({
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

                this.engrave({
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
                this.engrave({ error : error });

                var callbacks = this.rejectCallbacks;
                var n = callbacks.length;
                var i=0;

                for(;i<n;i++){
                    setTimeout(function(){
                        callbacks[i].call && callbacks[i].call(null,error);
                    },0);
                }
            };

            fn.apply(fn,[resolve.bind(this),reject.bind(this)]);
        }




        OctanePromise.resolve = function(data){
            return new OctanePromise(function(resolve){
                resolve(data);
            });
        };




        OctanePromise.reject = function(err){
            return new OctanePromise(function(resolve,reject){
                reject(err);
            });
        };




        OctanePromise.prototype = new OctaneBase;
        OctanePromise.prototype.constructor = OctanePromise;
        OctanePromise.prototype.engrave({
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




        Octane.defineProp({
            promisify : function(deferred){
                var args = Array.prototype.slice.call(arguments,1);
                return new Promise(function(resolve,reject){
                    deferred.apply(deferred,args).then(resolve,reject);
                });
	       }
        });










	/* ------------------------------------------------------- */
	/*                   ERRORS & LOGGING                      */
	/* ------------------------------------------------------- */










		  _octane.logfile = [];
        _octane.log 	= function(itm){
             _octane.logfile.push(itm);
        };




        function OctaneError(message){
            this.message = message || 'An Octane error occurred.';
            this.stack = Error().stack;
        }




        OctaneError.prototype = Object.create(Error.prototype);
        OctaneError.prototype.constructor = OctaneError;
        OctaneError.prototype.name = 'OctaneError';




        Octane.defineProp({

            log         : function(message,error){

									if(!Octane.hasModule('Debug')) return; // not in development, do not log

									if(arguments.length === 1 && _.isObject(message)){
										error = message;
										message = 'No additional context provided';
									}
                           _octane.log([message,(error||{})]);
                        },

            error       : function(message){
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




        Http.prototype = new OctaneBase;
        Http.prototype.engrave({

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




        _octane.loadedCache = [];




        Octane.defineProp({
            http        : function(url,headers){
                            return new Http(url,headers);
                        },
            getLibrary  : function(url){
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
            jsonp       : function(json){
                            if(_.isString(json)){
                                try{
                                    json = JSON.parse(json);
                                }catch(ex){
                                   Octane.log('Failed to parse JSON from Octane.jsonp()',ex);
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

        _octane.addHandler = function (type,elem,handler){

            var id = elem._guid || (elem._guid = Octane.GUID());
            var map = this.eventHandlerMap;
            try{
                map[id][type].push(handler);
            } catch(ex){
               try{
                    map[id][type] = [];
                    map[id][type].push(handler);
               } catch (ex){
                    map[id] = {};
                    map[id][type] = [];
                    map[id][type].push(handler);
               }
            }
        };




        Octane.defineProp({

            handle		: function(type,$elem,$handler){

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

                            while(n--){
                                _octane.addHandler(types[n],elem,handler);
                                window.addEventListener(types[n],_octane.eventHandler,false);
                            }
                            return this; // chainable
                        },

            unhandle     : function(){

                            var type,elem,handler;
                            var swatch = new __.Switch({

									// targeted removal of a single event handler from an object
										'3' :function(args){

												handler = args[2];
                                    elem = args[1];
                                    type = args[0];
                                    try{
                                        _.pull(_octane.eventHandlerMap[elem._guid][type],handler);
                                    }catch(ex){ /* ignore */ }
                                },

									// remove all handlers for a single event type from an object
                                '2' : function(args){

												elem = args[1];
                                    type = args[0];
                                    try{
                                        _octane.eventHandlerMap[elem._guid][type] = null;
                                    }catch(ex){ /* ignore */ }
                                },


                                '1' : function(args){

												var arg = args[0];
												switch( true ){

												// remove all event handlers of a type from the global scope
													case (__.typeOf(arg) == 'string'):
														(function(){
															_octane.eventHandlerMap[window._guid][arg] = null;
														})();
														break;

												// remove all event handlers from an object
													case (arg._guid):
														(function(){
															_octane.eventHandlerMap[arg._guid] = null;
														})();
														break;
												}
                                }
                            }).run(arguments.length,[arguments]);

                            return this; // chainable
                        },

            fire 		: function(type,detail){

                            if(_.isString(type)){
									var e = detail ? __.customEvent(type,detail) : __.createEvent(type);
									window.dispatchEvent(e);
								}
							},

            // programatically alert that user data has changed on a data-bound element
            trip        : function(elem){

                            var rand = Math.random(),
                                e = __.customEvent('input',{bubbles:true,detail:rand});

                            elem.dispatchEvent && elem.dispatchEvent(e);
                        },
		});










	/* ------------------------------------------------------- */
	/*                       LIBRARIES                         */
	/* ------------------------------------------------------- */










		_octane.dicts = {};

    Octane.defineProp({

        Dictionary : {

          create : function(name,data){

            if(_.isObject(data) && !_octane.dicts[name]){
              _octane.dicts[name] = data;
              octane.fire('created:dictionary:'+name);
              return Octane;
            } else {
              Octane.error('could not create dictionary '+name+'.')
            }
          },

          get   : function(name){
              return new Promise(function(resolve){
                var dict = _octane.dicts[name];

                if(dict){
                    resolve(dict)
                } else {
                  octane.handle('created:dictionary:'+name, function(e){
                      resolve(_octane.dicts[name]);
                  });
                }
            });
          }
        }
    });










  /* ------------------------------------------------------- */
	/*                      VIEW MODEL                        */
	/* ------------------------------------------------------- */










		function ViewModel(){
			this.engrave({ scope : {} });
            this.parse();
            this.refreshAll();
		}




		ViewModel.prototype = new OctaneBase;
		ViewModel.prototype.engrave({

            // find bound elements on the DOM
			parse        : function(scope){

                            scope || (scope = document);
                            var $this = this;
                            this.bindScope = scope.querySelectorAll('[o-bind],[o-update]');
                            var n = this.bindScope.length;

                            while(n--){
                               this.watch(this.bindScope[n]);
                            }
                        },

            // set up a watch on bound elements
			watch        : function(elem){

                            var $this = this;
                            var $scope = this.scope;
                            // element hasn't been parsed yet
                            if(!elem._watched){
                                elem._watched = true;
                                if(!elem._guid) elem._guid = Octane.GUID();
                                //this._setFilters(elem);
                                this._watchBinds(elem);
                                this._watchUpdates(elem);
                                //this._watchSyncs(elem);
                            }
                        },

            /*_watchSyncs : function(elem){

                            var nested = elem.querySelectorAll('[o-sync]');
                            var model = elem.getAttribute('o-sync');
                            var template = new Octane.Template(elem);
                            elem.innerHTML = '';
                            template.save();
                            elem.innerHTML = '';

                            Octane.handle('statechange:'+model,function(e){
                                var model = elem.getAttribute('o-sync');
                                var data = Octane.ViewModel.get(model).get();
                                Octane.Template.get(elem._guid).set(data).renderTo(elem);
                            });
                        },*/

            /*_setFilters : function(elem){
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
                        },*/

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

                                if(elem.type == 'file'){
                                    Octane.handle('change',elem,$this.uptake);
                                }

                                deep = oBind.split('.'),
                                l = deep.length;

                                // set event handlers for all levels of model change
                                deep.reduce(function(o,x,i){
                                   var watch;
                                    if(i === 0){
                                        watch = x;
                                    }else{
                                        watch = o+'.'+x;
                                    }

                                    //edit
                                    _.isArray($scope[watch]) || ($scope[watch] = []);
                                    $scope[watch].push({
                                        key:oBind,
                                        elem:elem,
                                        attr:'value'
                                    });
                                    // end edit

                                    Octane.handle('statechange:'+watch,$this.refresh.bind($this));
                                     return watch;
                                },'');

                                // store reference to element in the ViewModel
                                // with its attr to update and the key to update with
                                /*deep.reduce(function(o,x,i){
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
                                },$scope);*/
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
                                        oUpdate = _.invert( JSON.parse(_oUpdate) );
                                    }catch(ex){
                                       Octane.log('JSON.parse failed in ViewModel.parse(), element: '+elem ,ex );
                                    }
                                }

                                // push element+attr to scope[key] for one-way updates
                                _.forOwn(oUpdate,function(attr,key){

                                    var deep = key.split('.');
                                    var l = deep.length;

                                    // set event handlers for all levels of model change
                                    deep.reduce(function(o,x,i){
                                        var watch;
                                        var index;
                                        if(i === 0){
                                            watch = x;
                                        }else{
                                            watch = o+'.'+x;
                                        }

                                        _.isArray($scope[watch]) || ($scope[watch] = []);

                                        $scope[watch].push({
                                            key:key,
                                            elem:elem,
                                            attr:attr
                                        });

                                        Octane.handle('statechange:'+watch,$this.refresh.bind($this));
                                         return watch;
                                    },'');

                                    // store reference to element in the ViewModel
                                    // with its attr to update and the model key to update with
                                    /*deep.reduce(function(o,x,i,arr){

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
                                    },$scope);*/
                                });
                            }  // end if o-update
                        },

						// run event type thru ViewModel scope to update elems/attrs bound to model
						refresh 	: 	function (e){

                            // ignore non statechange events
                            if(e.type.split(':')[0] != 'statechange') return;

                            // loop bound model datapoint in scope
                            var $update = this._update.bind(this);
                            var $scope = this.scope;
                            // create array of nested keys,
                            // ex. "statechange:App.loading.message" becomes ["App","loading","message"]
                            /*var updated = e.type ? e.type.replace('statechange:','').split('.') : [];
                            var toUpdate = updated.reduce(function(o,x,i){
                                return _.isObject(o[x]) ? o[x] : {};
                            },$scope);
                            var targets;
                            console.log('toUpdate',toUpdate);
                            // recursively get targets
                            targets = this._getUpdateTargets(toUpdate);
                            // remove undefined
                            targets = _.compact(targets);
                            // flatten
                            targets = targets.__concatAll();
                            _.each(targets,function(target){
                               $update(target.key,target.elem,target.attr);
                            });*/
                            var key = e.type.replace('statechange:','');
                            _.isArray($scope[key]) && _.each($scope[key],$update);

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
						_update       : function(updateTarget){

                            var viewmodel = this;
                            var key = updateTarget.key;
                            var elem = updateTarget.elem;
                            var attr = updateTarget.attr;
                            var fresh = Octane.get(key);
                            var filter = elem.getAttribute('o-filter');
                            var prop,updater;

                            // remove cached elements no longer on DOM
                            if(!elem.parentNode){
                                _.pull(this.scope[key],updateTarget);
                            }

                            if(__.isNull(fresh) || __.isUndefined(fresh)){
                                fresh = '';
                            }
                            // break filter into name and optional parameter to pass as second argument to filtering function
                            filter && ( filter = filter.split(',') );

                            if(attr.indexOf('.') !== -1){ // there is a '.' in the attr, ex. 'style.color'
                                // update style on element
                                prop = attr.split('.')[1];

                                elem.style[prop] = fresh;
                            } else {

                                updater = new __.Switch({
                                    'html' : function(fresh){
                                        elem.innerHTML = filter ? Octane.applyFilter(filter[0],fresh,filter[1]) : fresh;
                                    },
                                    'text' : function(fresh){
                                        elem.textContent = filter ? Octane.applyFilter(filter[0],fresh,filter[1]) : fresh;
                                    },
                                    'value' : function(fresh){
                                        elem.value = fresh;
                                    },
                                    'src' : function(fresh){
                                        elem.src = fresh;
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
						uptake			: 	function(event,element){

                            var oBind = element._bind;
                            // remove model name from string
                            var modelName = oBind ? OctaneModel._parseName(oBind) : null;
                            var pointer = oBind ? OctaneModel._parseKey(oBind) : null;

                            if(element.type === 'file'){
                                Octane.set(oBind,element.files);
                                return;
                            }
                            if(element.tagName == 'TEXT-AREA'){
                                element.value = element.innerHTML;
                            }
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
            bind 				: function(model,become){

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
                                    this.detach();  // make sure we're detached from one ViewModel reference before binding to another
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
                                },
                                original : function(){

                                    //var clone = _.clone(this);
                                    var ctx = this.constructor;
                                    var clone = new ctx();
                                    clone.set(this.attributes);
                                    _.extend(clone,this,this.__legacy__);
                                    var remove = ['__legacy__','become','detach','isRegistered','registeredTo','original'];
                                    //_.extend(clone,clone.__legacy__);
                                   _.each(remove,function(method){
                                       delete clone[method];
                                    });
                                    return clone;
                                }

                            });
                            if(become) model.become(become);
                            return model;
                        },

            // remove an integrated Backbone Model
            unbind 			: function(bind){

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
            },

            get 				: function(bind){
                            return _octane.models[bind];
                        }

		});










	/* ------------------------------------------------------- */
	/*                         MODELS                          */
	/* ------------------------------------------------------- */










    _octane.models = {};




        // base Model factory
		function OctaneModel(data,viewmodel){

            var isRegistered = false;
            var registeredTo= null;

						this.viewmodel = viewmodel;
            this.className = this.className || 'OctaneModel';
            this.extend({
                guid : 'model_'+Octane.GUID(),
                state : {},
                become : function(name){
									var models = octane.models;
                  models[name] && models[name].detach();
                  models[name] = this;
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
                // aliases to match ViewModel static methods for Backbone models
                bind : function(name){
                    return this.become.apply(this,[name]);
                },
                unbind : function(){
                    return this.detatch.apply(this);
                }
            });
						// set defaults from prototype
            this.set(this.defaults);
						// overwrite with data passed to constructor
            this.set(data);
            this.initialize && this.initialize.apply(this,arguments);
            if(viewmodel) this.become(viewmodel);
        }




        // static methods
        Octane.defineProp.call(OctaneModel,{

            // static factory
            create      : function(data,bind){
                            return new this(data,bind);
                        },

            // set method for Backbone models bound with Octane.ViewModel
            // very similar to OctaneModel.prototype._set, begging for a DRY refactor
            set         : function(key,val,options){

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
                        },

            // get the model name from a keystring, ex "App.loading.message" would return "App"
            _parseName  : function(bind){
                            try {
                                return bind.split('.')[0];
                            } catch (ex){
                               Octane.error('could not parse model name from '+bind+': '+ex.message);
                                return false;
                            }
                        },

            // get the nested key from a keystring, ex "App.loading.message" would return "loading.message"
            _parseKey   : function(o_bind){
                            try{
                                return o_bind.split('.').slice(1).join('.');
                            } catch (ex){
                                Octane.error('could not parse model key from '+o_bind+': '+ex.message);
                                return false;
                            }
                        }

        }); // end static methods




		OctaneModel.prototype = new OctaneBase;

        OctaneModel.prototype.initialize = function(){};
        OctaneModel.prototype.defaults = {};
        OctaneModel.prototype.constructor = OctaneModel;

        OctaneModel.prototype.defineProp({

						_set	    	: function(){

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
            _setState   : function(keystring,value){

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
                                }catch(ex){
                                    modelUpdated = false;
                                    Octane.log('Unable to set model data "'+keystring+'"',ex);
                                }

                                modelUpdated && this.isRegistered() &&  Octane.fire('statechange:'+this.registeredTo()+'.'+keystring);

                        },

            // helper, applies hooks on changed model state attributes before they get set
            _applyHooks : function(keystring,setObject){

                            if( this.isRegistered() ){
                                var name = this.registeredTo();
                                var hooks = _octane.hooks[name+'.'+keystring];

                                if(_.isArray(hooks)){
                                    _.each(hooks,function(hook){
                                        _.extend( setObject,hook(setObject));
                                    });
                                }
                            }
                        },

            _unset      : function(toUnset,timeout,throttle){

                            var $this = this;
                            if(!toUnset) return;

                            _.isArray(toUnset) || (toUnset = toUnset.split(','));

                            if(timeout && (__.typeOf(timeout) == 'number')){ // timout the unset

                                if(throttle){                                // throttle the unsets
                                    _.each(toUnset,function(keystring,i){
                                        setTimeout(function(){
                                            $this.set( keystring,void(0) );
                                        },timeout*(i+1));                   // make sure we timeout the 0 index
                                    });
                                }else{                                      // unset all together after timeout
                                    setTimeout(function(){
                                        _.each(toUnset,function(keystring){
                                            $this.set( keystring, void(0) );
                                        });
                                    },timeout);
                                }
                            } else {
                                _.each(toUnset,function(keystring){         // unset all immediately
                                    $this.set( keystring, void(0) );
                                });
                            }

                        },

            _destroy    : function(){

                            var  keys = Object.keys(this.state);
                            var n = keys.length;

                            while(n--){
                                delete this.state[keys[n]];
                            }
                            if( this.isRegistered()){
                                this.detach();
                            }
                        },

            _get	   : function(keystring){

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
                                   Octane.log('Unable to get model data "'+keystring+'"',ex);
                                }
                                return data;
                            } else {
                                return this.state;
                            }
						},

            _clear      : function(){

                            var stateProps = Object.keys(this.state)
                            var n=stateProps.length;
                            var prop;

                            while(n--){
                                prop = stateProps[n];
                                delete this.state[prop];
                                this.isRegistered() && Octane.fire('statechange:'+this.registeredTo()+'.'+prop);
                            }
                            // alert any subscribers
                            if( this.isRegistered() ){
                                Octane.fire(this.registeredTo()+':statechange');
                                Octane.fire( 'statechange:'+this.registeredTo() ); // can't remember which is linked to tasks and ViewModel...
                            }
                            return this;
                        },

            reset       : function(defaults){
                            this.clear().set(defaults || this.defaults);
                        }

		});




        // overwritable aliases for extension classes
        OctaneModel.prototype.augment({

            get         : function(){
                            return this._get.apply(this,arguments);
                        },

            set         :  function(){
                            return this._set.apply(this,arguments);
                        },

            unset       :  function(){
                            return this._unset.apply(this,arguments);
                        },

            clear       : function(){
                            return this._clear();
                        },

            destroy     : function(){
                            this._destroy();
                        }
        });




        Octane.defineProp({

            Model       : OctaneModel,

            // functional alias for calling new octane.Model()
            // returns a named model if it already exists
						model 			: function (name){
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

                            var modelName = OctaneModel._parseName(modelStateKey);
                            var stateKey = OctaneModel._parseKey(modelStateKey);
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

                                var modelName = OctaneModel._parseName(keystring);
                                var key = OctaneModel._parseKey(keystring);
                                var value = fresh[keystring];
                                var model = _octane.models[modelName];

                                model && model.set(key,value);
                            }

                        },
            // access a bound model's unset method from the application object
            unset       : function(toUnset,timeout,throttle){

                            if(!toUnset) return;

                            _.isArray(toUnset) || (toUnset = toUnset.split(','));

                            var unset = function(keystring){
                                keystring = keystring.trim();
                                var  modelName = OctaneModel._parseName(keystring);
                                var key = OctaneModel._parseKey(keystring);
                                var model = _octane.models[modelName];
                                model && model.unset(key);
                            };

                            if(timeout && (__.typeOf(timeout) == 'number')){ // timout the unset

                                if(throttle){                                // throttle the unsets
                                    _.each(toUnset,function(keystring,i){
                                        setTimeout(function(){
                                            unset(keystring);
                                        },timeout*(i+1));                   // make sure we timeout the 0 index
                                    });
                                }else{                                      // unset all together after timeout
                                    setTimeout(function(){
                                        _.each(toUnset,unset);
                                    },timeout);
                                }
                            } else {
                                _.each(toUnset,unset);                      // unset all immediately
                            }
                        }
		});










    /* ------------------------------------------------------- */
	  /*                     CONTROLLERS                         */
	  /* ------------------------------------------------------- */










        _octane.controllers = {};




		function OctaneController(name,config){

            _.isString(name) && (this.name = name);

           _.isPlainObject(config) && _.extend(this,config);

            this.initialize && this.initialize.apply(this,arguments);
            // add this Controller instance to the _octane's controllers object
            this.name && (_octane.controllers[this.name] = this);
		}




		OctaneController.prototype = new OctaneBase;
        OctaneController.prototype.constructor = OctaneController;
        OctaneController.prototype.initialize = function(){};
        OctaneController.prototype.defaults = {};
        OctaneController.prototype.destroy = function(){
            this._destroy.apply(this);
        };
        OctaneController.prototype.engrave({
            _destroy : function(){
                delete _octane.controllers[this.name];
            }
       });




		Octane.defineProp({
			controller 	: function (name,config){
							if(!name){
								return new OctaneController(Octane.GUID());
							} else if(!_octane.controllers[name]){
								return new OctaneController(name,config);
							} else {
								return _octane.controllers[name];
							}
						},
            Controller  : OctaneController
		});










    /* ------------------------------------------------------- */
    /*                        FACTORIES                        */
    /* ------------------------------------------------------- */










      // prototype chaining Backbone.js style
        var extend = function(){

            var className,config,staticMethods,ParentFactory,parentDefaults,Factory,_Factory;

            if(__.typeOf(arguments[0]) == 'string'){
                className = arguments[0];
                config = arguments[1] || {};
                staticMethods = arguments[2] || {};
            }else{
                config = arguments[0] || {};
                staticMethods = arguments[1] || {};
            }

            ParentFactory = this;
            parentDefaults = ParentFactory.prototype.defaults || {};

            if(config.constructor != Object && _.isFunction(config.constructor)){
                Factory = config.constructor;
            } else {
                Factory = function(){
                    return ParentFactory.apply(this,arguments);
                };
            }

            _.extend(Factory,ParentFactory,staticMethods);

            _Factory = function(){ this.constructor = Factory; };
            _Factory.prototype = ParentFactory.prototype;
            Factory.prototype = new _Factory;

            // ensure prototyp has a defaults object
            Factory.prototype.defaults = {};
            _.extend(Factory.prototype, config);
            _.extend(Factory.prototype.defaults, parentDefaults, config.defaults);

            Factory.__super__ = ParentFactory.prototype;

            return Factory;
        }




        // a factory for creating constructor functions
        // that can inherit from each other
        // imbued with the static methods define and extend that cannot be overwritten
        var Factory = function(){
            this.initialize.apply(this,arguments);
        };




        Factory.prototype = new OctaneBase;
        Factory.prototype.initialize = function(){};
        Factory.prototype.defaults = {};
        Octane.defineProp.apply(Factory,[{
            defineProp : Octane.defineProp
        }]);




        Octane.defineProp({ Factory : Factory });




        OctaneModel.extend = OctaneController.extend =  Factory.extend = extend;










    /* ------------------------------------------------------- */
    /*                       FILTERS                           */
    /* ------------------------------------------------------- */










        _octane.filters = {};

        Octane.defineProp({

            // filterFunction as -> function(dataToBeFiltered[,optionalParameter to be passed])
            filter      : function(name,filterFunction){
                            _octane.filters[name] = filterFunction;

                            return Octane;
                        },

            applyFilter : function(filter,dirty,param){
                            var filtered = dirty;
                            var $filter;
                            if($filter = _octane.filters[filter]){
                                try {
                                    filtered = $filter.apply(null,[dirty,param]);
                                } catch(ex){
                                    Octane.log('Could not apply filter "' + filter+'"',ex);
                                }
                            }
                            return filtered;
                        }
        });










    /* ------------------------------------------------------- */
	  /*                          TASKS                          */
	  /* ------------------------------------------------------- */










        // param 1 : a model key to listen for change on
        // add param 2 as function(data held in model[key])

        Octane.defineProp({

            task        : function(key,$task){

                            var cache ={};
                            var arr = key.split('.');

                            arr.reduce(function(o,x,i,a){
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

         Octane.defineProp({

             hook       : function hook(oBind,func){

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
	/*                         MODULES                         */
	/* ------------------------------------------------------- */










        _octane.modules       = {};

        _octane.moduleConfigs = {};

        _octane.moduleExports = {};

        _octane.bootlog 			= [];

				var msgs		= {
					load	  : function(a)  { return "       "+a+': not initialized, loading...'},
					init		: function(a)  { return "       "+a+': initializing...'},
					done		: function(a)  { return "       "+a+': successfully initialized!'},
					skip	  : function(a)  { return "       "+a+': already initialized, continuing...'},
					fail1		: function(a)  { return "FAILED "+a+': failed to initialize!'},
					check		: function(a)  { return "       "+a+': checking dependencies...'},
					clear		: function(a)  { return "       "+a+': no dependencies, preparing to initialize...'},
					next		: function(a,b){ return "       "+a+': dependency "'+ b +'" loaded and initialized, continuing...'},
					hold		: function(a,b){ return "       "+a+': dependency "'+ b +'" not yet loaded, loading now...'},
					fail2		: function(a,b){ return 'FAILED '+a+': Could not load module, missing module dependency "'+ b +'"'},

				};

				function bootlog(msg,a,b){
					_octane.bootlog.push( msgs[msg](a,b) );
				}


        function OctaneModule (name,dependencies){
            this.initialized        = false;
            this.name               = name;
            this.imports            = {};
            this.controllers        = {};
            this.dependencies       = dependencies;
						this.status							= {_isPending : false};
						var loading = false;

						this.accessors('loading',{
							set : function(bool){
								if(!this.initialized) {
									loading = __.typeOf(bool) == 'boolean' ? bool : loading;
								}
							},
							get : function(){
								return loading;
							}
						});
        }




        OctaneModule.prototype = new OctaneBase;
        OctaneModule.prototype.initialize = function(){};
        OctaneModule.prototype.constructor = OctaneModule;
        OctaneModule.prototype.defineProp({

            import      : function(module){
                                return _octane.moduleExports[module];
                        },

            export      : function(exports){

                            _.isObject(_octane.moduleExports[this.name]) || (_octane.moduleExports[this.name] = {});

                            try{
                                _.extend(_octane.moduleExports[this.name],exports);
                            }catch (ex){
                                Octane.log('Could not create exports for module '+this.name+'.',ex);
                            }
                        },

						controller      : function(name,methods){

                            // give the controller the module's config hash
                            (methods || (methods = {})).moduleConfig = (_octane.moduleConfigs[this.name] || {});
                            this.controllers[name] = octane.controller(name,methods);
                            return this; // chainable
            },

            _getImports  : function(){

                            _.transform(this.dependencies,function(imports,dependency){
                                imports[dependency] = _octane.moduleExports[dependency];
                            },this.imports);
                        },

            _load					: function(){

														if(this.initialized){

															bootlog('skip',this.name);
															return Promise.resolve(this);

														} else {

															bootlog('load',this.name);

															return this._checkDependencies()
																.bind(this)
                                .then(function(){

																		var name = this.name;
																		var config 	= _octane.moduleConfigs[name] || {};

																		bootlog('init',name);
                                    this._getImports(name);
																		this.initialize(config);

																		Octane.App.set({
                                        "loadingProgress" : (Math.ceil(100 / Object.keys(_octane.modules).length))
                                    });
                                    // hook-in for updating a loading screen
                                    Octane.fire('loaded:module',{
                                        detail:{moduleID: name }
                                    });

                                    this.defineProp('initialized',true);

																		bootlog('done',name);
                                    return Promise.resolve(this);
                                })
                                .catch(function(err){
                                    bootlog('fail1',this.name);
																		Octane.log(err);
                                    this.initialized = false;
                                    return Promise.reject();
                                });
														}
                        },

						_checkDependencies : function(){

                            var deps = this.dependencies || [];
                            var n = deps.length;
                            var results = [];

														bootlog('check',this.name);

                            if(n === 0){
                                bootlog('clear',this.name);
                                return Promise.resolve();
                            } else {
                                while(n--){

                                  results.push(this._checkDependency(deps[n]));

                                }
                                return Promise.all(results);
                            }
                        },

            _checkDependency : function (dname){

														dname = ''.trim.apply(dname||'');

														var name 			= this.name;
                            var required 	= _octane.modules[dname];

                            switch(true){

																case (dname.length === 0) : // no dependency

																		bootlog('clear',name);
                                    return Promise.resolve();

																case ( !(required && required instanceof OctaneModule) ) : // module is not present, fail

																		bootlog('fail2',name,dname);
                                    return Promise.reject();

																case ( required && required.initialized ) : // module is already loaded, continue

																		bootlog('next',name,dname);
                                    return Promise.resolve();

																case (!required.initialized): // module is not loaded, try to load it

																		bootlog('hold',name,dname);
																		required.status._isPending || (required.status = required._load());
																		return required.status;
                            }
                        }
        });





		Octane.defineProp({

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











        // octane DOM elements

        Octane.defineGetter('loadingContainer',function(){
            return document.getElementsByTagName('o-loading-container')[0] || document.createElement('o-loading-container');
        });

        Octane.defineGetter('bgContainer',function(){
            return document.getElementsByTagName('o-background')[0] || document.createElement('o-background');
        });

        Octane.defineGetter('appContainer',function(){
            return document.getElementsByTagName('o-app-container')[0] || document.createElement('o-app-container');
        });

        Octane.defineGetter('viewContainer',function(){
            return document.getElementsByTagName('o-view-container')[0] || document.createElement('o-view-container');
        });

        Octane.defineGetter('modalContainer',function(){
            return document.getElementsByTagName('o-modal-container')[0] || document.createElement('o-modal-container');
        });

        Octane.defineGetter('listViewElements',function(){
            return document.getElementsByTagName('o-view');
        });

        Octane.defineGetter('listModalElements',function(){
            return document.getElementsByTagName('o-modal');
        });









	/* ------------------------------------------------------- */
	/*                       TEMPLATES                         */
	/* ------------------------------------------------------- */




        _octane.templates = {};




        function Template(elem){
				if(!elem) return;
            var name = elem.getAttribute('name');
            this.id = name || elem.name || elem._guid || (elem._guid = Octane.GUID());
            this.markup = elem.innerHTML;
            this.content = '';
            this.parent = elem.parentElement;
        }




        // static methods
        _.extend(Template,{

            get : function(id){

							if(_octane.templates[id]){
								return _octane.templates[id];
							} else {
								Octane.log('Template ' +id+ ' does not exist');
								return this.create();
							}
            },

            create : function(elem){
                return new Template(elem);
            },

            fromString : function(name,string){

							if(!string) {
								string = name;
								name = undefined;
							}
                var div = document.createElement('div');
                div.name = name;
                div.innerHTML = string;
                return new Template(div);

            },

            parse : function (template,data){

                _.isString(template) || (template = ''),
                _.isObject(data) || (data = {});

                var pattern = /\{\{([^{^}]+)\}\}/g;
                var matches = template.match(pattern);
                var n;

                if(_.isArray(matches)){
                    n = matches.length;
                    while(n--){
                        template = this._replace(template,matches[n],data);
                    }
                }
                return template;
            },

            _replace : function replace (template,match,data){

                // match ex. {{postedBy.firstName @filter:myFilter @param:myParam}}

                var stripped = match.replace(/[{}]+/g,''); // stripped ex. postedBy.firstName @filter:myFilter @param:myParam

                var split = stripped.split(/\s/);   // split ex. ["postedBy.firstName","@filter:myFilter","@param:myParam"]

                var key = split[0]; // key ex. "postedBy.firstName"

                var filter = split[1];  // filter ex. "@filter:myFilter"

                var param = split[2];  // param ex. "@param:myParam"

                var regexp = new RegExp("(\\{\\{"+stripped+"\\}\\})","g");
                //var regexp = new RegExp("("+match+")","g");

                var nested = key.split('.'); // nested ex. ["postedBy","firstName"]

                var n = nested.length;

                var value = nested.reduce(function (prev,curr,index){
                    if(index == (n-1) && _.isObject(prev)){ // last iteration
                       return prev[curr]; // return value
                    }
                    if(_.isObject(prev)){
                        return prev[curr]; // go one level deeper
                    } else {
                        return null; // no further nesting, value defined in key does not exist
                    }
                },data) || ''; // start with data object passed to template

                // apply filter if present
                if(filter){
                    param && ( param = param.replace('@param:','') );
                    filter = filter.replace('@filter:','');
                    value = Octane.applyFilter(filter,value,param);
                }

                // replace all occurences of {{postedBy.firstName @filter:myFilter @param:myParam}}
                // in template with filtered value of data.postedBy.firstName,
                // or data.postedBy.firstName if "myFilter" didn't exist
                return  template.replace(regexp,value);
            },

            compile : function(scope){

                scope || (scope = document);

                var $this = this;
                var tmpls = scope.querySelectorAll('script[type="text/octane-template"],o-template');
                var t = tmpls.length;

                while(t--){
                    this._cache(tmpls[t]);
                }
            },

            _cache : function(elem){

								if(elem){
                    // compile nested templates
                    this.compile(elem);
                    var tmp = this.create(elem);
                    tmp.save();
                    elem.parentElement.removeChild(elem);
                }
            },

            _render : function (template,elem,method){

							if(template.content == '') template.content = template.markup;

							// a surrogate
                var div = document.createElement('div');
								var firstChild = elem.firstChild;
                var content = template.content;
                var nodes,swatch;

                // turn surrogate html into nodes
                div.innerHTML = content;
                div.normalize();
                nodes = div.childNodes;

                swatch = new __.Switch({
                    prepend : function(elem,nodes){
                        var i=0,n=nodes.length,node;
                        for(;i<n;i++){
                            node = nodes[i];
                            if(node && node.nodeType == (Node.ELEMENT_NODE || Node.TEXT_NODE)){
                                elem.insertBefore(node,firstChild);
                            }
                        }
                    },
                    append : function(elem,nodes){
                        var i=0,n=nodes.length,node;
                        for(;i<n;i++){
                            node = nodes[i];
                            if(node && node.nodeType == (Node.ELEMENT_NODE || Node.TEXT_NODE)){
                                elem.appendChild(nodes[i]);
                            }
                        }
                    },
                    replace : function(elem,nodes,content){
                        elem.innerHTML = content;
                    },
                    default : function(elem,nodes,content){
                        elem.innerHTML = content;
                    }
                });
                swatch.run(method,[elem,nodes,content]);

                Octane.recompile(elem);
            },

            prototype : new OctaneBase
        });





        // instance methods
        Template.prototype.defineProp({

            set : function(data){
                this.content = Template.parse(this.markup,data);
                return this; // chainable
            },
            replace : function(elem){
                Template._render(this,elem,'replace');
            },
            renderTo : function(elem){
               Template._render(this,elem,'elem');
            },
            prependTo : function(elem){
                Template._render(this,elem,'prepend');
            },
            appendTo : function(elem){
                Template._render(this,elem,'append');
            },
            save : function(){
                if(!_octane.templates[this.id]){
                    _octane.templates[this.id] = this;
                }else{
                    Octane.log('Could not create template '+this.id+'. Already exists');
                }
            },
            append  : function(){
                var parent = this.parent;
                if(parent instanceof HTMLElement){
                   this.appendTo(parent);
                }
            },
            prepend : function(){
                var parent = this.parent;
                if(parent instanceof HTMLElement){
                   this.prependTo(parent);
                }
            },
            render : function(){
                var parent = this.parent;
                if(parent instanceof HTMLElement){
                   this.renderTo(parent);
                }
            }
        });




        Octane.defineProp({ Template : Template });










  /*-------------------------------------------------------	*/
	/*                 O-CONTROLLER ORDINANCE									*/
	/*-------------------------------------------------------	*/










        Octane.designate('[o-controller]',function(elem,designation){

            var arr,event,controller,method,assignments,controllerMethod,param;

            try{                    // passed as JSON array ['event','ControllerName','methodName','optionalParam']
                arr                 = JSON.parse(designation);
                event               = designation[0];
                controller          = designation[1];
                method              = designation[2];
                param               = designation[3];
            }catch(ex){             // passed as string ex. 'ListViewController.refresh @param:15, assume click event
                event               = 'click';
                assignments         = designation.split(' ');
                controllerMethod    = assignments[0];
                controllerMethod    = controllerMethod.split('.');
                controller          = controllerMethod[0];
                method              = controllerMethod[1];
                param               = assignments[1] ? assignments[1].replace(/[@]\w*[:]/,'') : null;
            }


            elem.addEventListener(event,function(e){
                var $controller = _octane.controllers[controller];
                try{
                    $controller[method].apply($controller,[elem,param]);
                } catch (ex){
                    Octane.log('o-controller ' +controller+ '.' +method+ ' could not be applied',ex);
                }
            });
        });










  /* -------------------------------------------------------*/
	/*                     O-SYNC ORDINANCE                    */
	/* ------------------------------------------------------*/










        Octane.designate('[o-sync]',function(elem,model){

            //var nested = elem.querySelectorAll('[o-sync]');
            //Octane.recompile(elem);
            var template = new Octane.Template(elem);
            template.save();
            elem.innerHTML = '';

            Octane.handle('statechange:'+model,function(e){
                var data = Octane.ViewModel.get(model).get();
                Octane.Template.get(elem._guid).set(data).renderTo(elem);
            });
        });



        Octane.designate('[o-src]',function(elem,value){
            var pattern = /\{\{([^{^}]+)\}\}/g;
            if(!pattern.test(value)){
                elem.src = value;
                elem.removeAttribute('o-src');
            }

        });


        Octane.designate('[o-bg-img]',function(elem,value){
            var pattern = /\{\{([^{^}]+)\}\}/g;
            if(!pattern.test(value)){
                 elem.style.backgroundImage = 'url('+value+')';
                elem.removeAttribute('o-bg-img');
            }
        });





        var UiMessages = OctaneModel.extend({
            hint : function(){

                var setObject,toUnset,timeout;

                // handle key,value and {key:value}
                if(_.isString(arguments[0])){
                    setObject = {};
                    setObject[arguments[0]] = arguments[1];
                    timeout = arguments[2];
                } else if(_.isObject(arguments[0])){
                    setObject = arguments[0];
                    timeout = arguments[1];
                } else {
                    return {};
                }
                timeout || (timeout = 5000);

                // automatically remove after 5 seconds or specified time
                toUnset = Object.keys(setObject);
                this._set(setObject);
                this._unset(toUnset,timeout);
            }
        });





  /* -------------------------------------------------------*/
	/*                        INIT                             */
	/* -------------------------------------------------------*/




				_octane.context = 'web';





        Object.defineProperty(Octane,'context',{
            get : function(){
                return _octane.context;
            },
            set : function(cx){
                var contexts = ['html4','html5','web','cordova'];
                __.inArray(contexts,cx) && (_octane.context = cx);
            }
        });




        Octane.defineProp({
            initialize : function initialize (appConfig,moduleConfigs){

                 // don't reinitialize
                if(Octane.initialized) return;




								_.isPlainObject(appConfig) || (appConfig = {});
                Octane.defaultView  = appConfig.defaultView;
                Octane.context      = appConfig.context;




								// establish module configuration
								// configs passed at init are used over those passed earlier
								// by individual calls to octane.configureModule
								_.isPlainObject(moduleConfigs) || (moduleConfigs = {});
								_.forOwn(_octane.moduleConfigs,function(config,key){
										_.defaults(moduleConfigs[key],config);
								});




                // parse the DOM initially to create virtual DOM model
                Octane.defineProp({
                    // default application models
                    ViewModel   : new ViewModel(),
                    App         : new OctaneModel().become('App'),
                    uiMessages  : new UiMessages().become('uiMessages'),
                    uiStyles    : new OctaneModel().become('uiStyles')
                });





                Octane.App.set({
                    loadingProgress : 0,
                    name : appConfig.appName
                });




                // hook for loading screens
                Octane.hook('App.loadingProgress',function($state){
                    var currentProgress = Octane.get('App.loadingProgress') || 0;
                    $state.loadingProgress = currentProgress + $state.loadingProgress;
                    return $state;
                });






                // compile DOM templates
                Octane.Template.compile();





								// add debugging support if module included,
                // pass internal _octane app object as module config
								var modules = _octane.modules;

								var debug = modules['Debug'];
								if(debug){
                    _octane.moduleConfigs.Debug = {reflection : _octane};
                }





								// Octane initialize returns a Promise!
                // load modules -> compile -> ready
                // make sure core modules are loaded before 3rd party/app specific modules
								return ( ( debug && debug._load()) || Promise.resolve())
										.then(function(){
												return modules['StartupUtilities']._load();
										})
                    .then(function(){
                        return modules['AppLoading']._load();
                    })
                    .then(function(){
                        return modules['OctaneRouter']._load();
                    })
                    .then(function(){
                        return modules['OctaneModals']._load();
                    })
                    .then(function(){ // precompile
                        return Compiler.run();
                    })
                    .then(function(){

                        var loaded = _.map(modules,function(m){
													return m._load();
												});
                        return Promise.all(loaded);
                    })
                    .then(function(){
                        return Compiler.run();
                    })
                    .then(function(){
                        Octane.defineProp({initialized : true });
                        Octane.fire('octane:ready');
                    })
                    .catch(function(err){
                        Octane.log(err);
                    });
            }
        });




        window.octane = window.$o = Octane;

	})($,_,__);
