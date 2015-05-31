	// reveal Modernizr on the global namespace
	require('../../vendor/modernizr.js');

	var _ 					= require('lodash');
	var Promise 		= require('bluebird');

	var OctaneBase 	= require('./OctaneBase.js');
	var Page 				= require('./OctanePage.js');
	var App			    = require('./app-model.js');
	var utils 			= require('./utils.js');
	var Compiler		= require('./Compiler.js');
	var _octane 		= require('./_octane.js');

	// HTML5 vs. HTML4 browsers
	var historyAPI = Modernizr.history;

	var pageAnimating = null;
	var routingBlocked = false;
	var currentPage;                																							// pointer
	var queuedPages = [];          																								// store routes called while another route is executing its loading animation
	var pageHistory = [];																													// the history stack of page views, separate of data state history
	var routerKeys = [];																													// keys which have locked the Router with Router.lock()
	var routes = [];																															// collection of regexps and actions to call when a route matches
	var location = global.location;
	var localRouting = (location.protocol === "file:"); 													// are we on a local host?
	var stateChangeEvent = historyAPI ? 'popstate' : 'hashchange';								// for HTML5 vs. HTML4 browsers
	var Router = new OctaneBase();

/*
	Router.defineGetter('currentPage',function(){
		return pageHistory[0];
	});
*/
	// helper to parse URL for a view
	Router.defineProp('parseUrlQueryString',function(){

		if(Modernizr.history){
			return utils.urlObject().searchObject;
		} else {
			var hash = window.location.hash
			.replace(/^(.*\?)/,'')
			.split('&');

			return _.reduce(hash,function(result,n){
				var param = n.split('=');
				result[param[0]] = param[1];
				return result;
			},{});
		}
	});

	Router.defineProp('pruneRoot',function(url){

		var root,localRoot;
		if(localRouting){
			localRoot = _octane.entryPoint ? new RegExp('^.*'+_octane.entryPoint) : /^(.*index.html)/;
			return url.replace(localRoot,'');
		} else {
			root = _octane.root || location.origin+'/'+location.pathname;
			return url.replace(root,'');
		}
	});

	Router.defineProp('pushState',function(state,title,route){
		document.title = title;
		if(historyAPI){
			history.pushState(_.merge({},state),title,route);
			Router.fire('popstate');
		} else {
			global.location.hash = route;
		}
	});



	Router.defineProp('route',function(path){

		path = Router.pruneRoot(path);
		_.each(routes,function(route){
			if(route.re.test(path)) {
				var params = path.match(route.re);
				params.shift();
				route.fn.apply(Object.create(null),params);
			}
		});
	});


	// direct the animation of frame loading
	Router.defineProp('loadPage',function(page,silent){
		return new Promise(function(resolve,reject){
			var P = Page.get(page);
			var pageIsCurrent = (P === currentPage);

			Router.fire('routing:called');

			if(!P || pageIsCurrent) {
				Router.fire('routing:complete');
				return resolve();
			}
			silent || (silent = P.silent || false);

			if(pageAnimating || routingBlocked){
				var toQueue = {
					page: 		page,
					silent: 	silent,
					resolver: resolve
				};
				if(!_.contains(queuedPages,toQueue)){
					queuedPages.unshift(toQueue);
				} else{
					//return resolve();
				}
				return;
			}

			if( pageHistory[1] === P.id ){
				return P.frameWillLoad()
				.then(function(){
					Router.fire('routing:begin');
					pageAnimating = P;
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
					pageHistory.shift();
					//previousPage = currentPage;
					currentPage = P;
					pageAnimating = null;
					App.set({
						pageID: 		P.id,
						pageTitle: 	P.title
					});
				})
				.then(function(){

					if(queuedPages.length >0){
						var next = queuedPages.shift();
						return Router.loadPage(next.page,next.silent).then(next.resolver);
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
					pageAnimating = P;
					if(currentPage) return currentPage._queue();
				})
				.then(function(){
					Router.fire('page:loading');
					return P._load();
				})
				.then(P.frameDidLoad)
				.then(function(){
					Router.fire('page:loaded');
					pageHistory.unshift(P.id);
					var previousPage = currentPage;
					currentPage = P;
					pageAnimating = null;
					//if(!silent) Router.pushState({page: P.id});
					App.set({
						pageID: 		P.id,
						pageTitle: 	P.title
					});
					if(previousPage) return previousPage._exit();
				})
				.then(function(){

					if(queuedPages.length >0){
						var next = queuedPages.shift();
						return Router.loadPage(next.page,next.silent).then(next.resolver);
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
		add: 					function(pattern,action){
			routes.push({
				re:pattern,
				fn:action
			});
			return this;
		},
		remove: 			function(pattern){
			_.each(routes,function(route){
				if(route.re === pattern){
					_.pull(routes,route);
				}
			});
		},
		// add a Promise that must resolve before a view is routed
		beforePageLoad: function (routes,deferred){
										_.isArray(routes)||(routes=routes.split(','));
										_.each(routes,function(route){
											route = route.trim();
											var page = Page.get(route);
											page && page.beforeLoad(deferred);
										});
										return this;
									},

		// add a callback to be executed when the specified view finishes its loading animation
		onPageLoad: 	function (routes,callback,argsArray){
										_.isArray(routes)||(routes=routes.split(','));
										_.each(routes,function(route){
											route = route.trim();
											var page = Page.get(route);
											page && page.onload(callback,argsArray);
										});
										return this;
									},
		// add a callback to be executed when the specified view finishes its exit animation
		onPageExit: 	function(routes,callback,argsArray){
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
											if(queuedPages.length > 0){
												var next = queuedPages.shift();
												Router.loadPage(next.page,next.silent)
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
		return queuedPages;
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
		this.route(global.location.href);
	})
	// ensure onscreen view keeps proper dimensions to proper dimensions
	.any('translated resize orientationchange',function(){
		currentPage && currentPage.setCanvasHeight();
	})

	// catch a click event from a child node
Compiler.assign('a.route',function(elem){
	elem.addEventListener('click',function(e){
			e.preventDefault();
			e.stopPropagation();
			e.stopImmediatePropagation();
			var route = this.getAttribute('href');
			var page;

			var useHash = (!historyAPI || localRouting);
			// !important: Router expects page is the first argument BEFORE the slash
			// if there is nothing before the slash, then page is assumed to be current page
			if(useHash){
				page = (route.match(/^#(.*?)(?=[\/]|$)/)||[])[1];
			} else {
				page = (route.match(/^(.*?)(?=[\/]|$)/)||[])[1];
			}

			if(!page){
				page = (useHash ? '#' : './') + currentPage.id;
				route = route.replace(/^(.*?)(?=[\/]|$)/,page);
			}

			var title = App.get('name') + ' | ' + utils.titleize(page);

			Router.pushState({},title,route);
	},false);
}).assign('.o-back',function(el){
		el.addEventListener('click',function(e){
				//el.dispatchEvent(__.customEvent('octane:routeback',{bubbles:true}));
				History.go(-1);
		},false);
	});


module.exports = Router;
