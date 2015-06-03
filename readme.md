<a name="Octane.module_Router"></a>
## Router

* [Router](#Octane.module_Router)
  * [.add(pattern, callback)](#Octane.module_Router.add) ⇒ <code>this</code>
  * [.atRoot](#Octane.module_Router.atRoot) ⇒ <code>boolean</code>
  * [.beforePageLoad(page(s), deferred)](#Octane.module_Router.beforePageLoad) ⇒ <code>this</code>
  * [.clearRoutes()](#Octane.module_Router.clearRoutes)
  * [.currentPage](#Octane.module_Router.currentPage)
  * [.isLocked](#Octane.module_Router.isLocked) ⇒ <code>boolean</code>
  * [.lock()](#Octane.module_Router.lock) ⇒ <code>string</code>
  * [.mode](#Octane.module_Router.mode) ⇒ <code>object</code>
  * [.onPageExit(page(s), callback, [argsArray], [thisArg])](#Octane.module_Router.onPageExit) ⇒ <code>this</code>
  * [.onPageLoad(page(s), callback, [argsArray], [thisArg])](#Octane.module_Router.onPageLoad) ⇒ <code>this</code>
  * [.onUndefined()](#Octane.module_Router.onUndefined)
  * [.pageLoadIf(page(s), predicate)](#Octane.module_Router.pageLoadIf) ⇒ <code>this</code>
  * [.queue](#Octane.module_Router.queue) ⇒ <code>array</code>
  * [.remove(pattern)](#Octane.module_Router.remove)
  * [.route(route)](#Octane.module_Router.route)
  * [.routes](#Octane.module_Router.routes) ⇒ <code>array</code>
  * [.unlock(key)](#Octane.module_Router.unlock) ⇒ <code>boolean</code>
  * [.urlSearchObject()](#Octane.module_Router.urlSearchObject) ⇒ <code>object</code>
  * [.useBrowserEvents()](#Octane.module_Router.useBrowserEvents)
  * [.usePolling()](#Octane.module_Router.usePolling)


-

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


-

<a name="Octane.module_Router.atRoot"></a>
### Router.atRoot ⇒ <code>boolean</code>
Determine if the current location is the Application's root

**Kind**: static property of <code>[Router](#Octane.module_Router)</code>  
**Access:** public  
**Read only**: true  

-

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

-

<a name="Octane.module_Router.clearRoutes"></a>
### Router.clearRoutes()
Remove all routes from the Router

**Kind**: static method of <code>[Router](#Octane.module_Router)</code>  
**Access:** public  

-

<a name="Octane.module_Router.currentPage"></a>
### Router.currentPage
Get the current page of the Application

**Kind**: static property of <code>[Router](#Octane.module_Router)</code>  
**Access:** public  
**Read only**: true  

-

<a name="Octane.module_Router.isLocked"></a>
### Router.isLocked ⇒ <code>boolean</code>
Is the router locked?

**Kind**: static property of <code>[Router](#Octane.module_Router)</code>  
**Access:** public  
**Read only**: true  

-

<a name="Octane.module_Router.lock"></a>
### Router.lock() ⇒ <code>string</code>
Lock the Router

**Kind**: static method of <code>[Router](#Octane.module_Router)</code>  
**Returns**: <code>string</code> - A randomly generated key to unlock the router from __THIS__ lock. Other locks may still be in place.  
**Access:** public  

-

<a name="Octane.module_Router.mode"></a>
### Router.mode ⇒ <code>object</code>
Get the mode details of the application

**Kind**: static property of <code>[Router](#Octane.module_Router)</code>  
**Returns**: <code>object</code> - Returns an object with keys history, hash, and local. Values are booleans  
**Access:** public  
**Read only**: true  

-

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


-

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

-

<a name="Octane.module_Router.onUndefined"></a>
### Router.onUndefined()
Define a function to call in the event no routes exist on the specified path

**Kind**: static method of <code>[Router](#Octane.module_Router)</code>  
**Access:** public  

-

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


-

<a name="Octane.module_Router.queue"></a>
### Router.queue ⇒ <code>array</code>
Queued Pages waiting to load during a lock

**Kind**: static property of <code>[Router](#Octane.module_Router)</code>  
**Returns**: <code>array</code> - the array of queued pages  
**Access:** public  
**Read only**: true  

-

<a name="Octane.module_Router.remove"></a>
### Router.remove(pattern)
Remove a route from the array of saved routes

**Kind**: static method of <code>[Router](#Octane.module_Router)</code>  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| pattern | <code>regexp</code> | The pattern to remove |


-

<a name="Octane.module_Router.route"></a>
### Router.route(route)
Determine hashing format and page from fragment, then use history.pushState or hashchange to set the route

**Kind**: static method of <code>[Router](#Octane.module_Router)</code>  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| route | <code>string</code> | Root-relative URL fragment to be mapped by `Router._executeRoute` |


-

<a name="Octane.module_Router.routes"></a>
### Router.routes ⇒ <code>array</code>
List of routes registered with the Router

**Kind**: static property of <code>[Router](#Octane.module_Router)</code>  
**Returns**: <code>array</code> - the array of registered routes  
**Access:** public  
**Read only**: true  

-

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


-

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

-

<a name="Octane.module_Router.useBrowserEvents"></a>
### Router.useBrowserEvents()
Update App state on URL change. Turns off polling interval if set. Octane calls this during initilization, unless overridden by `appConfig.legacyRouting: true`.

**Kind**: static method of <code>[Router](#Octane.module_Router)</code>  
**Access:** public  

-

<a name="Octane.module_Router.usePolling"></a>
### Router.usePolling()
Set fallback to use polling in case popstate/hashchange is being finicky. Drops `popstate` or `hashchange` event listeners.

**Kind**: static method of <code>[Router](#Octane.module_Router)</code>  
**Access:** public  

-

