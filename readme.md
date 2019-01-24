
If you find yourself here in the hopes of using this as a framework, look elsewhere, as there are MUCH better alternatives. This is not scalable, not maintained, and never will be. Just a fun little experiment when I started programming and didn't know any better.

# Octane.js


###An MVCVM focused on UI Routing and Uni-directional Data Flow.

Octane aims to combine the traditional data objects you love from Backbone, the expressive DOM syntax of Angular, and the easy-to-reason-about uni-directional data flow of reactive programming, then wrap them in a package that's rewarding and easy to use from the start. It is a work in progress, and just as the demands on the applications we build are changing rapidly, so too will the Octane framework. However, it is my hope that the core API won't change significantly, only how it goes about its business behind the scenes. Today it has everything you need to build a small to medium sized application.

###Installation

	npm install octane --save

In your __index.js__ file, require Octane into your production project prebuilt (unminified) as a module with all its dependencies.

	var octane = require('octane');

Then use [Browserify](http://www.browserify.org) to bundle it with the rest of your package.



###Initialization

Octane does not initialize until you call `octane.initialize()`. The initializer method takes one parameter, a configuration for your application. It defines internal properties of such as the application's name, a webroot (if it's something other than `/`), and whether **debug mode** is on or off. Bonus, `octane.initialize()` returns a promise.

######index.js

	var octane = require('octane');

	octane.initialize({
		appName: 'My Awesome App',
		debugMode: true
	})
	.then(function(){
		...do stuff
	});

The list of current config options that are recognized by `octane.initialize()`:

- `appName` **string** - the name of your App, displayed in the document title along with the current page on each route.
- `env` **string** - set to "web" or "cordova". If your application expects to use the Apache's Cordova build platform for mobile devices, Octane will initialize certain internal listeners for the `ondeviceready` event, otherwise it will skip them.
- `webroot` **string** - if the path to your application is something other than `/`, define it here for proper routing.
- `local root` **string** - if your application is meant to run in the local filesystem, this is the name of the `.html` file that is home to your application's bundle. Default is `index.html`.
- `debugMode` **boolean** - if set to true, octane will expose itself as the variable `octane` in global scope, log errors, and give you access to the `octane.Reflection` object to view internal properties and hashes normally opaque. It also renders a debug bar at the bottom of the viewport that shortcuts common console logging functions.
- `animateBy` **string** - can be set to either "css" or "js". Default is "css".
- `maxRouterUnlockAttempts` - **int** the maximum number of times the `octane.Router.unlock()` method can be called unsuccessfully before locking out the routes altogether. Default is `10`. Prevents a brute force attack on routing to pages you don't want displayed. More on this in documentation to come soon.
- `legacyRouting` **boolean** - set to true to use polling instead of browser events `popstate` or `hashchange`. You can switch at any time by calling `octane.Router.usePolling()` and `octane.Router.useBrowserEvents()`.
- `pollingInterval` **int** - set the interval between poll the Router does on `window.location`, if using polling for routing. Default is 50 ms.

##Additional Resources

More markdown sugar is coming out of the oven on a daily basis, but in the mean time you can check the `docs` directory for annotated source code.

#API

<a name="Octane.module_Router"></a>
## Router

