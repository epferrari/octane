// JavaScript Document

octane.module('OctaneRouter',['OctaneViews']).extend({

		initialize : function (cfg) {

				// octane's own pushstate method
				var pushState = function (params){

						_.isObject(params) || (params = {});
						// update the language in the url
						var parsed = __.urlObject().searchObject;

						_.extend(parsed,params);

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

						var language = octane.Translator && octane.Translator.getLang();
						var title = __.titleize(params.view) || currentView.title;

						History.pushState(
								{ lang: language },
								octane.get('App.name') +' | '+ title,
								fragment
						);

						document.querySelector('head>title').innerHTML = octane.get('App.name')+' | '+title;
				}

				var enRoute = null;
				var routingBlocked = false;
				var currentView;                                    // pointer
				var queuedRoute = null;                             // store routes called while another route is executing its loading animation
				var routeConditions = {};                           // conditions under which a route should be called, added with .routeIf()

				var blockRouting = function(){                      // block routing, incoming routes go to queue
						routingBlocked = true;
				};

				var unblockRouting = function(){                    // release block and route from queue
						routingBlocked = false;

						if(queuedRoute){
								route(queuedRoute.view)
								.then(queuedRoute.resolver)
								.catch(function(ex){
										octane.log(ex);
								});
						}
				}

				var routeIf = function(viewID,conditions){           // add a condition that needs to be true for the route to run

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
						return octane;                                  // chainable
				};

				// add a deferred to execute before a view is routed
				var beforeRoute = function(viewID,deferred,argsArray){

						var view = octane.View.get(viewID);
						view && view.beforeLoad(deferred,argsArray);
						return octane;
				}

				// add a callback to be executed when the specified view finishes its loading animation
				var routeThen = function (viewID,callback,argsArray){

						var view = octane.View.get(viewID);
						view && view.onload(callback,argsArray);
						return octane;
				}

				// @param id [str]: id of the o-view to be called
				// @param silent: do not update the history with the view (default false)
				var route = function (viewID,silent){

						return new Promise(function(resolve,reject){


								var $view           = octane.View.get(viewID);
								var viewOnScreen    = ( $view == currentView   );
								var modalOnScreen   = octane.Modal.current;

								if(!$view) return resolve();

								silent || (silent = $view.silent || false);



						// ensure the onscreen view isn't reanimated
						//////////////////////////////////////////////////////////////////////////////////////
																																																//
																																																//
								if( viewOnScreen && modalOnScreen ){

										modalOnScreen.dismiss();
										resolve();

								} else if( !$view || ($view && viewOnScreen)){

										resolve();

								} else if (!viewOnScreen){

								// ensure a route isn't triggered while another route is animating
								// or while routing has been blocked by another module
								//////////////////////////////////////////////////////////////////////////
																																												//
																																												//

										if(!enRoute && !routingBlocked){

												if(!checkRouteIf(viewID)){
														reject('Routing condition not fulfilled for route "'+viewID+'"');
														return;
												}
												octane.fire('routing:begin');

												enRoute = viewID;


										// ensure exit of the current view before calling a new view
										//////////////////////////////////////////////////////////////
																																								//
												if(currentView){                                        //
														currentView._queueExit()                            //
																.then(function(){                               //
																		return loadView($view,silent,currentView);  //
																})                                              //
																.then(resolve)                                  //
																.catch(octane.log);                             //
												}else{                                                  //
														loadView($view,silent)                              //
																.then(resolve)                                  //
																.catch(octane.log);                             //
												}                                                       //
										//////////////////////////////////////////////////////////////

										} else {  // we are either enroute or routing is block, stick this view in the queue

												queuedRoute = { view : viewID, silent:silent, resolver : resolve };
										}                                                                                                                                                                                                                             //
																																												//
								//////////////////////////////////////////////////////////////////////////

								}                                                                               //
																																																//
						//////////////////////////////////////////////////////////////////////////////////////

						});
				}

				// helper
				function loadView($view,silent,previousView){

						octane.fire('view:loading');                            // event for any hooked listeners

						return $view._load()                                     // load the view
								.then(function(){

										octane.fire('view:loaded');                     // event for any hooked listeners

										!silent && pushState({view:$view.id});          // set the browser's history state

										currentView = $view;                            // update the current view

										octane.set({                                    // update App model
												"App.viewID" : $view.id,
												"App.viewTitle" : $view.title
										});

										previousView && previousView._exit();           // send previous view back into the hidden view stack hell from whence it came

										enRoute = null;                                 // flag this route complete

										if(queuedRoute){                                // check for queued routes

												var next = queuedRoute;
												return route(next.view,next.silent)         // route queued view, will fire routing:complete when it finishes
														.then(function(){
																next.resolver();
																queuedRoute = null;
														});

										} else {

												octane.fire('routing:complete');            // signal to any blockers listening that routing is now complete
										}
								 });
				}

				// helper
				function checkRouteIf(viewID){

						var
						conditions = routeConditions[viewID] || [],
						i=0,n=conditions.length,
						checkCondition = function(condition){

								if(condition.predicate()){
										// meets routing condition
										return true;
								}else{
										// does not meet routing condition, call fail callback
										_.isFunction(condition.onfail) && condition.onfail();
										return false;
								}
						};

						for(;i<n;i++){
								if (checkCondition(conditions[i])){
										continue;
								} else {
										return false;
								}
						}
						return true;
				}


				(function handleStateChange(){

						var
						html = document.getElementsByTagName('html')[0],
						history =  html && html.classList.contains('history'),
						stateChangeEvent = history ? 'popstate' : 'hashchange';

						// change the view with browser's forward/back buttons
						octane.handle(stateChangeEvent,function(){
								var view = getRequestedView();
								view && octane.route(view);
						});
				})();


				// parse URL for a view
				function getRequestedView(){

						// for HTML5 vs. HTML4 browsers
						// detect with modernizr
						var
						html = document.getElementsByTagName('html')[0],
						history =  html && html.classList.contains('history');

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



				octane.engrave({
						Router      : {},
						route       : function(viewID,silent){
														return route(viewID,silent).catch(function(ex){
																octane.log(ex);
														});
												},
						routeIf     : routeIf,
						beforeRoute : beforeRoute,
						routeThen	: routeThen,
						onroute     : routeThen
				});



				// Router Public API
				octane.engrave.apply(octane.Router,[{
						getUrlView      : getRequestedView,
						pushState		: pushState,
						lock            : blockRouting,
						unlock          : unblockRouting,
						before          : beforeRoute
				}]);



				// Router getters
				octane.defineGetter.apply(octane.Router,['isLocked',function(){
						return routingBlocked;
				}]);

				octane.defineGetter.apply(octane.Router,['queue',function(){
						return queuedRoute;
				}]);

				octane.defineGetter.apply(octane.View,['current',function(){
						return currentView;
				}]);




				// resize canvas to proper dimensions
				octane
						.handle('translated resize orientationchange',function(){
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
								octane.handle('octane:route',el,function(e,el){
										var route = el.getAttribute('o-route');
										octane.route(route);
								});
						})
						.compiler('.o-back',function(el){
								el.addEventListener('click',function(e){
										el.dispatchEvent(__.customEvent('octane:routeback',{bubbles:true}));
								},false);

								octane.handle('octane:routeback',el,function(){History.go(-1)});
						});
		} // end initialize
}); // end module
