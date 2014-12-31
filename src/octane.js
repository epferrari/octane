// JavaScript Document

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
				
								var $this = this,
                                    bind;
                
								if(_.isFunction(func)){
                                    if(__.typeOf(o_bind) == 'string'){
                                        o_bind = o_bind.split(',');
                                    }
                                    for(var i=0,n=o_bind.length; i<n; i++){
                                        bind = o_bind[i].trim();
                                        this.tasks.addCase(bind,function(){

                                            var data = $this.model.get(bind);
                                            // make sure 'this' in our parser refers to this Controller
                                            func.bind($this)(bind,data);
                                        });
                                    }
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
            .define({ $controller : new Controller(Octane.$model) })
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
	
	
	
