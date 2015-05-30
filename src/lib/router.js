	// reveal Modernizr on the global namespace
	require('../../vendor/modernizr.js');

	var History			= require('html5-history');
	var _ 					= require('lodash');
	var Promise 		= require('bluebird');

	var OctaneBase 	= require('./OctaneBase.js');
	var Page 				= require('./OctanePage.js');
	var App			    = require('./app-model.js');
	var utils 			= require('./utils.js');
	var Compiler		= require('./Compiler.js');


	var enRoute = null;
	var routingBlocked = false;
	var currentPage;                // pointer
	var queuedRoutes = [];          // store routes called while another route is executing its loading animation
	var routerKeys = [];

	// for HTML5 vs. HTML4 browsers
	var stateChangeEvent = Modernizr.history ? 'popstate' : 'hashchange';
	var Router = new OctaneBase();

	History.init();
	// helper to maintain appstate, uses History.pushState
	Router.defineProp('pushState',function(params){

		var parsed,language,title,appName,fragment;

		_.isObject(params) || (params = {});
		// update the language in the url
		parsed 		= utils.urlObject().searchObject;
		//language 	= Translator.getLang();
		title 		= utils.titleize(params.page) || currentPage.title;
		appName 	= App.get('name');

		_.extend(parsed,params);

		var fragment = '?' + _.map(parsed,function(val,key){
			return key + '=' + val;
		}).join('&');

		History.pushState({
				lang: language,
				page: params.page
			},
			appName +' | '+ title,
			fragment
		);
		document.querySelector('head>title').innerHTML = appName + ' | ' + title;
	});

	// helper to parse URL for a view
	Router.defineProp('parseUrlQueryString',function(){

		if(Modernizr.history){
			return utils.urlObject().searchObject;
		} else {
			var hash = window.location.hash
			.replace('#?','')
			.split('&');

			return _.reduce(hash,function(result,n){
				var param = n.split('=');
				result[param[0]] = param[1];
				return result;
			},{});
		}
	});

	// the meat
	Router.defineProp('route',function(page,silent){
		return new Promise(function(resolve,reject){
			var P = Page.get(page);
			var pageIsCurrent = (P === currentPage);

			Router.fire('routing:called');

			if(!P || pageIsCurrent) return resolve();
			silent || (silent = P.silent || false);

			if(enRoute || routingBlocked){
				var toQueue = {
					page: 		page,
					silent: 	silent,
					resolver: resolve
				};
				if(!_.contains(queuedRoutes,toQueue)){
					queuedRoutes.unshift(toQueue);
				} else{
					//return resolve();
				}
				return;
			}

			var isPrevious = (P.id == (History.savedStates[History.savedStates.length-1]||{data:{}}).data.page);
			if( isPrevious ){
				return P.frameWillLoad()
				.then(function(){
					Router.fire('routing:begin');
					enRoute = P;
					return P._queue();
				})
				.then(function(){
					if(currentPage){
						currentPage.elem.classList.add('frame-animating');
						return currentPage._exit();
					}
				})
				.then(function(){
					currentPage && currentPage.elem.classList.remove('frame-animating');
					return P._load();
				})
				.then(P.frameDidLoad)
				.then(function(){
					Router.fire('page:loaded');
					//previousPage = currentPage;
					currentPage = V;
					enRoute = null;
					App.set({
						pageID: 		P.id,
						pageTitle: 	P.title
					});
				})
				.then(function(){

					if(queuedRoutes.length >0){
						var next = queuedRoutes.shift();
						return Router.route(next.page,next.silent).then(next.resolver);
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

				return P.frameWillLoad()
				.then(function(){
					Router.fire('routing:begin');
					enRoute = P;
					if(currentPage) return currentPage._queue();
				})
				.then(function(){
					Router.fire('page:loading');
					return P._load();
				})
				.then(P.frameDidLoad)
				.then(function(){
					Router.fire('page:loaded');
					var previousPage = currentPage;
					currentPage = P;
					enRoute = null;
					if(!silent) Router.pushState({page: P.id});
					App.set({
						pageID: 		P.id,
						pageTitle: 	P.title
					});
					if(previousPage) return previousPage._exit();
				})
				.then(function(){

					if(queuedRoutes.length >0){
						var next = queuedRoutes.shift();
						return Router.route(next.page,next.silent).then(next.resolver);
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
											var page = Page.get(route);
											page && page.beforeLoad(deferred);
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
											var page = Page.get(route);
											page && page.onload(callback,argsArray);
										});
										return this;
									},
		// add a callback to be executed when the specified view finishes its exit animation
		onRouteDismissed: function(routes,callback,argsArray){
										_.isArray(routes)||(routes=routes.split(','));
										_.each(routes,function(route){
											route = route.trim();
											var page = Page.get(route);
											page && page.onExit(callback,argsArray);
										});
										return this;
									},
		lock: 				function(){
										routingBlocked = true;
										var key = this.guid({});
										routerKeys.push(key);
										return key;
		},
		unlock: 			function(key){
										_.pull(routerKeys,key);
										if(routerKeys.length === 0){
											routingBlocked = false;
											if(queuedRoutes.length > 0){
												var next = queuedRoutes.shift();
												Router.route(next.page,next.silent)
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

	Object.defineProperty(Page,'current',{
		get: function(){
			return currentPage;
		},
		configurable:false
	});




	// change the view with browser's forward/back buttons
	Router
	.any(stateChangeEvent,function(){
		this.route(this.parseUrlQueryString().page);
	})
	// ensure onscreen view keeps proper dimensions to proper dimensions
	.any('translated resize orientationchange',function(){
		currentPage && currentPage.setCanvasHeight();
	});


	Compiler
	.assign('[o-route]',function(el,routeName){

		// catch a click event from a child node
		el.addEventListener('click',function(e){
				//e.stopPropagation();
				//e.stopImmediatePropagation();
				//el.dispatchEvent(__.customEvent('octane:route',{bubbles:true}));
				Router.route(routeName);
		},false);

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
