// JavaScript Document
octane.module('OctaneRouter',['OctaneViews']).extend({

		initialize : function (cfg) {


				var enRoute = null;
				var routingBlocked = false;
				var currentView;                // pointer
				var queuedRoutes = [];          // store routes called while another route is executing its loading animation
				var routeConditions = {};       // conditions under which a route should be called, added with .routeIf()

				var beforeRoutes = {};
				var onRoutes = {};
				var afterRoutes = {};




				// use History.pushState
				function pushState (params){

						_.isObject(params) || (params = {});
						// update the language in the url
						var parsed = __.urlObject().searchObject;
						var language = octane.Translator && octane.Translator.getLang();
						var title = __.titleize(params.view) || currentView.title;

						_.extend(parsed,params);

						var fragment = '?'+_.map(parsed,function(val,key){
							return key+'='+val;
						}).join('&');

						/*
						var fragment = [];
						var parsedKeys = Object.keys(parsed);
						var k=parsedKeys.length;
						var key;
						while(k--){
							key = parsedKeys[k];
							fragment.push(key+'='+parsed[key]);
						}
						fragment = fragment.join('&');
						fragment = '?'+fragment;
						*/

						History.pushState(
								{
									lang: language,
									view: params.view
								 },
								octane.get('App.name') +' | '+ title,
								fragment
						);
						document.querySelector('head>title').innerHTML = octane.get('App.name')+' | '+title;
				}





				// parse URL for a view
				function getRequestedView(){

					// for HTML5 vs. HTML4 browsers
					// detect with modernizr
					var html = document.getElementsByTagName('html')[0];
					var history =  html && html.classList.contains('history');

					if(history){
						return __.urlObject().searchObject.view || false;
					} else {
						var hash = window.location.hash,
								param,
								parsed = {};

						(function (){
							hash = hash.replace('#?','');
							hash = hash.split('&');
							for(var i=0,n=hash.length;i<n;i++){
								param = hash[i].split('=');
								parsed[param[0]] = param[1];
							}
						 })();
						return parsed.view || false;
					}
				}




				// the meat
				function route(view,silent){

					var V = octane.View.get(view);
					var viewIsCurrent = (V === currentView);
					var modal = octane.Modal.current;

					if(modal) modal.dismiss();
					if(!V || viewIsCurrent) return Promise.resolve();
					silent || (silent = V.silent || false);

					if(enRoute || routingBlocked){
						var toQueue = {
							view:view,
							silent:silent
						};
						if(!_.contains(queuedRoutes,toQueue)) queuedRoutes.unshift(toQueue);
						return;
					}

					var isPrevious = (V.id == (History.savedStates[History.savedStates.length-1]||{data:{}}).data.view);
					if( isPrevious ){
						return V._runBeforeLoad()
						.then(function(){
								octane.fire('routing:begin');
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
						.then(V._runOnload)
						.then(function(){
							octane.fire('view:loaded');
							//previousView = currentView;
							currentView = V;
							enRoute = null;
							//if(!silent)pushState({view:V.id});
							octane.App.set({
								viewID: 		V.id,
								viewTitle: 	V.title
							});
						})
						.then(function(){
							if(queuedRoutes.length >0){
								var next = queuedRoutes.shift();
								return route(next.view,next.silent);
							}
						})
						.then(function(){
							octane.fire('routing:complete');
						})
						.catch(function(err){
							octane.log(err);
						});

					} else {

						return V._runBeforeLoad()
						.then(function(){
							octane.fire('routing:begin');
							enRoute = V;
							if(currentView) return currentView._queue();
						})
						.then(function(){
							octane.fire('view:loading');
							return V._load();
						})
						.then(V._runOnload)
						.then(function(){
							octane.fire('view:loaded');
							var previousView = currentView;
							currentView = V;
							enRoute = null;
							if(!silent)pushState({view:V.id});
							octane.App.set({
								viewID: 		V.id,
								viewTitle: 	V.title
							});
							if(previousView) return previousView._exit();
						})
						.then(function(){
							if(queuedRoutes.length >0){
								var next = queuedRoutes.shift();
								return route(next.view,next.silent);
							}
						})
						.then(function(){
							octane.fire('routing:complete');
						})
						.catch(function(err){
							octane.log(err);
						});
					}
				}



				(function handleStateChange(){

						var html = document.getElementsByTagName('html')[0];
						var history =  html && html.classList.contains('history');
						var stateChangeEvent = history ? 'popstate' : 'hashchange';

						// change the view with browser's forward/back buttons
						octane.on(stateChangeEvent,function(){
							route(getRequestedView());
						});
				})();





				octane.defineProp({
					Router: 			{},

					route: 				function(viewID,silent){
													return route(viewID,silent);
												},

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
													return octane;
												},

					// add a deferred to execute before a view is routed
					beforeRoute: 	function beforeRoute(routes,deferred){
													_.isArray(routes)||(routes=routes.split(','));
													_.each(routes,function(route){
														route = route.trim();
														var view = octane.View.get(route);
														view && view.beforeLoad(deferred);
													});
													return octane;

													//(beforeRoutes[viewID] || (beforeRoutes[viewID]=[])).push(deferred);
													//return octane;
												},
					// alias
					routeThen: 		function(){
													return this.onroute.apply(this,arguments);
												},
					// add a callback to be executed when the specified view finishes its loading animation
					onroute: 			function (routes,callback,argsArray){
													_.isArray(routes)||(routes=routes.split(','));
													_.each(routes,function(route){
														route = route.trim();
														var view = octane.View.get(route);
														view && view.onload(callback,argsArray);
													});
													return octane;
												},
					// add a callback to be executed when the specified view finishes its exit animation
					onRouteDismissed: function(routes,callback,argsArray){
													_.isArray(routes)||(routes=routes.split(','));
													_.each(routes,function(route){
														route = route.trim();
														var view = octane.View.get(route);
														view && view.onExit(callback,argsArray);
													});
													return octane;
												}
				});



				// Router Public API
				octane.defineProp.apply(octane.Router,[{
					getUrlView: 	getRequestedView,
					pushState: 		pushState,
					// block routing, incoming routes go to queue
					lock: 				function(){
													routingBlocked = true;
												},
					unlock: 			function(){
													routingBlocked = false;

													if(queuedRoutes.length >0){
														var next = queuedRoutes.shift();
														return route(next.view,next.silent);
													}
												}
				}]);



				// Router getters
				octane.defineGetter.apply(octane.Router,['isLocked',function(){
					return routingBlocked;
				}]);

				octane.defineGetter.apply(octane.Router,['queue',function(){
					return queuedRoutes;
				}]);

				octane.defineGetter.apply(octane.View,['current',function(){
					return currentView;
				}]);




				// resize canvas to proper dimensions
				octane
						.on('translated resize orientationchange',function(){
								currentView && currentView.setCanvasHeight();
						})
						.compiler('[o-route]',function(el){

							// catch a click event from a child node
							// re-purpose it to be used by the octane event mediator
							el.addEventListener('click',function(e){
									//e.stopPropagation();
									//e.stopImmediatePropagation();
									el.dispatchEvent(__.customEvent('octane:route',{bubbles:true}));
							},false);

							// set up the octane event mediator
							// so event won't get a second listener
							// if you call .compile() again after .initialize()
							octane.on('octane:route',el,function(e,el){
									var route = el.getAttribute('o-route');
									octane.route(route);
							});
						})
						.compiler('.o-back',function(el){
							el.addEventListener('click',function(e){
									el.dispatchEvent(__.customEvent('octane:routeback',{bubbles:true}));
							},false);

							octane.on('octane:routeback',el,function(){History.go(-1)});
						});
		} // end initialize
}); // end module
