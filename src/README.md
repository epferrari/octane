#Octane.js



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
