// JavaScript Document
    
    // application object
    
	(function($,_,__){
		
       'use strict';
		// check that doubleUnder utility library is included
		if(!window.__) { return false; }
		// octane is already instanced
		if(window.octane) { return false; }
		
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
	// define public octane
    // intentionally global
	/* ------------------------------------------------------- */
		var octane = new Base('octane'); 
		
	/* ------------------------------------------------------- */
	// private _octane application object and properties
	/* ------------------------------------------------------- */
		
		var _octane = new Base('octane protected');
		_octane.define({
				modules		    : {},
				models		    : {},
				views		    : {},
				controllers     : {}
		});
	
	/* ------------------------------------------------------- */
	//  Application Unique IDs
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
	//  Application Error handling
	/* ------------------------------------------------------- */		
		
		_octane.log = {
			logfile : 	[],
			entry 	: 	function(message){
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
					_octane.log.entry('Context: '+$context+'. A '+constructor+' failed; '+conditions[i][1] );
					return false;
				}		
			}
			return true;	
		}
	
        
	/* ------------------------------------------------------- */
	//  Application Event Handling
	/* ------------------------------------------------------- */		
		
        // a custom event for the app to fire when user data changes
       octane.define({
            trip       :   function(elem){
                
                                var rand = Math.random(),
                                    e = __.customEvent('input',{bubbles:true,detail:rand});
                                
                                elem.dispatchEvent && elem.dispatchEvent(e);
                            }
        });
		
        _octane.eventRegister = {};
		
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
	// Application templating
	/* ------------------------------------------------------- */
        
        _octane.templates = {};
        
        function parseTemplate(template,data){
            
            template = _.isString(template) ? template : '',
            data = _.isObject(data) ? data : {};
            
            var  pattern = /\{\{([^{^}]+)\}\}/g,
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
                    _octane.log.entry('Could not create template '+template.id+'. Already exists');
                }
            }
                
        }
                                  
        octane.define({
            
            addTemplate : function(id,markup){
                
                if(_.isString(id) && _.isString(markup)){
                    if(!_octane.templates[id]){
                        _octane.templates[id] = markup;
                    }else{
                        _octane.log.entry('Could not create template '+id+'. Already exists');
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
	// Application input Filtering 
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
	//  Application Utility Libraries
	/* ------------------------------------------------------- */	
	
		_octane.libraries = {};
        _octane.dictionaries = {};
		
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
            };
        }
        
		octane.define({
			addLibrary : function(name,lib){
				_octane.libraries[name] = _.isObject(lib) ? new Library(name,lib) : {};
			},
			library : function(name){
				return _octane.libraries[name] instanceof Library && _octane.libraries[name].checkout();
			},
            addDictionary : function(name,data){
                _octane.dictionaries[name] = _.isObject(data) ? new Dictionary(name,data) : {};
            },
            dictionary : function(name){
                return _octane.dictionaries[name] instanceof Dictionary && _octane.dictionaries[name].get();
            }
		});
	
	
	/* ------------------------------------------------------- */
	//  Application Models
	/* ------------------------------------------------------- */
	
		function Model(name,options){
			
			options = _.isObject(options) ? options : {};
			options.context = options.context || 'Application';
            
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
                                    keyArray.reduce(parseString,$state);
            
                                    modelUpdated = true;
                                }catch(e){
                                    modelUpdated = false;
                                    _octane.log.entry('Unable to set model data "'+keyString+'". Error: '+e);
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
                                
                                var $this = this,
                                    stateData;
                                
                                if(keyString){
                                    var keyArray = keyString.split('.');
                                    
                                    try{
                                        stateData = keyArray.reduce(function(o,x,i){
                                            return o[x];
                                        },$this.state);
                                    }catch(e){
                                        stateData = '';
                                        _octane.log.entry('Unable to get model data "'+keyString+'". Error: '+e);
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
	//  Application ViewModel
	// @param $model [string] Model name this ViewModel uses
	// @param context [obj] the context of the MVCVM (_octane or a module) 
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
                            
                            var el = $scope[i],
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
                                            for(var ukey in toUpdate){
                                                if( ({}).hasOwnProperty.call(toUpdate,ukey)){
                                                    // remove model name from string
                                                    var upointer = ukey.split('.').slice(1).join('.');
                                                    update(element,toUpdate[ukey],this.model.get(upointer));
                                                }
                                            }
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
                                
                            var 	o_bind = element._bind,
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
	//  Application Controllers
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
                                    
                                var funcDeclaration= func.toString().split('{')[0],
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
				                
								var $this = this,
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
									
									for(var o_bind in $data){
										if( ({}).hasOwnProperty.call($data,o_bind) ){
											// look for an filter assigned to this o-bind keystring
											var $filter = $this.filters[o_bind];
											// purge the dirty data, execture hooks, and return
											$data = $this.filters[o_bind] ? filterOne($filter,o_bind,$data) : $data;
										}
									}
									return $data;   
								}
								
								this.applyParsers( filterAll($dirty) );	
                
                                // helper
                                /* ------------------------------------------------------- */

                                    function filterOne(filter,o_bind,$data){
                                        // if a filter exists, run it on the data
                                        // return object filtered data and detail about its filtration ('valid','invalid','undefined',etc. (user defined))
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
                                var $this = this,
                                    $maybePromise;
                
                                if(_.isObject($data)){
                                    
                                    for(var o_bind in $data){
                                        if( ({}).hasOwnProperty.call($data,o_bind) ){
                                            
                                            $maybePromise = $this.parsers[o_bind] && $this.parsers[o_bind]($data);
                                            //$this.parsers[o_bind] && $this.parsers[o_bind]($data);
                                            if(_.isObject($maybePromise) && _.isFunction($maybePromise.then)){
                                                $maybePromise.then($this.model.set);
                                            }else{
                                                $this.model.set($data);
                                            }  
                                        }
                                    }    
                                }
							},
            
			handleEvent : 	function(e){
								
								var $this = this,
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
	
	/* define Controller on octane - bridge to private _octane properties and methods */
		
		octane.define({
			controller 		: function (model){ 
                                if(_octane.controllers[model]){
                                    return _octane.controllers[model];
                                }else{
                                    return new Controller(model,'Application');
                                }
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
            if(!loadable){ return {instanced:false}; }
			
			this.define({
				instanced 		:	true,
				
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
		}
		
		
		Module.prototype = new Base();
        Module.prototype.constructor = Module;
		
	/* ------------------------------------------------------- */
	//  methods for handling modules
	/* ------------------------------------------------------- */
		
		// add a module to octane before init
		function addModule (id,dependencies,$module){
			
            $module = (__.typeOf(arguments[2]) == 'function') ? arguments[2] : arguments[1];
            $module.prototype = new Module(id);
            
            octane.extend.call($module,{
                dependencies : (__.typeOf(arguments[1]) == 'array') ? arguments[1] : [],
                id           : id,
                loaded       : false
            });
            
			_octane.modules[id] = $module;		
		}
		
		// called at init
		function initModules(options){
			
			options = options || {};
            
            // assign init arguments as properties of the module's constructor function
			for(var id in options){
                if( ({}).hasOwnProperty.call(options,id) && _octane.modules[id]){
                   _octane.modules[id].initArgs = _.isArray(options[id]) ? options[id] : [];
                }
            }
            
            // load each module
			for(var module in _octane.modules){
				if( ({}).hasOwnProperty.call(_octane.modules, module) ){
					loadModule(_octane.modules[module]);
				}	
			}
		}
		
		// helper for initModules
		function loadModule($module){
            
			if($module.prototype instanceof Module && dependenciesMet($module)){
                
                // prevent the same module from loading twice
                if($module.loaded){
                    _octane.log.entry('Could not load '+$module.name+' Module, already loaded');
                    return;
                }else{
                    Object.defineProperty(octane,$module.id, {
                        value : $module.__construct($module.initArgs),
                        writatble : false,
                        configurable : false
                    });
                    octane[$module.id].name = $module.id;
                    _octane.modules[$module.id].loaded = true;
                    
                    octane.goose('application',{
                        loadingProgress : (Math.ceil(100 / Object.keys(_octane.modules).length))
                    });
                    // hook-in for updating a loading screen
                    octane.fire('loaded:module',{
                        detail:{moduleID: $module.id }
                    });
                }
			}	
		}
		
		// helper for loadModules
		function dependenciesMet($module){
				
            var dependencies = _.isString($module.dependencies) ? $module.dependencies.split(',') : (_.isArray($module.dependencies) ? $module.dependencies : []);

            for(var i=0,n = dependencies.length; i<n; i++){
                var d = dependencies[i].trim(),
                    moduleD = _octane.modules[d];

                if( !(moduleD && moduleD.prototype instanceof Module) ) {
                    _octane.log.entry('Could not load '+$module.name+' Module, missing dependency '+d);
                    return false;
                }else{
                    if(!moduleD.loaded){
                         loadModule(moduleD);
                    }
                }           
            }
            return true;
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
	//  misc
	/* ------------------------------------------------------- */
        // artificially start the uptake circuit
        octane.define({
                goose : function(model,$dirty){
                            _octane.controllers[model] && _octane.controllers[model].doFilter($dirty);
                }
            })
        // global model and controller
            .define({ 
                appModel : new Model('application'),
                $Controller : new Controller('application'),
        // octane DOM elements
                dom:{} 
            })
        // octane ready handler
            .handle('octane:ready',function(e){
                setTimeout(function (){
                    // unhide the rest of the _octane's content hidden behind the loader
                    octane.dom.container().setAttribute('style','visibility:visible;'); 
                    // route to url-parsed view|| home
                    //octane.route(e.detail);
                },500);
            });
        
        octane.controller('application')
            .parser('loadingProgress',function($data){
                var currentProgress = this.model.get('loadingProgress') || 0;
                $data.loadingProgress = currentProgress + $data.loadingProgress;
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
        
        
		function init (options){
			
            var utils = octane.library('startup-utilities') || {};
            
            for(var util in utils){
                if(({}).hasOwnProperty.call(utils,util)){
                    // hook for the loading message
                    octane.fire('loading:utility',{detail:util});
                    // init utility
                   _.isFunction(utils[util]) && utils[util].call();
                }
            }
            
			options = options || {};
			if(_octane.modules['debug']){ options.debug = [_octane]; }
            
            initModules(options);
			octane.name = options.name || octane.name;
            
            var view = octane.parseView() || 'home';
            
            octane.fire('octane:ready',{detail:view});
		}
        
       
		octane.extend({
			
			/* octane API */
			
				init : function(options){ return init(options); }
				
                // .trip(element)
				// .handle(event,handler)
				// .fire(event,data)
            
                // .library(name,data)
                // .checkout(library)
                // .dictionary(name,data)
                // .lookup(dictionary)
				
                // .module(name,Constructor[,dependencies])
				// .model(name,options)
				// .controller($model)
				
                // .process($dirty)
				
                // .renderControls(langs[,container]) 	: extended from Translator Module
				// .translate([,data]) 						: extended from Translator Module
				// .getLang() 								: extended from Translator Module
				// .setLang(lang) 							: extended from Translator Module
				// .getLangContent(contentID) 				: extended from Translator Module
				// .setLangData(data) 						: extended from Translator Module
				
                // .errorLog()                              : extended from debug module (if active)
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
			     
				// .filter(prop,filter)
                // .hook(prop,$caseObject)
				// .parser(prop,fn)
                // .task(datakey,function(e.detail))
				
                // .doFilter($data)
				// .applyParsers($data)
			
			/* ViewModel methods */
			
				// .parse()
				// .refresh()
				// .uptake()
			//		
		});
	   
       window.octane = window.$o = octane;

	})($,_,__);


    
	/* TODO - octane extension methods */
	// add built in filters
    // add filters/lenses in refresh
	// add library injection (for routing animations, language data, etc)
	// build router with HTML5 history API, callbacks to include .translate() and ViewModel.refresh()
	// build selector module
	// build calculator in selector module using controller hooks and reactors
	// build modal view and routing
	
	
	
