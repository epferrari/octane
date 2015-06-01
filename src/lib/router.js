
	/**
	* @module Octane.Router
	*/

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
	var routingLocked = false;
	// track the number of times in a row unlocking failed
	var unlockAttempts = 0;
	var allowedAttempts = _octane.maxConsecutiveAllowedRouterUnlockAttemps || 10;
	// store routes called while another route is executing its loading animation
	var queuedPages = [];
	// the history stack of page views, separate of data state history
	var pageHistory = [];
	// keys which have locked the Router with Router.lock()
	var routerKeys = [];
	// collection of regexps and actions to call when a route matches
	var routes = [];
	// cache this
	var location = global.location;
	// are we on a local host?
	var localRouting = (location.protocol === "file:");
	// for HTML5 vs. HTML4 browsers
	var stateChangeEvent = historyAPI ? 'popstate' : 'hashchange';
	// variable used for the interval in .usePolling
	var poll;


	var Router = new OctaneBase();

	// Private, non-enumerable API

	/**
	* Remove the root from a URL, using Application webRoot or localRoot, if defined, depending on context
	* webRoot is defined as `appConfig.webRoot` in **Octane.initialize**, else defaults to `location.origin + '/' + location.pathname`
	* localRoot is defined as `appConfig.localRoot` in **Octane.initialize**, else defaults to local filepath up to 'index.html'
	*
	* @private
	* @static
	* @method _pruneRoot
	* @returns {string} the URL with root removed
	*/
	Router.defineProp('_pruneRoot',function(url){

		var root,localRoot;
		if(localRouting){
			localRoot = _octane.localRoot ? new RegExp('^.*'+_octane.localRoot) : /^(.*index.html)/;
			return url.replace(localRoot,'');
		} else {
			root = _octane.webRoot || location.origin+'/'+location.pathname;
			return url.replace(root,'');
		}
	});




	/**
	* Set the document title, call `history.pushState` and trigger popstate event in HTML5 browsers, or change hash in HTML4 browsers
	*
	* @private
	* @static
	* @method _pushState
	* @param {object} state An object representing the Application state
	* @param {string} title Set the document title and history entry title
	* @param {string} route Root-relative URL to be matched and executed by the Router
	*/
	Router.defineProp(false,'_pushState',function(state,title,route){
		document.title = title;
		if(historyAPI){
			history.pushState(_.merge({},state),title,route);
			Router.fire('popstate');
		} else {
			location.hash = route;
		}
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

		var path = Router._pruneRoot(url);
		var routesExecuted = _.map(routes,function(route){
			if(route.re.test(path)) {
				var params = path.match(route.re);
				params.shift();
				return route.fn.apply(Object.create(null),params);
			}
		});
		/*Promise.all(routesExecuted).then(function(result){
			if(result.length === 1){
				//only the page was matched, remove the rest of the route and rewrite URL
				var useHash = (!historyAPI || localRouting) ? '#' : '';
				var currentPage = Router.currentPage ? Router.currentPage.id : 'home' ;
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
		})
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
					resolver: resolve
				};
				if(!_.contains(queuedPages,toQueue)){
					queuedPages.unshift(toQueue);
				}
				return;
			}

			if( pageHistory[1] === requested ){
				// requested was the last page in the pageHistory deck, we need to onscreen it,
				// but queue it underneath the current page on the z-index.
				// first ensure all requested's predicates are met and before load promises are resolved
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
				// move the requested page from queued to active
				.then(function(exitedPg){
					exitedPg && exitedPg.elem.classList.remove('frame-animating');
					return requested._load();
				})
				// execute the page onload callbacks as promises
				.then(requested.frameDidLoad)
				// shift the exited page off the pageHistory deck, and the requested page, now loaded, is at the top again
				// fire page:loaded event for subscribers
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
					if(queuedPages.length >0){
						var nextPg = queuedPages.shift();
						return Router._loadPage(nextPg.id).then(nextPg.resolver);
					}
				})
				// resolve with the last page loaded, either the original requested, or the last loaded from the queue
				// fire routing:complete for any subscribers, like Modal, who is locked until the page routing process completes
				.then(function(lastLoadedPg){
					resolve(lastLoadedPg);
					Router.fire('routing:complete');
				})
				.catch(function(err){
					Router.log(err);
				});

			} else {
				// a new request, animate over the current page
				// first ensure all requested's predicates are met and before load promises are resolved
				return requested.frameWillLoad()
				.then(function(pgReady){
					Router.fire('routing:begin');
					pageAnimating = pgReady;
					if(Router.currentPage) return Router.currentPage._queue();
				})
				// load the requested page over the now-queued current page
				.then(function(){
					Router.fire('page:loading');
					return requested._load();
				})
				// execute the page onload callbacks as promises
				.then(requested.frameDidLoad)
				// unshift the pageHistory deck adding the requested page to the top
				// fire page:loaded event for subscribers
				.then(function(loadedPg){
					Router.fire('page:loaded');
					pageHistory.unshift(loadedPg);
					pageAnimating = null;
					App.set({
						pageID: 		loadedPg.id,
						pageTitle: 	loadedPg.title
					});
					// if there was a current before requested, take it from queued to exited
					// exectuting its onexit callbacks asyncronously as promises
					if(pageHistory[1]) pageHistory[1]._exit();
				})
				.then(function(){
					// cleanup any queued pages that were requested during this load,
					// returning THEIR resolver
					if(queuedPages.length >0){
						var nextPg = queuedPages.shift();
						return Router._loadPage(nextPg.id).then(nextPg.resolver);
					}
				})
				// resolve with the last page loaded, either the original requested, or the last loaded from the queue
				// fire routing:complete for any subscribers, like Modal, who is locked until the page routing process completes
				.then(function(lastLoadedPg){
					resolve(lastLoadedPg);
					Router.fire('routing:complete');
				})
				.catch(function(err){
					Router.log(err);
				});
			}
		});
	});

	// Public API
	Router.defineProp({


		/**
		* Determine hashing format and page from fragment, then send params to `Router._pushState`
		*
		* @public
		* @static
		* @method route
		* @param {string} route Root-relative URL fragment to be sent to `Router._pushState` and executed by `Router._executeRoute`
		*/
		route: function(route){

			route = Router._pruneRoot(route);

			var useHash = (!historyAPI || localRouting);
			var page;
			var pageExists;
			// !important: Router expects page is the first argument BEFORE the slash
			// if there is nothing before the slash, then page is assumed to be current page
			if(useHash){
				page = (route.match(/^#(.*?)(?=[\/]|$)/)||[])[1];
			} else {
				page = (route.match(/^(.*?)(?=[\/]|$)/)||[])[1];
			}

			if(!page){
				page = (useHash ? '#' : './') + (Router.currentPage ? Router.currentPage.id : 'home');
				route = route.replace(/^(.*?)(?=[\/]|$)/,page);
			} else if(page && !_octane.pages[page] ){
				alert('Page ' + page + ' does not exist!');
				page = (useHash ? '#' : './') + (Router.currentPage ? Router.currentPage.id : 'home');
				route = route.replace(/^(.*?)(?=[\/]|$)/,page);
			}

			var title = App.get('name') + ' | ' + utils.titleize(page);

			Router._pushState({},title,route);
		},



		/**
		* Add a route to be called when the URL changes
		*
		* @public
		* @static
		* @method
		* @param {regexp} pattern The regexp pattern that matches the route against a URL
		* @param {function} callback The callback to execute on a matching route, will be applied with the matched values of the route regexp
		* @returns {this} for method chaining
		*/
		add: function(pattern,callback){
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
				page && page.beforeLoad(predicate);
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
			if(unlockAttempts >= allowedAttempts){
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
					var next = queuedPages.shift();
					Router._loadPage(next.page)
						.then(next.resolver);
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
		* @method useBrowserEvents
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


	// Public Getters

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
	* @static
	* @returns {array} the array of queued pages
	* @static
	*/
	Router.defineGetter('queue',function(){
		return queuedPages;
	});

	Object.defineProperty(Page,'current',{
		get: function(){
			return pageHistory[0];
		},
		configurable:false
	});







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

				Router.route(route);

		},false);
	// route backwards using the browser's history, Router will take care of the rest
	}).assign('.o-back',function(el){
		el.addEventListener('click',function(e){
			History.go(-1);
		},false);
	});


	module.exports = Router;
