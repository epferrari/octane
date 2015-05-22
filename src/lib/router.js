	var _ 					= require('lodash');
	var Promise 		= require('bluebird');
	var modernizr 	= require('modernizr');
	var Velocity 		= require('velocity-animate');
	var uiPack 			= require('velocity-ui-pack');
	var History 		= require('history.js');
	var OctaneBase 	= require('./OctaneBase.js');
	var DOM 				= require('./DOM.js');
	var Controller  = require('./Controller.js');
	var View 				= require('./OctaneView.js');
	var Translator  = require('./Translator.js');
	var Mediator    = require('./Mediator.js');
	var _octane			= require('./_octane.js');
	var App			    = require('./app-model.js');
	var utils 			= require('./utils.js');


	var enRoute = null;
	var routingBlocked = false;
	var currentView;                // pointer
	var queuedRoutes = [];          // store routes called while another route is executing its loading animation
	//var routeConditions = {};       // conditions under which a route should be called, added with .routeIf()
	var routerKeys = [];

	// for HTML5 vs. HTML4 browsers
	// detect with modernizr
	var historyEnabled = (function(){
		var html = document.getElementsByTagName('html')[0];
		return  html && html.classList.contains('history');
	})();

	var stateChangeEvent = historyEnabled ? 'popstate' : 'hashchange';

	var Router = new OctaneBase();

	// helper to maintain appstate, uses History.pushState
	Router.defineProp('pushState',function(params){

		var parsed,language,title,appName,fragment;

		_.isObject(params) || (params = {});
		// update the language in the url
		parsed 		= utils.urlObject().searchObject;
		language 	= Translator.getLang();
		title 		= utils.titleize(params.view) || currentView.title;
		appName 	= App.get('name');

		_.extend(parsed,params);

		var fragment = '?' + _.map(parsed,function(val,key){
			return key + '=' + val;
		}).join('&');

		History.pushState({
				lang: language,
				view: params.view
			},
			appName +' | '+ title,
			fragment
		);
		document.querySelector('head>title').innerHTML = appName + ' | ' + title;
	});

	// helper to parse URL for a view
	Router.defineProp('parseUrl',function(){

		if(historyEnabled){
			return utils.urlObject().searchObject.view || false;
		} else {
			var hash,param,parsed = {};

			hash = window.location.hash
			hash = hash.replace('#?','');
			hash = hash.split('&');
			for(var i=0,n=hash.length;i<n;i++){
				param = hash[i].split('=');
				parsed[param[0]] = param[1];
			}
			return parsed.view || false;
		}
	});

	// the meat
	Router.defineProp('route',function(view,silent){
		return new Promise(function(resolve,reject){
			var V = View.get(view);
			var viewIsCurrent = (V === currentView);

			Router.fire('routing:called');

			if(!V || viewIsCurrent) return resolve();
			silent || (silent = V.silent || false);

			if(enRoute || routingBlocked){
				var toQueue = {
					view:view,
					silent:silent,
					resolver:resolve
				};
				if(!_.contains(queuedRoutes,toQueue)){
					queuedRoutes.unshift(toQueue);
				} else{
					//return resolve();
				}
				return;
			}

			var isPrevious = (V.id == (History.savedStates[History.savedStates.length-1]||{data:{}}).data.view);
			if( isPrevious ){
				return V.frameWillLoad()
				.then(function(){
					Router.fire('routing:begin');
					enRoute = V;
					return V._queue();
				})
				.then(function(){
					if(currentView){
						currentView.elem.classList.add('view-animating');
						return currentView._exit();
					}
				})
				.then(function(){
					currentView && currentView.elem.classList.remove('view-animating');
					return V._load();
				})
				.then(V.frameDidLoad)
				.then(function(){
					Router.fire('view:loaded');
					//previousView = currentView;
					currentView = V;
					enRoute = null;
					//if(!silent)pushState({view:V.id});
					App.set({
						viewID: 		V.id,
						viewTitle: 	V.title
					});
				})
				.then(function(){

					if(queuedRoutes.length >0){
						var next = queuedRoutes.shift();
						return Router.route(next.view,next.silent).then(next.resolver);
					}
				})
				.then(function(){
					resolve();
					Router.fire('routing:complete');
				})
				.catch(function(err){
					Router.log(err);
				});

			} else {

				return V.frameWillLoad()
				.then(function(){
					Router.fire('routing:begin');
					enRoute = V;
					if(currentView) return currentView._queue();
				})
				.then(function(){
					Router.fire('view:loading');
					return V._load();
				})
				.then(V.frameDidLoad)
				.then(function(){
					Router.fire('view:loaded');
					var previousView = currentView;
					currentView = V;
					enRoute = null;
					if(!silent)pushState({view:V.id});
					App.set({
						viewID: 		V.id,
						viewTitle: 	V.title
					});
					if(previousView) return previousView._exit();
				})
				.then(function(){

					if(queuedRoutes.length >0){
						var next = queuedRoutes.shift();
						return Router.route(next.view,next.silent).then(next.resolver);
					}
				})
				.then(function(){
					resolve();
					Router.fire('routing:complete');
				})
				.catch(function(err){
					Router.log(err);
				});
			}
		});
	});




	Router.defineProp({
		// add a Promise that must resolve before a view is routed
		beforeRoute: 	function beforeRoute(routes,deferred){
										_.isArray(routes)||(routes=routes.split(','));
										_.each(routes,function(route){
											route = route.trim();
											var view = View.get(route);
											view && view.beforeLoad(deferred);
										});
										return this;
									},
		// alias
		routeThen: 		function(){
										return Router.onroute.apply(this,arguments);
									},
		// add a callback to be executed when the specified view finishes its loading animation
		onroute: 			function (routes,callback,argsArray){
										_.isArray(routes)||(routes=routes.split(','));
										_.each(routes,function(route){
											route = route.trim();
											var view = View.get(route);
											view && view.onload(callback,argsArray);
										});
										return this;
									},
		// add a callback to be executed when the specified view finishes its exit animation
		onRouteDismissed: function(routes,callback,argsArray){
										_.isArray(routes)||(routes=routes.split(','));
										_.each(routes,function(route){
											route = route.trim();
											var view = View.get(route);
											view && view.onExit(callback,argsArray);
										});
										return this;
									},
		lock: 				function(){
										routingBlocked = true;
										routerKeys.push(this.guid({}));
										return key;
		},
		unlock: 			function(key){
										_.remove(routerKeys,key);
										if(routerKeys.length === 0){
											routingBlocked = false;
											if(queuedRoutes.length > 0){
												var next = queuedRoutes.shift();
												Router.route(next.view,next.silent)
													.then(next.resolver);
											}
										} else {
											return false;
										}
		}
	});



	// Router getters
	Router.defineGetter('isLocked',function(){
		return routingBlocked;
	});

	Router.defineGetter('queue',function(){
		return queuedRoutes;
	});

	View.defineGetter('current',function(){
		return currentView;
	});




	// change the view with browser's forward/back buttons
	Router
	.handle(stateChangeEvent,function(e){
		this.route(this.parseUrl());
	})
	// ensure onscreen view keeps proper dimensions to proper dimensions
	.handle('translated resize orientationchange',function(){
		currentView && currentView.setCanvasHeight();
	});


	Compiler
	.assign('[o-route]',function(el){

		// catch a click event from a child node
		el.addEventListener('click',function(e){
				//e.stopPropagation();
				//e.stopImmediatePropagation();
				//el.dispatchEvent(__.customEvent('octane:route',{bubbles:true}));
				Router.route(this.getAttribute('o-route'));
		},false);

		// set up the octane event mediator
		// so event won't get a second listener
		// if you call .compile() again after .initialize()
		/*octane.handle('octane:route',el,function(e,el){
			var route = el.getAttribute('o-route');
			octane.route(route);
		});
		*/
	})
	.assign('.o-back',function(el){
		el.addEventListener('click',function(e){
				//el.dispatchEvent(__.customEvent('octane:routeback',{bubbles:true}));
				History.go(-1);
		},false);
	});


module.exports = Router;

/*
// add a condition that needs to be true for the route to run
routeIf: 			function(viewID,conditions){
								_.isObject(conditions) || (conditions = {});

								if(!_.isArray(routeConditions[viewID])){
									routeConditions[viewID] = [];
								}
								if(!_.isFunction(conditions.predicate)){
									conditions.predicate = function(){
											return true;
									}
								}
								routeConditions[viewID].push(conditions);
								return this;
							},
*/
