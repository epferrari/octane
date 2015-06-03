/*
* Copyright 2015 Ethan Ferrari, OneFire Media Inc.
*
*	Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*		http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*/



	/**
	* @module Octane.Router
	*/

	// reveal Modernizr on the global namespace
	require('../../vendor/modernizr.js');

	var _           = require('lodash');
	var Promise     = require('bluebird');

	var OctaneBase  = require('./OctaneBase.js');
	var Page        = require('./OctanePage.js');
	var App         = require('./app-model.js');
	var utils       = require('./utils.js');
	var Compiler    = require('./Compiler.js');
	var _octane     = require('./_octane.js');

	// HTML5 vs. HTML4 browsers
	var historyAPI        = Modernizr.history;
	// the page that is currently animating
	var pageAnimating     = null;
	var routingLocked     = false;
	// track the number of times in a row unlocking failed
	var unlockAttempts    = 0;

	// store routes called while another route is executing its loading animation
	var queuedPages       = [];
	// the history stack of page views, separate of data state history
	var pageHistory       = [];
	// keys which have locked the Router with Router.lock()
	var routerKeys        = [];
	// collection of regexps and actions to call when a route matches
	var routes            = [];
	// cache this
	var location          = global.location;
	// are we on a local host?
	var localRouting      = (location.protocol === "file:");
	// for HTML5 vs. HTML4 browsers
	var stateChangeEvent  = historyAPI ? 'popstate' : 'hashchange';
	// set the initial current route
	var currentRoute = location;
	// variable used for the interval in .usePolling
	var poll;

	// Singleton Router
	var Router = new OctaneBase();

	// Private, non-enumerable API

	/**
	* Remove the root from a URL, using Application webroot or localroot, if defined, depending on context
	* webroot is defined as `appConfig.webRoot` in **Octane.initialize**, else defaults to `location.origin`
	* localroot is defined as `appConfig.localroot` in **Octane.initialize**, else defaults to local filepath up to 'index.html'
	*
	* @private
	* @static
	* @method _getPath
	* @returns {string} the URL with root removed
	*/
	Router.defineProp('_getPath',function(url){

		var root,localroot;
		if(Router.mode.local){
			localroot =  Router.localroot ? new RegExp('^.*'+ Router.localroot+'(?:#\/|\/)') : /^.*index.html(?:#\/|\/)?/;
			return url.replace(localroot,'');
		} else {
			root = Router.webroot ? location.protocol + '//' + (Router.webroot) : location.origin + '/';
			return url.replace(root,'');
		}
	});




	/**
	* Set the document title, call `history.pushState` and trigger popstate event in HTML5 browsers, or change hash in HTML4 browsers
	*
	* @private
	* @static
	* @method _upateState
	* @param {object} state An object representing the Application state
	* @param {string} title Set the document title and history entry title
	* @param {string} route Root-relative URL to be matched and executed by the Router
	*/
	Router.defineProp(false,'_updateState',function(route){


	});



	/**
	* Apply the route logic to display correct Page and Application state when the URL changes, should not be called on its own, use `.route` instead.
	*
	* @private
	* @static
	* @method _executeRoute
	* @param {string} url A URL to match against defined routes
	*/
	Router.defineProp(false,'_executeRoute',function(url){
		currentRoute = url;
		var path = Router._getPath(url);

		var routesExecuted = _.chain(routes)
			.map(function(route){
				var matches;
				if(matches = path.match(route.re)) {
					matches.shift();
					return route.fn.apply(Object.create(null),matches);
				}
			})
			.compact()
			.value();

		if(!routesExecuted.length && !Router.atRoot) {
			Router.onUndefined && Router.onUndefined();
		}

		return Promise.all(routesExecuted);
		/*console.log(routesExecuted);
		if(routesExectuted.length === 0){
			Router.route('home');
		} else{
			Promise.all(routesExecuted).then(function(result){
				if(result.length === 1){
					//only the page was matched, remove the rest of the route and rewrite URL
					var useHash = (!historyAPI || localRouting) ? '#' : '';
					var currentPage = result[0] ? result[0].id : 'home' ;
					console.log(currentPage);
					var replacementUrl = useHash + currentPage;
					if(historyAPI){
						history.replaceState(history.state,document.title,replacementUrl);
					} else {
						location.hash = replacementUrl;
					}
				}
			}).catch(function(err){
				console.log('one of the routes failed');
			});
		}
		 /*else if(routesExecuted.length === 0){
			Router.route('home');
		}
		*/
	});



	/**
	* Direct page loading and exit animations. For internal use, use `.route` to load pages
	*
	* @see OctanePage
	* @private
	* @static
	* @method _loadPage
	* @param {string} page The name of the page to be loaded
	* @returns {Promise} a thenable that the load animation sequence for all requested pages has completed
	*/
	Router.defineProp(false,'_loadPage',function(page){
		return new Promise(function(resolve,reject){
			// the requested Page
			var requested = _octane.pages[page];
			var pageIsCurrent = (requested === Router.currentPage);

			Router.fire('routing:called');

			if(!requested || pageIsCurrent) {
				Router.fire('routing:complete');
				return resolve(requested);
			}

			// if the Router is busy or locked, send requested page to the queue with its resolver
			if(pageAnimating || routingLocked){
				var toQueue = {
					id: 			page,
					resolver: function(){
						resolve();
						return requested;
					}
				};
				if(!_.contains(queuedPages,toQueue)){
					queuedPages.unshift(toQueue);
				}
				return;
			}

			if( pageHistory[1] === requested ){
				// `requested` was the last page in the pageHistory deck, we need to onscreen it,
				// but queue it underneath the current page on the z-index.
				// First ensure all requested's predicates are met and before-load promises are resolved
				return requested.frameWillLoad()
				.then(function(pgReady){
					Router.fire('routing:begin');
					pageAnimating = pgReady;
					return pgReady._queue();
				})
				// now dismiss the current page
				.then(function(){
					var currentPage = Router.currentPage;
					if(currentPage){
						currentPage.elem.classList.add('frame-animating');
						return currentPage._exit();
					}
				})
				// move requested` queued to active
				.then(function(exitedPg){
					exitedPg && exitedPg.elem.classList.remove('frame-animating');
					return requested._load();
				})
				// execute the page onload callbacks as promises
				.then(requested.frameDidLoad)
				// shift the exited page off the pageHistory deck, and the requested page, now loaded, is at the top again.
				// Fire `page:loaded` event for subscribers
				.then(function(loadedPg){
					Router.fire('page:loaded');
					pageHistory.shift();
					pageAnimating = null;
					// set App model
					App.set({
						pageID: 		loadedPg.id,
						pageTitle: 	loadedPg.title
					});
					// cleanup any queued pages that were requested during this load
					if(queuedPages.length > 0){
						var nextPg = queuedPages.shift();
						return Router._loadPage(nextPg.id).then(function(){
							var next = nextPg.resolver();
							return next;
						});
					} else {
						return loadedPg;
					}
				})
				// reconcile any difference between the url and App pageHistory stack caused by hyper-clicking
				.then(function(lastLoadedPg){
					var urlPage = Router._parsePage(Router._getPath(location.href));
					if(urlPage !== lastLoadedPg.id) {
						return Router._loadPage(urlPage);
					} else{
						return lastLoadedPg;
					}
				})
				// Resolve with the last page loaded, either the original `requested`, or the last loaded from the queue.
				// Fire `routing:complete` for any subscribers, like Modal, who is locked until the page routing process completes.
				.then(function(lastLoadedPg){
					if(document && lastLoadedPg) document.title = App.get('name') + ' | ' + lastLoadedPg.title;
					resolve(lastLoadedPg);
					Router.fire('routing:complete');
				})
				.catch(function(err){
					Router.log(err);
				});

			} else {
				// A new request, animate over the current page.
				// First ensure all requested's predicates are met and before load promises are resolved.
				return requested.frameWillLoad()
				.then(function(pgReady){
					Router.fire('routing:begin');
					pageAnimating = pgReady;
					if(Router.currentPage) return Router.currentPage._queue();
				})
				// load `requested` over the now-queued current page
				.then(function(){
					Router.fire('page:loading');
					return requested._load();
				})
				// execute the page onload callbacks as promises
				.then(requested.frameDidLoad)
				// unshift the pageHistory deck adding the requested page to the top.
				// Fire page:loaded event for subscribers
				.then(function(loadedPg){
					Router.fire('page:loaded');
					pageHistory.unshift(loadedPg);
					pageAnimating = null;
					App.set({
						pageID: 		loadedPg.id,
						pageTitle: 	loadedPg.title
					});
					// if there was a current before requested, take it from queued to exited,
					// exectuting its onexit callbacks asyncronously as promises
					if(pageHistory[1]) pageHistory[1]._exit();
				})
				.then(function(){
					// cleanup any queued pages that were requested during this load,
					// returning THEIR resolver
					if(queuedPages.length >0){
						var nextPg = queuedPages.shift();
						return Router._loadPage(nextPg.id).then(function(){
							return nextPg.resolver();
						});
					} else {
						return requested;
					}
				})
				// reconcile any difference between the url and App pageHistory stack caused by hyper-clicking
				.then(function(lastLoadedPg){
					var urlPage = Router._parsePage(Router._getPath(location.href));
					if(urlPage !== lastLoadedPg.id) {
						return Router._loadPage(urlPage);
					} else {
						return lastLoadedPg;
					}
				})
				// resolve with the last page loaded, either the original `requested`, or the last loaded from the queue.
				// Fire `routing:complete` for any subscribers, like Modal, who is locked until the page routing process completes
				.then(function(lastLoadedPg){
					if(document && lastLoadedPg) document.title  = App.get('name') + ' | ' + lastLoadedPg.title;
					resolve(lastLoadedPg);
					Router.fire('routing:complete');
				})
				.catch(function(err){
					Router.log(err);
				});
			}
		});
	});



	/**
	* Parse requested page from a route, stripping it of its hash if present
	*
	* @private
	* @static
	* @method _parsePage
	* @param {string} route The route requested
	* @returns {string} the normalized name of the page
	*/
	Router.defineProp('_parsePage',function(route){
		var page;
		var useHash = (!historyAPI || localRouting);
		// !important: Router expects page is the first argument BEFORE the slash.
		// If there is nothing before the slash, then page is assumed to be current page
		if(useHash){
			page = (route.match(/^#?(.*?)(?=[\/]|$)/)||[])[1];
		} else {
			page = (route.match(/^(.*?)(?=[\/]|$)/)||[])[1];
		}
		return page;
	});

	Router.defineProp(false,'_stripSlashes',function(route){
		return route.replace(/^(\/)/,'').replace(/(\/)$/,'');
	});


	// Public API
	Router.defineProp({


		/**
		* Determine hashing format and page from fragment, then use history.pushState or hashchange to set the route
		*
		* @public
		* @static
		* @method route
		* @param {string} route Root-relative URL fragment to be mapped by `Router._executeRoute`
		*/
		route: function(route){

			route = Router._getPath(route);

			var rootRelRe = /^(?:#\/?|\/)(.*)/;
			var pathRelRe = /^(?:[.]\/)?(.*)/;
			var trailingRe = /(?:#\/|\/)$/;
			var path,match;

			if(localRouting || Router.mode.hash){
				if( route === '/' ){
					// path is the application root
					path = (localRouting ? location.pathname : '') + '#/';
				} else if(/^\.*$/.test(route)){
					// route to the root of current path
					var href = location.href;
					path = Router.atRoot ? href : href.replace(/^(.*\/)(.*)/,'$1');
				} else if( match = route.match(rootRelRe) ){
					// route was /xxx | #/xxx | #xxx, path is relative to application root
					match = Router._stripSlashes(match[1]);
					path = (localRouting ? location.pathname : '') + '#/' + match;
				} else if( match = route.match(pathRelRe) ){
					// route was ./xxx or xxx, path is relative to the current path
					var href = location.href.replace(trailingRe,'');
					var slash = Router.atRoot ? '#/' : '/';
					path = Router._stripSlashes(match[1] || '');
					path = href + slash + path;
				}
			} else {
				// strip any forward slash for historyAPI enabled browsers
				path = route.replace(/^(#)/,'');
			}

			// normalize any double slashes
			path = path.replace(/(\/){2,}/g,'$1');

			if(Router.mode.history){
				history.pushState(null,null,path);
				// fire popstate manually
				Router.fire('popstate');
			} else {
				location.hash = path;
			}
		},



		/**
		* Add a route to be called when the URL changes
		*
		* @public
		* @static
		* @method
		* @param {regexp|string} pattern A regexp pattern that matches a route against a URL. If passed as a string, beginning and trailing slashes will be stripped before being added to the routes array.
		* @param {function} callback The callback to execute on a matching route, will be applied with the matched values of the route regexp
		* @returns {this} for method chaining
		*/
		add: function(pattern,callback){
			_.isString(pattern) && (pattern = Router._stripSlashes(pattern));
			routes.push({
				re:pattern,
				fn:callback
			});
			return this;
		},



		/**
		* Remove a route from the array of saved routes
		*
		* @public
		* @name remove
		* @static
		* @method
		* @param {regexp} pattern The pattern to remove
		*/
		remove: function(pattern){
			_.each(routes,function(route){
				if(route.re === pattern){
					_.pull(routes,route);
				}
			});
		},

		/**
		* Remove all routes from the Router
		*
		* @public
		* @name clearRoutes
		* @static
		* @method
		*/
		clearRoutes: function(){
			routes = [];
		},



		/**
		* Add a predicate condition that must be true for a page(s) to load
		*
		* @see OctanePage
		* @public
		* @static
		* @method
		* @param {string|array} page(s) The names of page(s) the condition should be evaluated for
		* @param {function} predicate A function that should return a truthy or falsy value
		* @returns {this} for method chaining
		*/
		pageLoadIf: function(pageIds,predicate){
			_.isArray(pageIds)||(pageIds=pageIds.split(','));
			_.each(pageIds,function(pageId){
				pageId = pageId.trim();
				var page = _octane.pages[pageId];
				page && page.checkBeforeLoad(predicate);
			});
			return this;
		},



		/**
		* Add a Promise that must resolve before a page (or pages) can load
		*
		* @see OctanePage
		* @public
		* @static
		* @method
		* @param {string|array} page(s) The names of pages the condition should be evaluated for
		* @param {function} deferred A deferred function that will be wrapped in a Promise
		* @returns {this} for method chaining
		* @example Octane.Router.beforePageLoad('about',function(resove,reject){...});
		*/
		beforePageLoad: function (pageIds,deferred){
			_.isArray(pageIds)||(pageIds=pageIds.split(','));
			_.each(pageIds,function(pageId){
				pageId = pageId.trim();
				var page = _octane.pages[pageId];
				page && page.beforeLoad(deferred);
			});
			return this;
		},



		/**
		* Add a callback to the array of callbacks executed when a page has animated onscreen. Callbacks are wrapped in Promises at time of execution.
		*
		* @see OctanePage
		* @public
		* @static
		* @method
		* @param {string|array} page(s) The names of pages the callback should execute for
		* @param {function} callback A callback to execute
		* @param {array} [argsArray] An array of arguments to be applied to the callback at execution
		* @param {object} [thisArg] The 'this' value of the callback at execution time, default is the Page object
		* @returns {this} for method chaining
		* @example
		* // creates new Person with current values of Registrant ViewModel when page 'registrants' is loaded
		* Octane.Router.onPageLoad('registrants',
		* addNewPerson,
		* [octane.get('Registrant.name'),octane.get('Registrant.job')],
		*	Person);
		*/
		onPageLoad: function (pageIds,callback,argsArray,thisArg){
			_.isArray(pageIds)||(pageIds=pageIds.split(','));
			_.each(pageIds,function(pageId){
				pageId = pageId.trim();
				var page = _octane.pages[pageId];
				page && page.onload(callback,argsArray,thisArg);
			});
			return this;
		},



		/**
		* Add a callback to the array of callbacks executed when a page has animated offscreen. Callbacks are wrapped in Promises at time of execution.
		*
		* @see OctanePage
		* @public
		* @static
		* @method
		* @param {string|array} page(s) The names of pages the callback should execute for
		* @param {function} callback A callback to execute
		* @param {array} [argsArray] An array of arguments to be applied to the callback at execution
		* @param {object} [thisArg] The 'this' value of the callback at execution time, default is the Page object
		* @returns {this} for method chaining
		*/
		onPageExit: function(pageIds,callback,argsArray,thisArg){
			_.isArray(pageIds)||(pageIds=pageIds.split(','));
			_.each(pageIds,function(pageId){
				pageId = pageId.trim();
				var page = _octane.pages[pageId];
				page && page.onExit(callback,argsArray,thisArg);
			});
			return this;
		},



		/**
		* Lock the Router
		*
		* @public
		* @static
		* @method lock
		* @returns {string} A randomly generated key to unlock the router from __THIS__ lock. Other locks may still be in place.
		*/
		lock: function(){
			routingLocked = true;
			var key = this.guid({});
			routerKeys.push(key);
			return key;
		},



		/**
		* Unlock the router from a calling of `Router.lock`.
		* If the Router is locked, then after X number of failed unlocked attempts in a row,
		* the Router will lock out and the Application will need to be restarted.
		* Number of attempts can be set at Octane.initialize via `appConfig.maxConsecutiveAllowedRouterUnlockAttemps`, or defaults to 10
		*
		* @public
		* @static
		* @method
		* @param {string} key The key returned from `Router.lock` to unlock the lock it placed. Other locks may still be in place.
		* @returns {boolean} false if key is invalid or more locks remain, otherwise true and loads pages queued during lock
		* @throws {Error} thrown when the maximum number of consecutive failed unlocks is attempted. Router becomes permanently locked and Application will need restarted (prevent brute force unlocks)
		*/
		unlock: function(key){
			if(unlockAttempts >= _octane.maxRouterUnlockAttempts){
				// prevent brute force attack on unlock after 10 failed attempts
				var errorMessage = 'Router was locked permanently for too many failed unlock attempts. Please restart the Application.';
				alert(errorMessage);
				throw new Error(errorMessage);
				return false;
			}

			var lengthBeforePull = routerKeys.length;
			var lengthAfterPull = _.pull(routerKeys,key).length;

			// record attempt to use forged key
			if(routingLocked && lengthBeforePull === lengthAfterPull){
				unlockAttempts++;
				return false;
			} else {
				// key was ok, reset the attempts
				unlockAttempts = 0;
			}

			// unlock Router when all locks are removed, then route any queued Pages
			if(routerKeys.length === 0){
				routingLocked = false;
				if(queuedPages.length > 0){
					var nextPg = queuedPages.shift();
					Router._loadPage(nextPg.id)
						.then(nextPg.resolver);
				}
				return true;
			} else {
				return false;
			}
		},



		/**
		* Set fallback to use polling in case popstate/hashchange is being finicky. Drops `popstate` or `hashchange` event listeners.
		*
		* @public
		* @static
		* @method usePolling
		*/
		usePolling: function(){
			Router.forget(stateChangeEvent);
			var cachedURL = location.href;
			Router.checkURL = function(){
				if(location.href !== cachedURL){
					cachedURL = location.href;
					Router._executeRoute(location.href);
				}
				clearInterval(poll);
				poll = setInterval(Router.checkURL,50);
			}
			poll = setInterval(Router.checkURL,50);
		},



		/**
		* Update App state on URL change. Turns off polling interval if set. Octane calls this during initilization, unless overridden by `appConfig.legacyRouting: true`.
		*
		* @public
		* @static
		* @method useBrowserEvents
		*/
		useBrowserEvents: function(){
			clearInterval(poll);
			Router.any(stateChangeEvent,function(){
				Router._executeRoute(location.href);
			});
		},



		/**
		* Helper to parse URL's search string into an object
		*
		* @public
		* @static
		* @method urlSearchObject
		* @return {object} an object of search parameters
		* @example Router.urlSearchObject("http://yoursite.com?pawns=5&kings=1")
		* => {kings: 1, pawns: 5}
		*/
		urlSearchObject: function(){

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
		}
	});


	// Public Read Only Getters


	/**
	* Get the current page of the Application
	*
	* @name currentPage
	* @public
	* @static
	* @readonly
	*/
	Router.defineGetter('currentPage',function(){
		return pageHistory[0];
	});


	/**
	* Determine if the current location is the Application's root
	*
	* @name atRoot
	* @public
	* @static
	* @returns {boolean}
	* @readonly
	*/
	Router.defineGetter('atRoot',function(){
		var localroot,webroot;
		if(Router.mode.local){
			return !!location.href.match(new RegExp('^'+location.origin+location.pathname+'#?\/?$'));
		} else {
			webroot = Router.webroot || _octane.webroot || location.origin;
			return !!location.href.match(new RegExp('^'+ webroot + '\/?(?!\/)#?\/?$'));
		}
	});


	/**
	* Get the mode details of the application
	*
	* @name mode
	* @public
	* @static
	* @returns {object} Returns an object with keys history, hash, and local. Values are booleans
	* @readonly
	*/
	Router.defineGetter('mode',function(){
		return {
			history: historyAPI,
			hash: !historyAPI,
			local: localRouting
		}
	});


	/**
	* Is the router locked?
	*
	* @name isLocked
	* @readonly
	* @public
	* @static
	* @returns {boolean}
	*/
	Router.defineGetter('isLocked',function(){
		return routingLocked;
	});


	/**
	* Queued Pages waiting to load during a lock
	*
	* @name queue
	* @readonly
	* @public
	* @returns {array} the array of queued pages
	* @static
	*/
	Router.defineGetter('queue',function(){
		return queuedPages;
	});


	/**
	* List of routes registered with the Router
	*
	* @name routes
	* @readonly
	* @public
	* @returns {array} the array of registered routes
	* @static
	*/
	Router.defineGetter('routes',function(){
		return routes;
	});

	Object.defineProperty(Page,'current',{
		get: function(){
			return pageHistory[0];
		},
		configurable:false
	});

	/**
	* Define a function to call in the event no routes exist on the specified path
	*
	* @name onUndefined
	* @public
	* @static
	* @method
	*/
	Router.onUndefined = function(){
		alert('404: The page you\'re looking for doesn\'t exist. Routing back to safety...');
		history.go(-1);
	};




	// ensure onscreen view keeps proper dimensions to viewport
	Router.any('translated resize orientationchange',function(){
		Router.currentPage && Router.currentPage.setCanvasHeight();
	});


	Compiler
	// send routes to Router onclick
	.assign('a.route',function(elem){
		elem.addEventListener('click',function(e){
				e.preventDefault();
				e.stopPropagation();
				e.stopImmediatePropagation();
				var route = this.getAttribute('href');

				if(location.href !== this.href) Router.route(route);

		},false);
	// route backwards using the browser's history, Router will take care of the rest
	}).assign('.o-back',function(el){
		el.addEventListener('click',function(e){
			history.go(-1);
		},false);
	});


	module.exports = Router;
