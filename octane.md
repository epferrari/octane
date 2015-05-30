
# Octane

## A Lightweight App Development Framework

[Overview](#overview)

[Core API](#core-api)

[Models](#model-api)

[Controllers](#controller-api)

[Views ](#views-api)

[Routing](#routing)

[Modules](#modules)

[Octane Initialize](#octane-initialize)

[Dependencies](#dependencies)

### Why Octane
  
Octane was developed to provide a stepping stone into the world of frontend MV* frameworks, providing two-way data binding and a rudimentary router. Its aim was to be simple rather than robust, to solve problems like animating between views, binding a data layer with a view layer, and providing an environment that encourages separation of concerns.  For the most part though, Octane strives to stay out of the way, allowing you to access its model and controller structures when you need them, and write code your way everywhere else.

Be aware: you'll probably write a little more code with Octane than with some other frameworks, but that's part of the idea. We don't obfuscate everything to the point it feels like magic when you use Octane's models and methods. We want developers to still write javascript the way they want to, with the freedom to lean on Octane but not be confined by it. At the same time, Octane's open ended-interface allows you as a developer to extend core modules and new add modules as you see fit, incorporating the core model/view/controller/view-model system to accomplish your end goals. Ultimately, you're mostly writing your applications *your way*, not the Octane way.


### Overview

At its core, Octane is a model/view/controller/view-model (MVCVM) framework. The premise of any MV\* framework is to compartmentalize different roles of an application code. Each component of an MV\* have a specialized role, much like HTML, CSS, and javascript have separate functions on the DOM. Skip ahead for the [API reference](#api) or read on to learn how Octane's **model**, **view**, **controller**, and **view-model** components interact with the **Octane Circuit** and how Octane implements a its MV\* design pattern.

To get a good grasp on MV* and other Javascript design patterns, check out the free e-book [Learning Javascript Design Patterns][ref1] by Addy Osmani.

[ref1]: http://addyosmani.com/resources/essentialjsdesignpatterns/book/


#### The Octane Circuit

Octane's components are held together by the Circuit, a continuous loop of state monitoring, comparing, and updating that's triggered with any change to data bound between a **View** (DOM layer) and a **Model**.  This connection between the View and the Model is known as two-way data binding, and it's the most powerful weapon in an MV\*'s arsenal. In Octane, this loop can be triggered in two ways, each from opposite ends of the Circuit: one is in the **View Model**, whenever bound data is changed in the DOM by the user. This starts the Circuit's uptake channel, where data makes its way to the Model.  The other trigger is inside the Model itself, fired when its data is altered. This initiates the Circuit's outflow channel as the updated data makes its way back to the DOM for the user to see in the **View**.

DOM Elements are bound to a model's data via **View Models**, abstraction objects that handle the uptake and outflow of data between views and models. See [Octane DOM](#octane-dom) for how you can decalre that parts of your HTML views are to interact with Octane using `o-*` attributes and tags. 
	
---

#### Models

A Model holds the data that informs your application's views. Static content is still held in HTML, but view content that changes in response user interaction should be held in a Model. Models provide a centralized location for all data related to parts of your application.


<a class="btn btn-info pull-right" href="#models-api" role="button">using Models</a>

---

##### View Models

A View Model in Octane is actually initialized in tandem with each Model instance, but its purpose is different enough to warrant its own explanation. The View Model has one job and one job only: to keep the data in the view in sync with the Model's state at all times. This means when a user enters or selects information in the UI, the Model is updated. Conversely, if user-entered data is manipulated by the Controllers, hooks, or your application logic in any way, the View Model ensures that each view reflects that newly altered data syncronously.

In most cases, you won't interact with a View Model directly. It serves as an interface layer, performing its job silently in cooperation to your Controllers, Models, and Views, although it can be extended to encompass more complex logic for views that require it.

<a class="btn btn-info pull-right" href="#view-models-api" role="button">View Models</a>

---

#### Views

Views are the presentation layer, written in HTML and styled by CSS. In classic MV\ implementaions, a view has no logic within it. In Octane, this is mostly true, however Octane creates is a **View Object** for every DOM element you create with the `<o-view>` tag.

The View Object is has a very few methods, mostly to deal with animating itself in and out of the viewport. While Octane's [Router core module](#router) handles the logic for tasks like loading, unloading, and updating the history, the View object holds information about how each particular view should adhere to those tasks. Think of the View as the HTML, and the View Object as reference to the HTML stored in the Router.

<a class="btn btn-info pull-right" href="#views-api" role="button">writing Views</a>

---

#### Controllers

A Controller is the logic center of an MV* application. Whereas a Model holds application data, the Controller decides how that data is presented to the user. In Octane, the Controller also determines how data a user enters or chooses is related to other data. For example, a user's input in the application can trigger changes in the Model state data beyond it's own key. Or dragging a slider on one part of the screen could prompt a change in another part, without the two being explicitly tied to one another in the traditional manner. The funtionality implemented inside the controller is completely up to the developer, but we'll go into greater detail on where certain types of functionality fit into the uptake and outflow channels of the Circuit.

<a class="btn btn-info pull-right" href="#controllers-api" role="button">using Controllers</a>



# Octane Javascript API

### Core

-	[`.base`](#base)
-	[`.controller`](#controller)
-	[`.define`](#define)
-	[`.extend`](#extend)
-	[`.get`](#get)
-	[`.goose`](#goose)
-	[`.hasModule`](#has-module)
-	[`.jsonp`](#jsonp)
-	[`.model`](#model)
-	[`.module`](#module)
-	[`.set`](#set)
-	[`.trip`](#trip)
-	[`.xhr`](#xhr)

###### Events

-	[`.fire`](#fire)
-	[`.handle`](#handle)

###### Routing

-	[`.route`](#route)
-	[`.routeThen`](#route-then)
-	[`.routeIf`](#route-if)
-	[`.parseView`](#parse-view)
-	[`.pushState`](#push-state)
-	[`.view`](#view)
-	[`.currentView`](#current-view)

###### Templates

-	[`.template`](#template)
-	[`.addTemplate`](#add-template)

###### Libraries

-	[`.library`](#library)
-	[`.addLibrary`](#add-library)

### Models

-	[`.access`](#model-access)
-	[`.clear`](#model-clear)
-	[`.get`](#model-get)
-	[`.reScope`](#model-rescope)
-	[`.reset`](#model-reset)
-	[`.set`](#model-set)


### Controllers

-	[`.fetch`](#controller-fetch)
-	[`.filter`](#controller-filter)
-	[`.hook`](#controller-hook)
-	[`.parser`](#controller-parser)
-	[`.task`](#controller-task)

### Modules

-	[`.export`](#module-export)
-	[`.import`](#module-import)
-	[`.model`](#module-model)
-	[`.controller`](#module-controller)

### Modals

-	[`.call`](#modal-call)
-	[`dismiss`](#modal-dismiss)





## .extend ( extension [,overwrite] )

-	@param `extension` [ object ]
-	@param `overwrite` [ boolean ]

A basic extension method for Octane, Octane Modules, Model instances, and Controller instances. Supplement existing objects with new properties and methods. Pass `overwrite = true` to supplant existing properties or methods. **Note**: Attempting to overwrite a core property or method of an Octane object will result in a `TypeError`.

###### Example

		var $myModel = octane.model('myModel'}).extend({
			myNewFunc : function(){
				console.log('I'm a new instance method!');
			}
		});
		
		$myModel.myNewFunc(); // 'I'm a new instance method!'
		
###### Bad Example
	
		var 
		naughtyMethod = function(){
			console.log('Overwriting a core method, haha!');
		},
		$myModel = octane.model('myModel').extend({set:naughtyMethod},true);
	
		// TypeError: Cannot assign to read only property 'set'
	
## .define ( extension )

-	@param `extension` [ object ]

Uses `Object.defineProperty` to create read-only methods and properties. Used by Octane to keep its core methods intact, and is available to Modules, Model instances, and Controller instances as well. Use with care, as this limits the extensibility of your modules when implemented.

		octane.define({
			Boris : function(){
				console.log('I am invincible!')
			}
		});
		
		octane.Boris = function(){
			console.log('I'm frozen by liquid Nitrogen.')
		}
		
		octane.Boris();
		// 'I am invincible!' 


	

## .model ( name [,config] )

-	@param `name` [ string ] name for your model
-	@param `config` [ object ] `{ default:[object], db:[object] }`

Creates an Octane model instance, or return the named model. Pass the model's default state data with the optional config's `default` property. Pass the model's stateless resource data as config's `db` property.
Passing config params to an already instanced model will be ignored.

		var 
		startsWith = {
			favorite : 'Jurassic Park',
			genre	:	'awesome'
		},
		getMovies = function(){
			// run some async code
		},
		movies = getMovies();
		
		movies.then(function(result){
			octane.model('myMovies',{
				default : startsWith,
				db		: result
			});
		});
	
[model instance methods](#model-methods)

## .goose ( model, dirty )

-	@param `model` [ string ] the model to update with your data
-	@param `dirty` [ object ] data to update the model with

Similar to trip, but doesn't fire an event on an o-binded element to trigger the Circuit's uptake channel.


## .controller( model )

-	@param `model` [string] model name your controller interacts with

Creates an Octane controller instance, or returns a controller by the model name passed.

	octane.controller('myMovies');
	
[controller instance methods](#controller-methods)

## .handle ( event [,element], handler )

-	@param `event` [ string ]
-	@param `element` [ HTMLElement ]
-	@param `handler` [ object | function ]

Register an event listener for an event or comma separated list of events. Optionally pass a DOM element that should trigger event. The `handler` is either a function or an object that implements the EventTarget.handleEvent Interface. The event listener is bound to the `window` object rather than on individual elements, so it catches events as they bubble up through the DOM. If `handler` is an object implementing the `.handleEvent` method, `octane.handle()` delegates handling to the handler. If `elem` is passed, only executes the handler if the event's source is `elem`.

###### Example passing only a `handler`

		$myController.extend({
			getUsers : function(){
				// async code
			}
		});
		
		octane.handle('octane:ready',function(e){
			$myController.getUsers().then($myModel.process);
		});
		
###### Example passing an `element` and a `handler`

		$myController.extend({
			getUsers : function(){
				// async code
			}
		});
		
		var btn = document.getElementById('get-users');
		
		octane.handle('click',btn,function(e){
			$myController.getUsers().then($myModel.process);
		});


		
## .fire ( event [,detail] )

-	@param `event` [ string ]
-	@param `detail` [ string | object | array | number ]

Dispatch an event or custom event programmatically, optionally include custom data. Event is created with `useCapture: false` and `cancelable : false`.

		octane.fire('octane:ready',octane.parseView());
		
		octane.handle('octane:ready',function(e){
			octane.route(e.detail);
		});
		
		// this is used in octane.initialize() to route to the correct URL when a user opens the app



## .trip ( element )

-	@param `element` [ HTMLDocumentElement ]

Artificially start Octane's uptake channel by dispatching an event from the element, if the element has an `o-bind` attribute defined. Use in your code when you need to trigger the uptake circuit programmatically.

###### Try it
<label>Favorite Movie</label>
<input id="input1" o-bind="myMovies.favorite"/>
<span o-update="myMovies.favorite">Jurassic Park</span>

<button o-control="myMovies.switch">Titanic-ize</button>

###### HTML
		
		<label>Favorite Movie</label>
		<input id="input1" o-bind="myMovies.favorite"/>
		<span o-update="myMovies.favorite">Jurassic Park</span>
	
###### Javascript

		var 
		input1 = document.getElementById('input1'),
		myModel = octane.model('myMovies');
	
		input1.value = 'Titanic';
		octane.trigger(input1);
	
		myModel.get('favorite'); // 'Titanic'









## .module ( name [,dependencies], constructor)

#### Octane Your Way

Modules are how you'll primarily interact with Octane. While you *could* cook up all sorts of spaghetti on the global scope, it will be a pain to debug, your team will hate you, and your mother won't invite you for Christmas anymore. Solution? Use a module.
	
###### Simple Module
	
		octane.module('myModule',function(config){
			// your excellent code
		});


Octane modules are encouraged to be written in the **revealing module pattern**, discussed [here][crockford2] by Javascript pioneer [Douglas Crockford][crockford1]. A basic implementation:
	
###### Module implementing revealing module pattern 
		
		octane.module('myModule',function(config){
		
			var private : 'private property';
		
			function getPrivate(){
				console.log(private);
			}
		
			this.publicMethod = getPrivate;
		});
	
	octane.myModule.publicMethod(); // "private property"
	octane.myModule.getPrivate(); // Typeerror
	octane.myModule.private // undefined
	
###### Alternatively, using `.extend()`
	
	octane.module('myModule',function(config){
		
		var private : 'private property';
		
		function getPrivate(){
			console.log(private);
		}
		
		this.extend({
			publicMethod : getPrivate
		});
	});
	

Writing the module in this way allows you to present a public-facing API that is uncluttered by helper methods and variables. It also helps other developers using/extending your module from inadvertently deleting or overwriting a necessary part of your code.

As well as creating your own methods, Octane modules inherit the .model and .controller methods from the octane object itself. Why not just use `octane.model()` or `octane.controller()`? Binding your model and controllers to `this` inside your module namespaces them, which is effective as your application grows in size.
	
###### module implementing `.model()` and `.controller()`
		
		octane.model('notNamspaced');
	
		octane.module('myModule',function(config){
		
			var
			$model = this.model('namespaced'),
			$cntrl = this.controller('namespace');
		
			$cntrl.extend({
				//some new methods
			});	
		});
		
	octane.model('namespaced')		// > Model{name:"namespaced",context:"myModule module",...}
	octane.model('notNamespaced')	// > Model{name:"notNamespaced",context:"Application",...}
	
####Defining Module Dependencies

Any module that your module depends on must be listed as a dependency upon your module's declaration, which ensures modules are loaded in the right order when Octane initializes. 
	
###### Dependent Module
	
		octane.module(
			'myModule',
			['dependency1','dependency2'],
			function(config){
				// your code
		});

		
**Note:** Although intentionally similar to the AMD syntax, Octane's module dependency manager is strictly for modules written in the context of the Octane application using `octane.module()`. If your module is dependent on external modules/libraries (ex. jQuery Mobile), add those to your project's [bower.json][bower], load it via [AMD/Require.js][amd], or include it via script tag ahead of octane.js. \* **The AMD pattern will likely be implemented in a subsequent version of Octane, pending the state of ES6/Harmony's module loading spec.**



[amd]: http://addyosmani.com/writing-modular-js/
[bower]: http://bower.io
[crockford1]: http://www.crockford.com/
[crockford2]: http://javascript.crockford.com/private.html


# Octane DOM API

-	[`<o-container>`](#o-container)
-	[`<o-canvas>`](#o-canvas)
-	[`<o-view>`](#o-view)
-	[`<o-modal>`](#o-modal)
-	[`o-bind`](#o-bind)
-	[`o-update`](#o-update)
-	[`o-filter`](#o-filter)
-	[`o-config`](#o-config)



DOM Elements are bound to Models, and thus included in the circuit, by giving them an `o-bind` or `o-update` attribute. The `o-bind` attribute tells Octane to update a model when the value of the element changes, and to update the element's value when the model changes. For example, a text input element with an `o-bind` attribute would sync whatever a user types with the element's bound model key.

	<input type="text" o-bind="User.name"/>
	
The `o-update` attribute tells Octane to update a certain attribute of an element with data from a model's key when the model changes. The value passed to `o-update` can either be a simple string or stringified JSON. If passed a simple string, Octane will update the element's `innerHTML` with model data. If the attribute contains stringified JSON, the JSON is parsed for which of the element's attributes to update with model data.

As a string

	<p o-update="User.name"></p> 
	
	// update element's innerHTML with the User model's name property
	
As a JSON string
	
	<p o-update='{"text":"User.name","class":"User.klass"}'></p> 
	
	// update both the text and the class of the element from the model User







