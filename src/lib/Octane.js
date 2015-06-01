(function(module,exports){
	'use strict';

	/* ------------------------------------------------------- */
	/*                 OCTANE MVC FRAMEWORK                    */
	/* ------------------------------------------------------- */

		// @author Ethan Ferrari <ethan@ethanferrari.com>
		// ethanferrari.com/octane
		// http://onefiremedia.com
		// https://github.com/epferrari/Octane.git
		// version 2.0.1
		// April 2014 - May 2015


	/* ------------------------------------------------------- */
	/*                         BASE                            */
	/* ------------------------------------------------------- */

			var define       = Object.defineProperty;
			var _            = require('lodash');
			var Promise      = require('bluebird');
			var FastClick    = require('fastclick');
			var Velocity     = require('velocity-animate');
			var _octane      = require('./_octane.js');
			var utils        = require('./utils.js');
			var debug        = require('./debug.js');
			var AppModel     = require('./app-model.js');

			require('velocity-ui-pack');
			global._ = _;
			global.Promise = Promise;






	/* ------------------------------------------------------- */
	/*								PUBLIC APPLICATION OBJECT								 */
	/* ------------------------------------------------------- */

			var OctaneBase = require('./OctaneBase.js');

			var Octane = new OctaneBase();




	/* ------------------------------------------------------- */
	/*                          EVENTS                         */
	/* ------------------------------------------------------- */

			Octane.defineProp({

				dispatch: 	function(type,detail){
					if(_.isString(type)){
						var e = utils.customEvent(type,{
							bubbles: 	true,
							detail: 	detail
						});
						window.dispatchEvent(e);
					}
				},

				// programatically alert that user data has changed on a data-bound element
				trip: function(node,eventType){
					var rand = Math.random();
					var	e = utils.customEvent((eventType || 'input'),{bubbles:true,detail:rand});
					node.dispatchEvent(e);
				}
			});




	/* ------------------------------------------------------- */
	/*       			COMPILER and ORDINANCE ASSIGNMENT         	 */
	/* ------------------------------------------------------- */

			var Compiler = require('./Compiler.js');

			Octane.defineProp({

				compiler: function(qselector,task){
					Compiler.assign(qselector,task);
					return this;
				},

				// alias of .compiler
				designate: function(qselector,task){
					Compiler.assign(qselector,task);
					return this;
				},

				recompile: function(context){
					return Compiler.compileAll(context);
				},

				clearCompileCache: function(){
					Compiler.nodeMap = {};
				}
			});


	/* ------------------------------------------------------- */
	/*                     XMLHttpRequest                      */
	/* ------------------------------------------------------- */

	//Not included at this time
	/*
			var Http = require('./http.js');

			Octane.defineProp({
				http: function(url,headers){
					return new Http(url,headers);
				}
			});
	*/



	/* ------------------------------------------------------- */
	/*                       DICTIONARIES                      */
	/* ------------------------------------------------------- */

			var Dictionary = require('./Dictionary.js');

			Octane.defineProp({ Dictionary : Dictionary	});




	/* ------------------------------------------------------- */
	/*                       TEMPLATES                         */
	/* ------------------------------------------------------- */

			var Template = require('./Template.js');

			Octane.defineProp({ Template: Template });





	/* ------------------------------------------------------- */
	/*                         MODELS                          */
	/* ------------------------------------------------------- */

			var OctaneModel 			= require('./OctaneModel.js');

			Octane.defineProp({

				Model: 		 	OctaneModel,

				// functional alias for calling new Octane.Model() or Octane.Model.create()
				// returns a named model if it already exists
				model: function (data){

					if(_.isString(data)){
						var alias = data;
						// only an alias was passed and it's currently occupied on the ViewModel
						// return the model occupying that alias
						if(_octane.models[alias]){
							return _octane.models[alias];
						// only an alias was passed and it's vacant on the ViewModel
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
				get: function(modelStateKey){

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
				set: function(key,val){

					var inbound;
					var tk = utils.typeOf(key);

					if(tk === 'object'){
						inbound = key;
					}
					else if(tk === 'string'){
						(inbound = {})[key] = val;
					}
					else {
						inbound = {};
					}

					_.forOwn(inbound,function(value,path){
						var name 	= OctaneModel._parseName(path);
						var _key 	= OctaneModel._parseKey(path);
						var model = _octane.models[name] || ( Octane.Model.create().become(name) );
						if(model){
							(_key !== '') ? model.set(_key,value) : model.reset(value);
						}
					});
				},

				// access a bound model's unset method from the application object
				unset: function(toUnset,options){

					if(!toUnset) return;
					_.isPlainObject(options) || (options = {});
					_.isArray(toUnset) || (toUnset = toUnset.split(','));

					var unset = function(binding){
							binding 	= binding.trim();
							var name 	= OctaneModel._parseName(binding);
							var key 	= OctaneModel._parseKey(binding);
							var model = _octane.models[name];
							model && model.unset(key);
					};
					var timeout = options.timeout;
					var throttle = options.throttle;

					if(timeout && (utils.typeOf(timeout) === 'number')){ 			// timout the unset

							if(throttle){                                					// throttle the unsets
								_.each(toUnset,function(binding,i){
									setTimeout(function(){
											unset(binding);
									},timeout*(i+1));                   							// make sure we timeout the 0 index
								});
							}else{                                      					// unset all together after timeout
								setTimeout(function(){
									_.each(toUnset,unset);
								},timeout);
							}
					} else {
							_.each(toUnset,unset);                      					// unset all immediately
					}
				}
			});




	/* ------------------------------------------------------- */
	/*           				DEEP MODEL MONITORING                  */
	/* ------------------------------------------------------- */

			var watch = function(path,fn,thisArg){
				var watching;

				path.split('.').reduce(function(o,x,i){
					watching = (i === 0) ? x : o + '.' + x;
					// set handler for each state change in a subBinding
					this.any('modelchange:' + watching,function(){
						var currentVal = Octane.get(watching);
						fn.apply((thisArg || this),[currentVal,watching]);
					});
					return watching;
				}.bind(this),path[0]);
				return this;
			};

			define(OctaneBase.prototype,'watch',{
				value: watch,
				writable:false,
				configurable:false
			});

			define(OctaneModel.prototype,'watch',{
				value: watch,
				writable:false,
				configurable:false
			});




	/* ------------------------------------------------------- */
	/*                      VIEW MODEL                         */
	/* ------------------------------------------------------- */

			var ViewModel = require('./ViewModel.js');

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

				Octane.on('input click select',elem,uptake);

				if(_.contains( ['file','checkbox'] ,elem.type)){
					Octane.on('change',elem,uptake);
				} else {
					Octane.watch(binding,function(value){
						if(value === undefined || value === null){
							value = '';
						}
						elem.value = value;
					});
				}
			});

			Octane.defineProp({
				ViewModel: 	ViewModel,
				link: 			ViewModel.link,
				unlink: 		ViewModel.unlink
			});








	/* ------------------------------------------------------- */
	/*                    COLLECTIONS                          */
	/* ------------------------------------------------------- */









	/* ------------------------------------------------------- */
	/*                     CONTROLLERS                         */
	/* ------------------------------------------------------- */

			var OctaneController = require('./Controller.js');

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

					var event,handler,params,action,ctrlName,method;

					event 				= (str.match( /\((.*?)\)/ )||[null,'click'])[1];
					handler				= (str.match( /\[(.*?)\]/ )||[null,''])[1];
					params 				= handler.split(',');
					action 				= (params.shift()||'').split('.');
					ctrlName			= action[0];
					method		 		= action[1];

					if(isDelegator){
						elem.addEventListener(event,function(e){

							var src,controller;

							src = (e.srcElement||e.target);
							controller = _octane.controllers[ ctrlName ];

							// If we've declared delegates AND
							// the event is fired from an element we're delegating events for,
							// then the Controller.method is called with *src* as the first arg
							if(delegates && _.contains(this.querySelectorAll(delegates),src)){
								try{
									controller[method].apply(controller,[src].concat(params));
								} catch(ex){
									Octane.log('delegated '+ctrlName+'.'+method+' could not be applied',ex);
								}

							// If we've declared that this element listens for events on its children
							// but did not define a querySelector pattern,
							// then the Controller.method is called with `this` as the first arg,
							// `this` being the object listening for the event
							} else if(!delegates) {
								try{
									controller[method].apply(controller,[this].concat(params));
								}catch (ex){
									Octane.log('delegated '+ctrlName+'.'+method+' could not be applied',ex);
								}
							}
						});
					} else {
						Octane.on(event,elem,function(e,el){
							var controller = _octane.controllers[ ctrlName ];
							try{
									controller[method].apply(controller,[el].concat(params));
								} catch(ex){
									Octane.log('delegated '+ctrlName+'.'+method+' could not be applied',ex);
								}
						});
					}
					elem = null;
				});
			});




	/* ------------------------------------------------------- */
	/*                       FILTERS                           */
	/* ------------------------------------------------------- */

			var filter = require('./filters.js');
			// filterFunction as: function([params]){...do something }
			define(Octane,'filter',{
				value: function(name,filterFunction){
					filter.apply(Object.create(null),[name,filterFunction]);
					return Octane;
				},
				writable: false,
				configurable: false
			});




	/* ------------------------------------------------------- */
	/*                          HOOKS                          */
	/* ------------------------------------------------------- */

			// A function to be applied before the setting of data in the model
			// If one model data value changes depending on another, a hook is the place for that logic.
			// Binding is the incoming data model.key to parse for, func is the function to apply
			// A hook is applied at set time to a binding

			define(Octane,'hook',{

				value: function(binding,fn){
					(_octane.hooks[binding]||(_octane.hooks[binding]=[])).push(fn);
					return this;
					// chainable
				},
				writable: false,
				configurable: false
			});




	/* ------------------------------------------------------- */
	/*         				 	RUNTIME MODULES                        */
	/* ------------------------------------------------------- */

			var OctaneModule = require('./OctaneModule.js');

			Octane.defineProp({

				module: 		function(name,dependencies){
					_octane.modules[name] = new OctaneModule(name,dependencies);
					return _octane.modules[name];
				},

				hasModule: 	function (name){
					return (_octane.modules[name] && _octane.modules[name].initialized);
				},

				moduleConfig:function(moduleName,cfg){
					_.isPlainObject(cfg) && (_octane.moduleConfigs[moduleName] = cfg);
				}
			});




	/* ------------------------------------------------------- */
	/*                          DOM                            */
	/* ------------------------------------------------------- */

			var DOM = require('./DOM.js');

			define(Octane,'DOM',{
				value: DOM,
				writable: false,
				configurable: false
			});



	/* ------------------------------------------------------- */
	/*                     PAGE VIEWS                          */
	/* ------------------------------------------------------- */

			var Page = require('./OctanePage.js');

			Octane.defineProp('Page',Page);

			Compiler.assign('o-page',function(elem){
				var page = new Page(elem);
				page;
			});


	/*-------------------------------------------------------	*/
	/*                					ROUTER												*/
	/*-------------------------------------------------------	*/

			var Router = require('./Router.js');

			Octane.defineProp({ Router: Router });

			//add Router methods to Application Object
			var routerMethods = ['route','loadPageif','beforePageLoad','onPageLoad','onPageExit'];
			_.each(routerMethods,function(method){
				Octane[method] = Router[method];
			});
			Octane.addRoute = Router.add;

			// set up animations for all Pages defined in HTML markup
			Router.add(/^#?(.*?)(?=[\/]|$)/,function(page){
				Router._loadPage(page);
			});

	/* ------------------------------------------------------- */
	/*                          MODALS                         */
	/* ------------------------------------------------------- */

			var Modal = require('./OctaneModal.js');

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

			var Hinter = require('./Hinter.js');

			Octane.defineProp({ uiMessages : new Hinter().become('uiMessages') });

			Compiler.assign('ui-message',function(elem){
				var vm = new ViewModel(elem,'uiMessages');
				_octane.viewModels[vm.guid()] = vm;
			});




	/* -------------------------------------------------------*/
	/*                        INIT                            */
	/* -------------------------------------------------------*/

			// Getter and setter for environment,
			// used for feature detection.
			// Set to either 'web' or 'cordova'
			Object.defineProperty(Octane,'env',{

				get: function(){
					return _octane.environment;
				},
				set: function(env){
					var contexts = ['web','cordova'];
					_.contains(contexts,env) && (_octane.environment = env);
				},
				configurable: false
			});


			Octane
			.hook('App.loadingProgress',function(progress,inbound){
				inbound.progress = inbound.progress <= 100 ? inbound.progress : 100;
				inbound.percent = inbound.progress.toString()+"%";
				inbound.screenReader = inbound.percent+' Loaded';
			})
			.hook('App.loadingMessage',function(message,inbound){
				inbound.message = _.isString(inbound.message) ? inbound.message : 'Loading...';
			})
			.on('octane:ready',function(){
					// unhide the app content hidden behind the loader
				var loadingContainer = Octane.DOM.loadingContainer;

				Octane.DOM.appContainer.classList.remove('hidden');

				if(Octane.defaultRoute){
					Router.route(Octane.defaultRoute);
				} else {
					Router._executeRoute(global.location.href);
				}

				setTimeout(function(){
					Velocity(loadingContainer,'fadeOut',{duration:500})
					.then(function(){
						document.body.removeChild(loadingContainer);
					});
				},500);
			});


			Octane.defineProp({

				initialize: function initialize (appConfig,moduleConfigs){


					// don't reinitialize
					if(_octane.initialized) return false;




					// attach fastclick.js for mobile touch
					if (document.addEventListener) {
						document.addEventListener('DOMContentLoaded', function() {
							FastClick(document.body);
						}, false);
					}




					_.isPlainObject(appConfig) || (appConfig = {});
					Octane.defaultRoute	= appConfig.Route;
					Octane.env = appConfig.env;
					_octane.animateBy = _.contains(['js','css'],appConfig.animateBy) ?
						appConfig.animateBy : 'css';




					// start the Router
					Router[appConfig.legacyRouting ? 'usePolling' : 'useBrowserEvents']();



					// establish module configuration
					// configs passed at init are used over those passed earlier
					// by individual calls to octane.configureModule
					_.isObject(moduleConfigs) || (moduleConfigs = {});
					_.each(_octane.modules,function(m,name){
						if(!_octane.moduleConfigs[name]) _octane.moduleConfigs[name] = {};

						_.merge(_octane.moduleConfigs[name],(moduleConfigs[name]||{}));
					});




					// parse the DOM initially to create virtual DOM model
					Octane.defineProp('App',AppModel);





					Octane.App.set({
						loadingProgress : 0,
						name : appConfig.appName
					});




					// hook for loading screens
					Octane.hook('App.loadingProgress',function(value,inbound,current){
						var currentProgress = current.loadingProgress || 0;
						inbound.loadingProgress = currentProgress + inbound.loadingProgress;
					});




					// compile DOM templates
					Template.compile();




					ViewModel.getScope();




					// add debugging support
					// set to false in production
					if(appConfig.debugMode){
						define(_octane,'debugMode',{
							value: true,
							writable: false,
							configurable: false
						});
						Octane.defineGetter('errors',function(){
							debug.getErrors();
						});

						Octane.defineGetter('bootlog',function(){
							debug.getBootlog();
						});
						Octane.Reflection = _octane;
						debug.showConsole();

					} else {
						define(_octane,'debugMode',{
							value: false,
							writable: false,
							configurable: false
						});
					}



					var modules = _octane.modules;

					// Octane initialize returns a Promise!
					// load modules -> compile -> ready

					return Compiler.compile('o-view')
						.then(function(){
							return Compiler.compile('o-modal');
						})
						.then(function(){
							return Promise.resolve(Object.keys(modules));
						})
						.each(function(m){
							return modules[m]._load();
						})
						.then(function(){
							return Compiler.compileAll();
						})
						.then(function(){
							ViewModel.forceRefresh();

							define(_octane,'initialized',{
								value: true,
								writable: false,
								configurable: false
							});

							Octane.fire('octane:ready');
						})
						.catch(function(err){
							Octane.log(err);
						});
				}
			});



module.exports = global.octane = Octane;

})(module,module.exports);
