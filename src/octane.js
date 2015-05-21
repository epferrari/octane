


/* ------------------------------------------------------- */
/*                 OCTANE MVC FRAMEWORK                    */
/* ------------------------------------------------------- */

		// @author Ethan Ferrari
		// ethanferrari.com/octane
		// onefiremedia.com
		// version 0.1.0
		// May 2015













		'use strict';


	/* ------------------------------------------------------- */
	/*                         BASE                            */
	/* ------------------------------------------------------- */

			var select 						= document.querySelector.bind(document);
			var selectAll 				= document.querySelectorAll.bind(document);
			var define 						= Object.defineProperty;
			var _ 								= require('lodash');
			var Promise 					= require('bluebird');
			var _octane 					= require('./_octane.js');
			var extend 						= require('./lib/extend.js');
			var utils 						= require('./lib/utils.js');
			var Events 						= require('./lib/events.js');



			var Router 						= require('./lib/router.js');
			var View							= require('./lib/view.js');
			var Modal 						= require('./lib/modal.js');






	/* ------------------------------------------------------- */
	/*								PUBLIC APPLICATION OBJECT								 */
	/* ------------------------------------------------------- */

			var OctaneBase = require('./lib/base.js');

			var Octane = new OctaneBase();




	/* ------------------------------------------------------- */
	/*                          EVENTS                         */
	/* ------------------------------------------------------- */

			Octane.defineProp({

				dispatch: 	function(type,detail){

											if(_.isString(type)){
												var e = utils.customEvent(type,{bubbles:true,detail:detail});
												window.dispatchEvent(e);
											}
										},

				// programatically alert that user data has changed on a data-bound element
				trip: 			function(node,eventType){

												var rand = Math.random();
												var	e = utils.customEvent((eventType || 'input'),{bubbles:true,detail:rand});
												node.dispatchEvent(e);
										},
			});




	/* ------------------------------------------------------- */
	/*       			COMPILER and ORDINANCE ASSIGNMENT         	 */
	/* ------------------------------------------------------- */

			var Compiler = require('./lib/compiler.js');

			Octane.defineProp({

				compiler: 	function(qselector,task){
											Compiler.assign.apply(Compiler,[qselector,task]);
											return this;
										},

				// alias of .compiler
				designate: 	function(qselector,task){
											Compiler.assign.apply(Compiler,[qselector,task]);
											return this;
										},

				recompile: 	function(context){
											return Compiler.run.apply(Compiler,[context]);
										},

				clearCompileCache: function(){
											Compiler.nodeMap = {};
										}
			});





	/* ------------------------------------------------------- */
	/*                   ERRORS & LOGGING                      */
	/* ------------------------------------------------------- */



	/* ------------------------------------------------------- */
	/*                     XMLHttpRequest                      */
	/* ------------------------------------------------------- */

			var Http = require('./lib/http.js');

			Octane.defineProp({
				http: function(url,headers){
					return new Http(url,headers);
				}
			});




	/* ------------------------------------------------------- */
	/*                       DICTIONARIES                      */
	/* ------------------------------------------------------- */

			var Dictionary = require('./lib/dictionaries.js');

			Octane.defineProp({ Dictionary : Dictionary	});




	/* ------------------------------------------------------- */
	/*                       TEMPLATES                         */
	/* ------------------------------------------------------- */

			var Template = require('./lib/templates.js');

			Octane.defineProp({ Template: Template });





	/* ------------------------------------------------------- */
	/*                         MODELS                          */
	/* ------------------------------------------------------- */

			var OctaneModel 			= require('./lib/model.js');

			Octane.defineProp({

				Model: 		 	OctaneModel,

				// functional alias for calling new Octane.Model() or Octane.Model.create()
				// returns a named model if it already exists
				model: 			function (data){

											if(_.isString(data)){
												var alias = data;
												// only an alias was passed and it's currently occupied on the Mediator
												// return the model occupying that alias
												if(_octane.models[alias]){
													return _octane.models[alias];
												// only an alias was passed and it's vacant on the Mediator
												// create new model, assign it to the alias, and return it
												} else {
													return new OctaneModel().become(alias);
												}
											}
											// alias was not passed, return an unassigned model instance
											// possibly with data to set
											return new OctaneModel(data);
										},
				// access a bound model's get method from the application object
				get: 				function(modelStateKey){

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
				set: 				function(key,val){

											var fresh,keys,i,n;
											var tk = Octane.Utils.typeOf(key);

											if(tk === 'object'){ fresh = key; }
											else if(tk === 'string'){ (fresh = {})[key] = val; }
											else { fresh = {}; }

											_.each(fresh,function(value,binding){
												var name 	= OctaneModel._parseName(binding);
												var key 	= OctaneModel._parseKey(binding);
												var model = _octane.models[name] || ( Octane.Model.create().become(name) );
												if(model){
													(key !=='') ? model.set(key,value) : model.reset(value);
												}
											});
										},

				// access a bound model's unset method from the application object
				unset: 			function(toUnset,timeout,throttle){

											if(!toUnset) return;

											_.isArray(toUnset) || (toUnset = toUnset.split(','));

											var unset = function(binding){
													binding 	= binding.trim();
													var name 	= OctaneModel._parseName(binding);
													var key 	= OctaneModel._parseKey(binding);
													var model = _octane.models[name];
													model && model.unset(key);
											};

											if(timeout && (Octane.Utils.typeOf(timeout) == 'number')){ 				// timout the unset

													if(throttle){                                				// throttle the unsets
															_.each(toUnset,function(binding,i){
																	setTimeout(function(){
																			unset(binding);
																	},timeout*(i+1));                   				// make sure we timeout the 0 index
															});
													}else{                                      				// unset all together after timeout
															setTimeout(function(){
																	_.each(toUnset,unset);
															},timeout);
													}
											} else {
													_.each(toUnset,unset);                      				// unset all immediately
											}
										}
			});




	/* ------------------------------------------------------- */
	/*           				DEEP MODEL MONITORING                  */
	/* ------------------------------------------------------- */

			define(OctaneBase.prototype,'watch',{
				value: function(binding,fn,thisArg){
					var cache ={};
					binding.split('.').reduce(function(o,x,i,a){
						subBinding = (i === 0) ? x : o+'.'+x;
						// set handler for each state change in a subBinding
						this.handle('statechange:'+subBinding,function(e){
							var currentVal = Octane.get(watching);
							if(currentVal !== cache[watching]){
								cache[watching] = currentVal;
								fn.apply((thisArg||this),[currentVal,watching]);
							}
						});
						return subBinding;
					}.bind(this));
					return this;
				}
			});




	/* ------------------------------------------------------- */
	/*                      VIEW MODEL                         */
	/* ------------------------------------------------------- */

			var ViewModel 				= require('./lib/view-model.js');

			var uptake = function uptake(e,el){

				var model			= el.getAttribute('o-model');
				var binding 	= el.getAttribute('o-bind');
				var value;

				// if o-bind is the only attribute, use it as binding,
				// otherwise o-bind is a key of the o=model attribute
				model && (binding = model + '.' + binding);

				if(el.type === 'file'){
					value = el.files;
				}else if(el.type === 'checkbox'){
					value = el.checked;
				}	else if(el.tagName === 'TEXT-AREA'){
					value = el.innerHTML;
				} else{
					(value = el.value);
				}

				if( value !== Octane.get(binding) ){
					Octane.set(binding,value);
				}
			};

			Compiler.assign('[o-bind]',function(elem,binding){

				Octane.handle('input click select',elem,uptake);

				if(_.contains( ['file','checkbox'] ,elem.type)){
					Octane.handle('change',elem,uptake);
				} else {
					Octane.watch(binding,function(value){
						elem.value = value || '';
					});
				}
			});




	/* ------------------------------------------------------- */
	/*                        MEDIATOR                         */
	/* ------------------------------------------------------- */

			var Mediator = require('./lib/mediator.js');

			Octane.defineProp({
				Mediator: 	Mediator,
				link: 			Mediator.link,
				unlink: 		Mediator.unlink
			});




	/* ------------------------------------------------------- */
	/*                    COLLECTIONS                          */
	/* ------------------------------------------------------- */









	/* ------------------------------------------------------- */
	/*                     CONTROLLERS                         */
	/* ------------------------------------------------------- */

			var OctaneController = require('./controller.js');

			define(Octane,'controller',{
				value: function (name,config){
								if(!name){
									throw new Error('OctaneController must have name');
								} else if(!_octane.controllers[name]){
									return new OctaneController(name,config);
								} else {
									return _octane.controllers[name];
								}
							},
				writable: false,
				configurable:false
			});


			define(Octane,'Controller',{
				value: OctaneController,
				writable: false,
				configurable: false
			});

			Compiler.assign('[o-control]',function(elem,attrVal){

				// ex. <ul  o-control="(click) [ListViewController.refresh>" o-delegator="li"..</ul>
				// elem: <ul>
				// attrVal: '(click)[ListViewController.refresh,li a]

				var isDelegator = elem.hasAttribute('o-delegator');
				var delegates;

				if(isDelegator) delegates = elem.getAttribute('o-delegator');

				var vals = attrVal.match( /(\(.*?\])/g )||[];
				_.each(vals,function(str){

					var event,handler,params,action,ctrlName,controller,method;

					event 				= (str.match( /\((.*?)\)/ )||[null,'click'])[1];
					handler				= (str.match( /\[(.*?)\]/ )||[null,''])[1];
					params 				= handler.split(',');
					action 				= (params.shift()||'').split('.');
					ctrlName      = action[0];
					method		 		= action[1];

					// new zero index after shift

					if(isDelegator){
						elem.addEventListener(event,function(e){

							var src,el,controller;

							src = (e.srcElement||e.target);
							controller = _octane.controllers[ ctrlName ];

							// if we've declared delegates AND
							// the event is fired from an element we're delegating events for
							// the Controller.method is called with *src* as the first arg
							if(delegates && _.contains(this.querySelectorAll(delegates),src)){
								try{
									controller[method].apply(controller,[src].concat(params));
								} catch(ex){
									Octane.log('delegated ' +ctrlName+ '.' +method+ ' could not be applied',ex);
								}

							// if we've declared that this element listens for events on its children
							// but did not define a querySelector pattern
							// the Controller.method is called with *this* as the first arg
							} else if(!delegates) {
								try{
									controller[method].apply(controller,[this].concat(params));
								}catch (ex){
									Octane.log('delegated ' +ctrlName+ '.' +method+ ' could not be applied',ex);
								}
							}
						});
					} else {
						Octane.handle(event,elem,function(e,el){
							var controller = _octane.controllers[ ctrlName ];
							try{
									controller[method].apply(controller,[el].concat(params));
								} catch(ex){
									Octane.log('delegated ' +ctrlName+ '.' +method+ ' could not be applied',ex);
								}
						});
					}
					elem = null;
				});
			});




	/* ------------------------------------------------------- */
	/*                       FILTERS                           */
	/* ------------------------------------------------------- */

			// filterFunction as -> function([params])
			define(Octane,'filter',{
				value: function(name,filterFunction){
									_octane.filters[name] = filterFunction;

									return Octane;
							},
				writable: false,
				configurable: false
			});



	/* ------------------------------------------------------- */
	/*                          TASKS                          */
	/* ------------------------------------------------------- */

			// param 1 : a model key to listen for change on
			// add param 2 as function(data held in model[key])
			define(Octane,'task',{
				value: function(watching,fn,thisArg){

								var cache ={};
								var arr = watching.split('.');

								arr.reduce(function(o,x,i,a){
									var watch;
									if(i === 0){
											watch = x;
									}else{
											watch = o+'.'+x;
									}
									Octane.handle('statechange:'+watch,function(e){
										var currentVal = Octane.get(watching);
										if(currentVal !== cache[watching]){
											cache[watching] = currentVal;
											fn.call((thisArg||Object.create(null)),currentVal,watching);
										}
									});
									return watch;
								},'');
								return Octane;
							},
				writable: false,
				configurable: false
			});





	/* ------------------------------------------------------- */
	/*                          HOOKS                          */
	/* ------------------------------------------------------- */

			// a function to be applied before the setting of data in the model
			// if one model data value changes depending on another, a hook is the place for that logic
			// binding is the incoming data model.key to parse for, func is the function to apply
			// a hook is applied at set time to a binding

			Octane.defineProp({

				hook: 			function hook(binding,fn){

											(_octane.hooks[binding]||(_octane.hooks[binding]=[])).push(fn);

											return this; // chainable
										}
			});




	/* ------------------------------------------------------- */
	/*                         MODULES                         */
	/* ------------------------------------------------------- */

			var OctaneModule  		= require('./lib/modules.js');

			Octane.defineProp({

				module: 		function(name,dependencies){
											return (_octane.modules[name] = new OctaneModule(name,dependencies) );
										},

				hasModule: 	function (name){
											return (_octane.modules[name] && _octane.modules[name].initialized);
										},

				moduleConfig:function(module,cfg){
											_.isPlainObject(cfg) && (_octane.moduleConfigs[module] = cfg);
										}
			});




	/* ------------------------------------------------------- */
	/*                          DOM                            */
	/* ------------------------------------------------------- */

			var DOM = require('./lib/dom.js');

			define(Octane,'DOM',{
				value: DOM,
				writable: false,
				configurable: false
			});



	/* ------------------------------------------------------- */
	/*                          VIEWS                          */
	/* ------------------------------------------------------- */

			var View = require('./lib/view.js');

			Octane.defineProp('View',View);




	/*-------------------------------------------------------	*/
	/*                					ROUTER												*/
	/*-------------------------------------------------------	*/

			var Router = require('./lib/router.js');

			Octane.defineProp({ Router : Router });

			//add Router methods to Application Object
			Octane.extend(Router);



	/* ------------------------------------------------------- */
	/*                          MODALS                         */
	/* ------------------------------------------------------- */

			var Modal = require('./lib/modal.js');

			Octane.defineProp('Modal',Modal);




	/*-------------------------------------------------------	*/
	/*                 NATIVE APP ORDINANCES									*/
	/*-------------------------------------------------------	*/

			Compiler.assign('[o-src]',function(elem,value){
				var pattern = /\{\{([^{^}]+)\}\}|^(_*)$|^(\s*)$/g;

				if(!pattern.test(value)){
					elem.src = value;
					elem.removeAttribute('o-src');
				} else {
					elem.removeAttribute('src');
					delete elem.src;
				}
			});


			Compiler.assign('[o-bg-img]',function(elem,value){

				var pattern = /\{\{([^{^}]+)\}\}|^(_*)$|^(\s*)$/g;
				if(!pattern.test(value)){
					elem.style.backgroundImage = 'url('+value+')';
					elem.removeAttribute('o-bg-img');
				}
			});




	/*-------------------------------------------------------	*/
	/*                 			UI MESSAGES												*/
	/*-------------------------------------------------------	*/

			var Hinter = require('./lib/hinter.js');

			Octane.defineProp({ uiMessages : new Hinter().become('uiMessages') });

			Compiler.assign('ui-message',function(elem){
				var vm = new ViewModel(elem,'uiMessages');
			});




	/* -------------------------------------------------------*/
	/*                        INIT                            */
	/* -------------------------------------------------------*/

			// getter and setter for context
			// used for feature detection
			// set to either 'html4','html5','web',or 'cordova'
			Object.defineProperty(Octane,'context',{

				get: 				function(){
											return _octane.environment;
										},
				set: 				function(cx){
											var contexts = ['html4','html5','web','cordova'];
											utils.inArray(contexts,cx) && (_octane.environment = cx);
										},
				configurable: false
			});




			Octane.defineProp({

				initialize: function initialize (appConfig,moduleConfigs){


											// don't reinitialize
											if(OctaneBase.appInitialized) return false;




											// attach fastclick.js for mobile touch
											if ('addEventListener' in document) {
													document.addEventListener('DOMContentLoaded', function() {
															FastClick.attach(document.body);
													}, false);
											}




											_.isPlainObject(appConfig) || (appConfig = {});
											Octane.defaultView  = appConfig.defaultView;
											Octane.context      = appConfig.context;





											// establish module configuration
											// configs passed at init are used over those passed earlier
											// by individual calls to octane.configureModule
											_.isObject(moduleConfigs) || (moduleConfigs = {});
											_.each(_octane.modules,function(m,name){
												if(!_octane.moduleConfigs[name]) _octane.moduleConfigs[name] = {};

												_.merge(_octane.moduleConfigs[name],(moduleConfigs[name]||{}));
											});








											var AppModel = require('./lib/app-model.js');

											// parse the DOM initially to create virtual DOM model
											Octane.defineProp('App',AppModel);





											Octane.App.set({
													loadingProgress : 0,
													name : appConfig.appName
											});




											// hook for loading screens
											Octane.hook('App.loadingProgress',function(loadingProgress,binding){
													var currentProgress = Octane.get('App.loadingProgress') || 0;
													this.loadingProgress = currentProgress + this.loadingProgress;
											});

											// hook for loading screens
											Octane.hook('App.loadingProgress',function(value,binding){
													var currentProgress = value || 0;
													this.loadingProgress = currentProgress + this.loadingProgress;
											});




											// compile DOM templates
											Template.compile();




											Mediator.getScope();




											// add debugging support if module included,
											// pass internal _octane app object as module config
											var modules = _octane.modules;

											var debug = modules['Debug'];
											if(debug){
												define(OctaneBase,'debugMode',{
													value: true,
													writable: false,
													configurable: false
												});
												_octane.moduleConfigs.Debug.reflection = _octane;
											} else {
												define(OctaneBase,'debugMode',{
													value: false,
													writable: false,
													configurable: false
												});
											}





											// Octane initialize returns a Promise!
											// load modules -> compile -> ready
											// make sure core modules are loaded before 3rd party/app specific modules
											return ( (debug && debug._load()) || Promise.resolve())
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
													return Compiler.applyOrdinance('o-view');
												})
												.then(function(){
													return Compiler.applyOrdinance('o-modal');
												})
												.then(function(){
													return Promise.resolve(Object.keys(modules));
												})
												.each(function(m){
													return modules[m]._load();
												})
												.then(function(){
													return Compiler.run();
												})
												.then(function(){
													Mediator.forceRefresh();
													OctaneBase.defineProp('appInitialized',true);
													Octane.fire('octane:ready');
													/*if(document.readyState === 'complete'){
														Octane.fire('octane:ready');
													} else {
														Octane.handle('load',function(e){
															Octane.fire('octane:ready');
														});
													}*/
												})
												.catch(function(err){
													Octane.log(err);
												});
				}
			});



module.exports = Octane;
