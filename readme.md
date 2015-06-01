<a name="Octane.module_Router"></a>
## Router

* [Router](#Octane.module_Router)
  * [.add(pattern, callback)](#Octane.module_Router.add) ⇒ <code>this</code>
  * [.beforePageLoad(page(s), deferred)](#Octane.module_Router.beforePageLoad) ⇒ <code>this</code>
  * [.currentPage](#Octane.module_Router.currentPage)
  * [.isLocked](#Octane.module_Router.isLocked) ⇒ <code>boolean</code>
  * [.loadPage(page)](#Octane.module_Router.loadPage) ⇒ <code>Promise</code>
  * [.lock()](#Octane.module_Router.lock) ⇒ <code>string</code>
  * [.onPageExit(page(s), callback, [argsArray], [thisArg])](#Octane.module_Router.onPageExit) ⇒ <code>this</code>
  * [.onPageLoad(page(s), callback, [argsArray], [thisArg])](#Octane.module_Router.onPageLoad) ⇒ <code>this</code>
  * [.pageLoadIf(page(s), predicate)](#Octane.module_Router.pageLoadIf) ⇒ <code>this</code>
  * [.pushState(state, title, route)](#Octane.module_Router.pushState)
  * [.queue](#Octane.module_Router.queue) ⇒ <code>array</code>
  * [.remove(pattern)](#Octane.module_Router.remove)
  * [.route(url)](#Octane.module_Router.route)
  * [.route(route)](#Octane.module_Router.route)
  * [.unlock(key)](#Octane.module_Router.unlock) ⇒ <code>boolean</code>
  * [.urlSearchObject()](#Octane.module_Router.urlSearchObject) ⇒ <code>object</code>


-

<a name="Octane.module_Router.add"></a>
### Router.add(pattern, callback) ⇒ <code>this</code>
Add a route to be called when the URL changes

**Kind**: static method of <code>[Router](#Octane.module_Router)</code>  
**Returns**: <code>this</code> - for method chaining  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| pattern | <code>regexp</code> | The regexp pattern that matches the route against a URL |
| callback | <code>function</code> | The callback to execute on a matching route, will be applied with the matched values of the route regexp |


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

<a name="Octane.module_Router.currentPage"></a>
### Router.currentPage
Get the current page of the Application

**Kind**: static property of <code>[Router](#Octane.module_Router)</code>  
**Access:** public  
**Read only**: true  

-

<a name="Octane.module_Router.isLocked"></a>
### Router.isLocked ⇒ <code>boolean</code>
Is the router locked or not?

**Kind**: static property of <code>[Router](#Octane.module_Router)</code>  
**Access:** public  
**Read only**: true  

-

<a name="Octane.module_Router.loadPage"></a>
### Router.loadPage(page) ⇒ <code>Promise</code>
Direct page loading and exit animations

**Kind**: static method of <code>[Router](#Octane.module_Router)</code>  
**Returns**: <code>Promise</code> - a thenable that the load animation sequence for all requested pages has completed  
**Access:** public  
**See**: OctanePage  

| Param | Type | Description |
| --- | --- | --- |
| page | <code>string</code> | The name of the page to be loaded |


-

<a name="Octane.module_Router.lock"></a>
### Router.lock() ⇒ <code>string</code>
Lock the Router

**Kind**: static method of <code>[Router](#Octane.module_Router)</code>  
**Returns**: <code>string</code> - A randomly generated key to unlock the router from __THIS__ lock. Other locks may still be in place.  
**Access:** public  

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

<a name="Octane.module_Router.pushState"></a>
### Router.pushState(state, title, route)
Set the document title, call `history.pushState` and trigger popstate event in HTML5 browsers, or change hash in HTML4 browsers

**Kind**: static method of <code>[Router](#Octane.module_Router)</code>  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| state | <code>object</code> | An object representing the Application state |
| title | <code>string</code> | Set the document title and history entry title |
| route | <code>string</code> | URL to be matched and executed by the Router |


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
### Router.route(url)
Apply the route logic to display correct Page and Application state when the URL changes, should not be called on its own, use `sendRoute` instead.

**Kind**: static method of <code>[Router](#Octane.module_Router)</code>  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | A URL to match against defined routes |


-

<a name="Octane.module_Router.route"></a>
### Router.route(route)
Determine hashing format and page from fragment, then send params to `Router.pushState`

**Kind**: static method of <code>[Router](#Octane.module_Router)</code>  
**Access:** public  

| Param | Type | Description |
| --- | --- | --- |
| route | <code>string</code> | Root-relative URL fragment to be sent to `Router.pushState` and executed by `Router.executeRoute` |


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