* [Router](#Octane.module_Router)
  * [.currentPage](#Octane.module_Router.currentPage)
  * [.atRoot](#Octane.module_Router.atRoot) ⇒ <code>boolean</code>
  * [.mode](#Octane.module_Router.mode) ⇒ <code>object</code>
  * [.isLocked](#Octane.module_Router.isLocked) ⇒ <code>boolean</code>
  * [.queue](#Octane.module_Router.queue) ⇒ <code>array</code>
  * [.routes](#Octane.module_Router.routes) ⇒ <code>array</code>
  * [.route(route)](#Octane.module_Router.route)
  * [.add(pattern, callback)](#Octane.module_Router.add) ⇒ <code>this</code>
  * [.remove(pattern)](#Octane.module_Router.remove)
  * [.clearRoutes()](#Octane.module_Router.clearRoutes)
  * [.pageLoadIf(page(s), predicate)](#Octane.module_Router.pageLoadIf) ⇒ <code>this</code>
  * [.beforePageLoad(page(s), deferred)](#Octane.module_Router.beforePageLoad) ⇒ <code>this</code>
  * [.onPageLoad(page(s), callback, [argsArray], [thisArg])](#Octane.module_Router.onPageLoad) ⇒ <code>this</code>
  * [.onPageExit(page(s), callback, [argsArray], [thisArg])](#Octane.module_Router.onPageExit) ⇒ <code>this</code>
  * [.lock()](#Octane.module_Router.lock) ⇒ <code>string</code>
  * [.unlock(key)](#Octane.module_Router.unlock) ⇒ <code>boolean</code>
  * [.usePolling()](#Octane.module_Router.usePolling)
  * [.useBrowserEvents()](#Octane.module_Router.useBrowserEvents)
  * [.urlSearchObject()](#Octane.module_Router.urlSearchObject) ⇒ <code>object</code>
  * [.onUndefined()](#Octane.module_Router.onUndefined)

<a name="Octane.module_Router.currentPage"></a>
### Router.currentPage
Get the current page of the Application

**Kind**: static property of <code>[Router](#Octane.module_Router)</code>  
**Access:** public  
**Read only**: true  
<a name="Octane.module_Router.atRoot"></a>
### Router.atRoot ⇒ <code>boolean</code>
Determine if the current location is the Application's root

**Kind**: static property of <code>[Router](#Octane.module_Router)</code>  
**Access:** public  
**Read only**: true  
<a name="Octane.module_Router.mode"></a>
### Router.mode ⇒ <code>object</code>
Get the mode details of the application

**Kind**: static property of <code>[Router](#Octane.module_Router)</code>  
**Returns**: <code>object</code> - Returns an object with keys history, hash, and local. Values are booleans  
**Access:** public  
**Read only**: true  
<a name="Octane.module_Router.isLocked"></a>
### Router.isLocked ⇒ <code>boolean</code>
Is the router locked?

**Kind**: static property of <code>[Router](#Octane.module_Router)</code>  
**Access:** public  
**Read only**: true  
<a name="Octane.module_Router.queue"></a>
### Router.queue ⇒ <code>array</code>
Queued Pages waiting to load during a lock

**Kind**: static property of <code>[Router](#Octane.module_Router)</code>  
**Returns**: <code>array</code> - the array of queued pages  
**Access:** public  
**Read only**: true  
<a name="Octane.module_Router.routes"></a>
### Router.routes ⇒ <code>array</code>
List of routes registered with the Router

**Kind**: static property of <code>[Router](#Octane.module_Router)</code>  
**Returns**: <code>array</code> - the array of registered routes  
**Access:** public  
**Read only**: true  
<a name="Octane.module_Router.route"></a>
### Router.route(route)
Determine hashing format and page from fragment, then use history.pushState or hashchange to set the route

**Kind**: static method of <code>[Router](#Octane.module_Router)</code>  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| route | <code>string</code> | Root-relative URL fragment to be mapped by `Router._executeRoute` |

<a name="Octane.module_Router.add"></a>
### Router.add(pattern, callback) ⇒ <code>this</code>
Add a route to be called when the URL changes

**Kind**: static method of <code>[Router](#Octane.module_Router)</code>  
**Returns**: <code>this</code> - for method chaining  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| pattern | <code>regexp</code> &#124; <code>string</code> | A regexp pattern that matches a route against a URL. If passed as a string, beginning and trailing slashes will be stripped before being added to the routes array. |
| callback | <code>function</code> | The callback to execute on a matching route, will be applied with the matched values of the route regexp |

<a name="Octane.module_Router.remove"></a>
### Router.remove(pattern)
Remove a route from the array of saved routes

**Kind**: static method of <code>[Router](#Octane.module_Router)</code>  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| pattern | <code>regexp</code> | The pattern to remove |

<a name="Octane.module_Router.clearRoutes"></a>
### Router.clearRoutes()
Remove all routes from the Router

**Kind**: static method of <code>[Router](#Octane.module_Router)</code>  
**Access:** public  
<a name="Octane.module_Router.pageLoadIf"></a>
### Router.pageLoadIf(page(s), predicate) ⇒ <code>this</code>
Add a predicate condition that must be true for a page(s) to load

**Kind**: static method of <code>[Router](#Octane.module_Router)</code>  
**Returns**: <code>this</code> - for method chaining  
**Access:** public  
**See**: OctanePage  

| Param | Type | Description |
| --- | --- | --- |
| page(s) | <code>string</code> &#124; <code>array</code> | The names of page(s) the condition should be evaluated for |
| predicate | <code>function</code> | A function that should return a truthy or falsy value |

<a name="Octane.module_Router.beforePageLoad"></a>
### Router.beforePageLoad(page(s), deferred) ⇒ <code>this</code>
Add a Promise that must resolve before a page (or pages) can load

**Kind**: static method of <code>[Router](#Octane.module_Router)</code>  
**Returns**: <code>this</code> - for method chaining  
**Access:** public  
**See**: OctanePage  

| Param | Type | Description |
| --- | --- | --- |
| page(s) | <code>string</code> &#124; <code>array</code> | The names of pages the condition should be evaluated for |
| deferred | <code>function</code> | A deferred function that will be wrapped in a Promise |

**Example**  
```js
Octane.Router.beforePageLoad('about',function(resove,reject){...});
```
<a name="Octane.module_Router.onPageLoad"></a>
### Router.onPageLoad(page(s), callback, [argsArray], [thisArg]) ⇒ <code>this</code>
Add a callback to the array of callbacks executed when a page has animated onscreen. Callbacks are wrapped in Promises at time of execution.

**Kind**: static method of <code>[Router](#Octane.module_Router)</code>  
**Returns**: <code>this</code> - for method chaining  
**Access:** public  
**See**: OctanePage  

| Param | Type | Description |
| --- | --- | --- |
| page(s) | <code>string</code> &#124; <code>array</code> | The names of pages the callback should execute for |
| callback | <code>function</code> | A callback to execute |
| [argsArray] | <code>array</code> | An array of arguments to be applied to the callback at execution |
| [thisArg] | <code>object</code> | The 'this' value of the callback at execution time, default is the Page object |

**Example**  
```js
// creates new Person with current values of Registrant ViewModel when page 'registrants' is loaded
Octane.Router.onPageLoad('registrants',
addNewPerson,
[octane.get('Registrant.name'),octane.get('Registrant.job')],
	Person);
```
<a name="Octane.module_Router.onPageExit"></a>
### Router.onPageExit(page(s), callback, [argsArray], [thisArg]) ⇒ <code>this</code>
Add a callback to the array of callbacks executed when a page has animated offscreen. Callbacks are wrapped in Promises at time of execution.

**Kind**: static method of <code>[Router](#Octane.module_Router)</code>  
**Returns**: <code>this</code> - for method chaining  
**Access:** public  
**See**: OctanePage  

| Param | Type | Description |
| --- | --- | --- |
| page(s) | <code>string</code> &#124; <code>array</code> | The names of pages the callback should execute for |
| callback | <code>function</code> | A callback to execute |
| [argsArray] | <code>array</code> | An array of arguments to be applied to the callback at execution |
| [thisArg] | <code>object</code> | The 'this' value of the callback at execution time, default is the Page object |

<a name="Octane.module_Router.lock"></a>
### Router.lock() ⇒ <code>string</code>
Lock the Router

**Kind**: static method of <code>[Router](#Octane.module_Router)</code>  
**Returns**: <code>string</code> - A randomly generated key to unlock the router from __THIS__ lock. Other locks may still be in place.  
**Access:** public  
<a name="Octane.module_Router.unlock"></a>
### Router.unlock(key) ⇒ <code>boolean</code>
Unlock the router from a calling of `Router.lock`.
If the Router is locked, then after X number of failed unlocked attempts in a row,
the Router will lock out and the Application will need to be restarted.
Number of attempts can be set at Octane.initialize via `appConfig.maxConsecutiveAllowedRouterUnlockAttemps`, or defaults to 10

**Kind**: static method of <code>[Router](#Octane.module_Router)</code>  
**Returns**: <code>boolean</code> - false if key is invalid or more locks remain, otherwise true and loads pages queued during lock  
**Throws**:

- <code>Error</code> thrown when the maximum number of consecutive failed unlocks is attempted. Router becomes permanently locked and Application will need restarted (prevent brute force unlocks)

**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | The key returned from `Router.lock` to unlock the lock it placed. Other locks may still be in place. |

<a name="Octane.module_Router.usePolling"></a>
### Router.usePolling()
Set fallback to use polling in case popstate/hashchange is being finicky. Drops `popstate` or `hashchange` event listeners.

**Kind**: static method of <code>[Router](#Octane.module_Router)</code>  
**Access:** public  
<a name="Octane.module_Router.useBrowserEvents"></a>
### Router.useBrowserEvents()
Update App state on URL change. Turns off polling interval if set. Octane calls this during initilization, unless overridden by `appConfig.legacyRouting: true`.

**Kind**: static method of <code>[Router](#Octane.module_Router)</code>  
**Access:** public  
<a name="Octane.module_Router.urlSearchObject"></a>
### Router.urlSearchObject() ⇒ <code>object</code>
Helper to parse URL's search string into an object

**Kind**: static method of <code>[Router](#Octane.module_Router)</code>  
**Returns**: <code>object</code> - an object of search parameters  
**Access:** public  
**Example**  
```js
Router.urlSearchObject("http://yoursite.com?pawns=5&kings=1")
=> {kings: 1, pawns: 5}
```
<a name="Octane.module_Router.onUndefined"></a>
### Router.onUndefined()
Define a function to call in the event no routes exist on the specified path

**Kind**: static method of <code>[Router](#Octane.module_Router)</code>  
**Access:** public  
