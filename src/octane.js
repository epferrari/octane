	/* ------------------------------------------------------- */
	/*                 OCTANE MVC FRAMEWORK                    */
	/* ------------------------------------------------------- */

										// @author Ethan Ferrari
										// ethanferrari.com/octane
										// onefiremedia.com
										// version 0.0.6
										// April 2015











	(function($,_,__){

			 'use strict';

				if(!_) {
						throw new Error('Cannot run Octane. A Lodash (_) compatible utility library is not present. ');
						return false;
				}
				if(!__) {
						throw new Error('Cannot run Octane. The doubleUnder (__) utility library not present. ');
						return false;
				}
				if(window.octane) {
						throw new Error('Variable "octane" was already defined in global scope. Will be overwritten.');
				}










	/* ------------------------------------------------------- */
	/*                         BASE                            */
	/* ------------------------------------------------------- */










				function OctaneBase(){}




				OctaneBase.prototype = {
					extend: 	function(ext){
											return _.extend(this,ext);
										}
				};







				Object.defineProperty(OctaneBase.prototype,'Base',{
					value: 			function(){return new OctaneBase();},
					writable: 	false,
					configurable: false
				});

				// quick method to define immutable properties
				Object.defineProperty(OctaneBase.prototype,'defineProp',{
					value: 			function (isWritable,prop,val){

												if(_.isBoolean(arguments[0])){
													isWritable = arguments[0];
													prop = arguments[1];
													val = arguments[2];
												} else {
													// if no writable definition is passed, read first argument as prop
													prop = arguments[0];
													val = arguments[1];
													// default to non-writable
													isWritable = false;
												}

												switch(true){
													case _.isObject(prop):
														var keys = Object.keys(prop);
																							var key;

														for (var i=0,n = keys.length; i<n; i++){
															key = keys[i];
															try{
																Object.defineProperty(this,key,{
																	value : prop[key] ,
																	configurable : false,
																	writable: isWritable,
																	enumerable: true
																});
															} catch(ex){
																Octane.log(ex)
															}
														}
														break;
													case _.isString(prop):
														try{
															Object.defineProperty(this,prop,{
																value : val,
																configurable : false,
																writable : isWritable,
																enumerable:true
															});
														} catch(ex){
															Octane.log(ex);
														}
														break;
												}
												return this; // chainable
											},
					writable: 	false,
					configuarable: false
				});

				Object.defineProperty(OctaneBase.prototype,'defineGetter',{
						value : 	function(name,getter){
												Object.defineProperty(this,name,{
													get: getter,
													configurable : false
												})
											},
						writable: false,
						configurable: false
				});

				Object.defineProperty(OctaneBase.prototype,'defineSetter',{
						value: 		function(name,setter){
												Object.defineProperty(this,name,{
													set: setter,
													configurable : false
												})
											},
						writable: false,
						configurable: false
				});

				Object.defineProperty(OctaneBase.prototype,'accessors',{
						value: 		function(name,pair){
												Object.defineProperty(this,name,{
													get : pair.get,
													set : pair.set,
													configurable: false
												})
											},
						writable: false,
						configurable: false
				});








		/* ------------------------------------------------------- */
		/*        PUBLIC & PRIVATE APPLICATION OBJECTS             */
		/* ------------------------------------------------------- */










				var _octane = new OctaneBase();
				var Octane = new OctaneBase();
				Octane.initialized = false;










		/* ------------------------------------------------------- */
		/*                       GUID                              */
		/* ------------------------------------------------------- */










				// set a unique identifier for the DOM element so we don't double count it
				Octane.defineProp({
					GUID: 			function(){
												var random4 = function() {
														return (((1 + Math.random()) * 0x10000)|0).toString(16).substring(1).toUpperCase();
												};
												return random4() +'-'+ random4() +'-'+ random4() + random4();
											},

					guid: 			function(obj){

												if(!_.isObject(obj)) return;
												if(obj.octaneID) return obj.octaneID;

												var random4 = function() {
													return (((1 + Math.random()) * 0x10000)|0).toString(16).substring(1).toUpperCase();
												};

												Object.defineProperty(obj,'octaneID',{
													value : random4() +'-'+ random4() +'-'+ random4() + random4(),
													writable : false,
													configurable : false,
													enumerable : false
												});
												if(obj.setAttribute) obj.setAttribute('octane-id',obj.octaneID);
												return obj.octaneID;
											}
				});










		/* ------------------------------------------------------- */
		/*       COMPILER, ORDINANCES, AND DESIGNATE HOOK          */
		/* ------------------------------------------------------- */










				var Compiler = {

					ordinances: {},
					nodeMap: 		{},
					designate: 	function(selector,task){

												var guid = Octane.guid(task);
												var ords = this.ordinances;
												(ords[selector]||(ords[selector]={}))[guid] = task;
											},

					applyOrdinance:function(context,selector){

												if(!selector){
														selector = context;
														context = document;
												}
												var tasks = this.ordinances[selector];

												return new Promise(function(resolve,reject){
													_.each(context.querySelectorAll(selector),function(elem,index){

														var guid = Octane.guid(elem);
														var tasks	 = this.ordinances[selector];

														_.each(tasks,function(task,taskId){

															var ordValue; // the value of a selector's attribute, ex o-sync="ordValue"
															var map = this.nodeMap;

															// task has already been run, return early
															if((map[guid]||{})[taskId]) return;

															// pass the value of the ordinance to the task
															// *if the ordinance is an attribute, selected by wrapped []
															var ord = selector.match(/\[(.*)\]/);
															_.isArray(ord) && (ord = ord[1]);
															ordValue = elem.getAttribute(ord);

															try{
																// run the task
																task(elem,ordValue);
																// set hashed taskId to true so it doesn't re-run on the same element
																(map[guid]||(map[guid]={}))[taskId] = true;
															} catch (ex){
																Octane.log(ex);
															}
															elem = null;
														},Compiler);
													},Compiler);
													resolve();
												});
											},

					run: 				function(context){

												context || (context = document);

												var tasksCompleted = (Object.keys(this.ordinances)).map(function(selector){
														return this.applyOrdinance(context,selector);
												}.bind(this));

												return Promise.all(tasksCompleted);
											}
				};




				Octane.defineProp({

					compiler: 	function(selector,task){
												Compiler.designate.apply(Compiler,[selector,task]);
												return Octane;
											},

					// alias of .compiler
					designate: 	function(selector,task){
												Compiler.designate.apply(Compiler,[selector,task]);
												return Octane;
											},

					recompile: 	function(context){
												return Compiler.run.apply(Compiler,[context]);
											},

					clearCompileCache: function(){
												Compiler.nodeMap = {};
											}
				});










		/* ------------------------------------------------------- */
		/*                        PROMISES                         */
		/* ------------------------------------------------------- */







				Octane.defineProp({
					promisify: 	function(deferred){
												var args = Array.prototype.slice.call(arguments,1);
												return new Promise(function(resolve,reject){
													deferred.apply(deferred,args).then(resolve,reject);
												});
											}
				});










		/* ------------------------------------------------------- */
		/*                   ERRORS & LOGGING                      */
		/* ------------------------------------------------------- */










				_octane.logfile = [];




				Octane.defineProp({

					log: 				function(message,error){

												if(!Octane.hasModule('Debug')) return; // not in development, do not log

												if(arguments.length === 1 && _.isObject(message)){
													error = message;
													message = 'No additional context provided';
												}
												 _octane.logfile.push([message,(error||{})]);
											},

					error: 			function(message){
													throw new Error(message);
											}
				});











		/* ------------------------------------------------------- */
		/*                     XMLHttpRequest                      */
		/* ------------------------------------------------------- */










				function uriEncodeObject(source){

					source = _.isObject(source) ? source : {};

					var keys = Object.keys(source);
					var n = keys.length;
					var array = [];

					while(n--) {
					 array.push(encodeURIComponent(keys[n]) + "=" + encodeURIComponent(source[keys[n]]));
					}

					return array.join("&");
				}




				function http(url,method,data,headers){
					return new Promise(function(resolve,reject){

							var encoded = uriEncodeObject(data);
							var _headers = {
								'Content-Type':'application/x-www-form-urlencoded'
							};
							var request = new (window.XMLHttpRequest || window.ActiveXObject)("MSXML2.XMLHTTP.3.0");

							_.extend(_headers,headers);

							request.onreadystatechange = function(){
								var response;
								if(this.readyState === 4){
									switch(this.status){
										case 200 :
											try {
												response = JSON.parse(request.responseText);
											} catch(ex){
												response = this.responseText;
											}
											resolve(response);
											break;
										case 404 :
											reject('The server responded with 400 not found');
											break;
										case 500 :
											reject('An internal server error occurred');
											break;
									}
								}
							};

							request.open(method,url,true);

							_.each(_headers,function(val,header){
								request.setRequestHeader(header,val);
							});

							request.send(encoded);
					});
				}




				function Http(url,headers){
					this.url = url;
					this.headers = _.isObject(headers) ? headers : {};
				}




				Http.prototype = new OctaneBase;
				Http.prototype.defineProp({

					get: 				function(){
												return http(this.url,'GET',null,this.headers);
											},
					post: 			function(data){
												return http(this.url,'POST',data,this.headers);
											},
					put: 				function(data){
												return http(this.url,'PUT',data,this.headers);
											},
					delete: 		function(){
												return http(this.url,'DELETE',null,this.headers);
											}
				});




				Octane.defineProp({
					http: 			function(url,headers){
													return new Http(url,headers);
											}

				});








		/* ------------------------------------------------------- */
		/*                        FACTORIES                        */
		/* ------------------------------------------------------- */









				// prototype chaining Backbone.js style
				var extend = function extend(){

					var className,config,staticMethods,ParentFactory,parentDefaults,Factory,_Factory;

					if(__.typeOf(arguments[0]) == 'string'){
							className = arguments[0];
							config = arguments[1] || {};
							staticMethods = arguments[2] || {};
					}else{
							config = arguments[0] || {};
							staticMethods = arguments[1] || {};
					}

					ParentFactory = this;
					parentDefaults = ParentFactory.prototype.defaults || {};

					if(config.constructor != Object && _.isFunction(config.constructor)){
							Factory = config.constructor;
					} else {
							Factory = function(){
									return ParentFactory.apply(this,arguments);
							};
					}

					_.extend(Factory,ParentFactory,staticMethods);

					_Factory = function(){ this.constructor = Factory; };
					_Factory.prototype = ParentFactory.prototype;
					Factory.prototype = new _Factory;

					// ensure prototyp has a defaults object
					Factory.prototype.defaults = {};
					_.extend(Factory.prototype, config);
					_.extend(Factory.prototype.defaults, parentDefaults, config.defaults);

					Factory.__super__ = ParentFactory.prototype;

					return Factory;
				}




				// a factory for creating constructor functions
				// that can inherit from each other
				// imbued with the static methods define and extend that cannot be overwritten
				var Factory = function(){
						this.initialize.apply(this,arguments);
				};




				Factory.prototype = new OctaneBase;
				Factory.prototype.initialize = function(){};
				Factory.prototype.defaults = {};
				Octane.defineProp.apply(Factory,[{
						defineProp : function(){
							Octane.defineProp.apply(this,arguments);
							return this;
						}
				}]);




				Octane.defineProp({ Factory : Factory });












		/* ------------------------------------------------------- */
		/*                          EVENTS                         */
		/* ------------------------------------------------------- */










				//var customEvent = function




				// Decorator for Application Object, Views, Frames, and anything else that needs its own event cache
				var EventDelegation = {

					init: 			function(){

												var eventMap = {}; // set up an event map for the 'this' binding's object
												this._delegatingEvents = [];

												Octane.defineGetter.call(this,'Events',function(){
													return eventMap;
												});
												Octane.defineGetter.call(this,'_sub',function(){
													return (this.elem || window);
												});
												Octane.defineGetter.call(this,'_pub',function(){
													return (this.elem || window);
												});

												this.clearEventCache = function(){
													eventMap = {};
												};

												return this;
											},

					on: 				function(type,src,handler){

												var types = type ? type.split(' ') : [];
												var n			= types.length;
												var a 		= arguments.length;
												var evt,guid;

												if(a!==3){
													if(a === 2){
														handler = src;
														src = this._pub;
													}else{
														return;
												}}
												guid = Octane.guid(src);

												while(n--){this._addHandler(types[n],guid,handler);}
												return this; // chainable
											},

					delegate: 	function(e){

												var elem 			= e.target || e.srcElement;
												var id 				= elem.octaneID;
												var events		= this.Events;
												var eType			= e.type;
												var handlers 	= events[id] ? events[id][eType] : [];

												var execute = function execute(handler,elem,e){
													var h=__.typeOf(handler);
													if(h==='function'){
														try{ handler(e,elem);}
														catch(ex){ Octane.log('Error calling handler ' + eType + ' during event delegation',ex) }
													}else if(h==='object'){
														try{ handler.handleEvent(e,elem);}
														catch(ex){ Octane.log('Error calling handleEvent for ' + eType + ' during event delegation',ex) }
													}
												};
												_.each(handlers,function(handler){
														execute(handler,elem,e);
												});
											},

					_addHandler:function (eType,guid,handler){
													var events = this.Events;
													((events[guid]||(events[guid]={}))[eType]||(events[guid][eType]=[])).push(handler);
													if(!_.contains(this._delegatingEvents,eType)){
														this._delegatingEvents.push(eType);
														this._sub.addEventListener(eType,this.delegate.bind(this),false);
													}
											},

					unhandle: 	function(eType,elem,handler){

													var n = arguments.length;
													var events = this.Events;
													if(n === 3){																									// targeted removal of a single event handler from an object
														try{
															_.pull(events[elem.octaneID][eType],handler);
														}catch(ex){
															Octane.log('Error removing handler ' +handler+' for '+eType+' from element '+ elem,ex);
														}
													} else if (n === 2){																					// remove all handlers for a single event type from an object
														try{
															events[elem.octaneID][eType] = null;
														}catch(ex){
															Octane.log('Error removing handlers for '+eType+' from element '+ elem,ex);
														}
													} else if (n === 1){
														switch( true ){
															case (__.typeOf(eType) == 'string'):												// remove all event handlers of a type from the global scope
																events[this._sub.octaneID][eType] = null;
																break;

															case (_.isObject(eType) && eType.octaneID):									// remove all event handlers from an object
																events[eType.octaneID] = null;
																break;
														}
													}
													return this;
											},

					fire: 			function(eType,detail){

													if(_.isString(eType)){
														var e = detail ? __.customEvent(eType,detail) : __.createEvent(eType);
														this._pub.dispatchEvent(e);
													}
											},

					// programatically alert that user data has changed on a data-bound element
					trip: 			function(elem,eType){

													var rand = Math.random();
													var	e = __.customEvent((eType || 'input'),{bubbles:true,detail:rand});
													elem.dispatchEvent(e);
											}
				};

				Octane.extend(EventDelegation).init();









		/* ------------------------------------------------------- */
		/*                       DICTIONARIES                      */
		/* ------------------------------------------------------- */










				_octane.dicts = {};

				Octane.defineProp({

					Dictionary : {

						create: 	function(name,data){

												if(_.isObject(data) && !_octane.dicts[name]){
													_octane.dicts[name] = data;
													octane.fire('created:dictionary:'+name);
													return Octane;
												} else {
													Octane.log('could not create dictionary '+name+'.')
												}
											},

						get: 			function(name){
												return new Promise(function(resolve){
													var dict = _octane.dicts[name];

													if(dict){
														resolve(dict)
													} else {
														octane.on('created:dictionary:'+name, function(e){
															resolve(_octane.dicts[name]);
														});
													}
												});
											}
					}
				});








		/* ------------------------------------------------------- */
		/*                       TEMPLATES                         */
		/* ------------------------------------------------------- */










				_octane.templates = {};




				function Template(elem){
					if(!elem) return;
					this.id = elem.getAttribute('name') || elem.octaneID || Octane.guid(elem);
					this.markup = elem.innerHTML;
					this.content = '';
					this.parent = elem.parentElement;
				}




				// static methods
				_.extend(Template,{

					get: 				function(id){

												if(_octane.templates[id]){
													return _octane.templates[id];
												} else {
													Octane.log('Template ' +id+ ' does not exist');
													return this.create();
												}
											},

					create: 		function(elem){
												return new Template(elem);
											},

					fromString: function(name,string){

												if(!string) {
													string = name;
													name = undefined;
												}
													var div = document.createElement('div');
													div.name = name;
													div.innerHTML = string;
													return new Template(div);
											},

					parse: 			function (template,data){

												_.isString(template) || (template = ''),
												_.isObject(data) || (data = {});

												var pattern = /\{\{([^{^}]+)\}\}/g;
												var matches = template.match(pattern);
												var n;

												if(_.isArray(matches)){
														n = matches.length;
														while(n--){
																template = this._interpolate(template,matches[n],data);
														}
												}
												return template;
											},

					_interpolate: function (template,match,data){


												// begin: {{postedBy.firstName @filter:myFilter(param) @default(value)}}
												var stripped = match.replace(/[{}]+/g,'');
													// ^result: postedBy.firstName @filter:myFilter(param) @default(value)
												var split = stripped.split(/\s/);
													// ^result: ["postedBy.firstName","@filter:myFilter","@default(value)"]
												var key = split.shift();
													// ^result: "postedBy.firstName"
												var modifiers = split.join(' ');
													// ^result: "@filter:myFilter(param) @default(value)"
												var filterString 	= (modifiers.match( /@filter:(?=([^\s]+))/ ) || ['',''])[1];
													// ^result: "myFilter(param)"
												var filter				= (filterString.match( /^([^(]+)/ )  || ['',''])[1];
													// ^result: "myFilter"
												var filterParams 	= (filterString.match( /\((.*)\)/ ) || ['',''])[1];
													// ^result: "param"
												var defaultValue = (modifiers.match( /@default\((?:(.*))\)/ ) || ['',''])[1];
													// ^result: "value"
												var nested = key.split('.');
													// result: ["postedBy","firstName"]
												var n = nested.length;

												var value = nested.reduce(function (prev,curr,index){
														if(index == (n-1) && _.isObject(prev)){ 								// last iteration
															 return prev[curr]; 																	// return value
														}
														if(_.isObject(prev)){
																return prev[curr]; 																	// go one level deeper
														} else {
																return null; 																				// no further nesting, value defined in key does not exist
														}
												},data) ||''; 																							// start with data object passed to template

												if(!value && defaultValue.length >0){
													value = defaultValue;
												}
												// apply filter if present
												// filter is applied to this arg with val and model properties set
												if(filter.length > 0){
													var paramsArray = filterParams.split(',');

													if(_octane.filters[filter]){
															value = _octane.filters[filter].apply({input:value,model:data},paramsArray);
													} else if(_.isFunction(''[filter])){
															value = ''[filter].apply(value,paramsArray);
													} else if(_.isFunction(__[filter])){
															value = __[filter](value,params);
													}
												}

												// replace all occurences of {{postedBy.firstName @filter:myFilter @param:myParam}}
												// in template with filtered value of data.postedBy.firstName,
												// or data.postedBy.firstName if "myFilter" didn't exist
												return  template.replace(match,(value || ' '));
											},

					compile: 		function(scope){

												scope || (scope = document);

												var tmpls = scope.querySelectorAll('script[type="text/octane-template"],o-template');
												var t = tmpls.length;

												while(t--){
													this._cache(tmpls[t]);
												}
											},

					_cache: 		function(elem){

												if(elem){
														// compile nested templates
														this.compile(elem);
														var tmp = this.create(elem);
														tmp.save();
														elem.parentElement.removeChild(elem);
												}
											},


					_render: 		function (template,elem,method){

												if(template.content == '') template.content = template.markup;

												// a surrogate
												var div = document.createElement('div');
												var firstChild = elem.firstChild;
												var content = template.content;
												var nodes,swatch;

												// turn surrogate html into nodes
												div.innerHTML = content;
												div.normalize();
												nodes = div.childNodes;

												if(method === 'prepend'){
													var i=0,n=nodes.length,node;
													for(;i<n;i++){
															node = nodes[i];
															if(node && node.nodeType == (Node.ELEMENT_NODE || Node.TEXT_NODE)){
																	elem.insertBefore(node,firstChild);
															}
													}
												}else if(method === 'append'){
													var i=0,n=nodes.length,node;
													for(;i<n;i++){
															node = nodes[i];
															if(node && node.nodeType == (Node.ELEMENT_NODE || Node.TEXT_NODE)){
																	elem.appendChild(nodes[i]);
															}
													}
												} else {
													elem.innerHTML = content;
												}
												Octane.recompile(elem);
											},

					prototype: 	new OctaneBase
				});





				// instance methods
				Template.prototype.defineProp({

					set: 				function(data){
												this.content = Template.parse(this.markup,data);
												return this; // chainable
											},
					mount: 			function(target){
												Template._render(this,target,'replace');
											},
					prependTo: 	function(target){
												Template._render(this,target,'prepend');
											},
					appendTo: 	function(target){
												Template._render(this,target,'append');
											},
					save: 			function(){
												if(!_octane.templates[this.id]){
													_octane.templates[this.id] = this;
												}else{
													Octane.log('Could not create template '+this.id+'. Already exists');
												}
											},
					append: 		function(){
												var parent = this.parent;
												if(parent instanceof HTMLElement){
													 this.appendTo(parent);
												}
											},
					prepend: 		function(){
												var parent = this.parent;
												if(parent instanceof HTMLElement){
													 this.prependTo(parent);
												}
											},

				});




				Octane.defineProp({ Template : Template });











		/* ------------------------------------------------------- */
		/*                      VIEW MODEL                         */
		/* ------------------------------------------------------- */


				var uptake = function(e,el){

					var model			= el.getAttribute('o-model');
					var binding 	= el.getAttribute('o-bind');
					var value;

					// if o-bind is the only attribute, use it as binding,
					// otherwise o-bind is a key of the o=model attribute
					model && (binding = model + '.' + binding);

					if(el.type === 'file'){
						value = el.files;
					}else if(el.type === 'checkbox'){
						value = el.checked;
					}	else if(el.tagName === 'TEXT-AREA'){
						value = el.innerHTML;
					} else{
						(value = el.value);
					}

					if( value !== Octane.get(binding) ){
						Octane.set(binding,value);
					}
				};


				Octane.compiler('[o-bind]',function(elem,binding){

					Octane.on('input click select',elem,uptake);

					if(_.contains( ['file','checkbox'] ,elem.type)){
						Octane.on('change',elem,uptake);
					} else {
						Octane.task(binding,function(value){
							elem.value = value || '';
						});
					}
				});



				/* experimental */

				function OctaneElement(t,a,c){
					this.type 		= t || 'span';
					this.attrs 		= a || {};
					this.children = c || [];
				}
				_.extend(OctaneElement.prototype,{
					render: 		function(){
												var el = document.createElement(this.type);
												_.each(this.children,function(child){
													if(_.isString(child)){
														el.innerHTML = el.innerHTML+child;
													} else if(child instanceof OctaneElement){
														el.appendChild(child.render());
													} else if(child instanceof OctaneComponent){
														Octane.render(child,el);
													} else if(child instanceof HTMLElement){
														el.appendChild(child);
													}
												});
												if(this.attrs.styles){
													_.each(this.attrs.styles,function(val,key){
														el.style[key] = val;
													});
												}
												_.extend(el,this.attrs);
												return el;
											}
				});

				Octane.createElement = function(type,attrs,children){
					return new OctaneElement(type,attrs,children);
				};





				function OctaneComponent (params){

					_.extend(this,params);
					this.props = {};
					this.state = {};
					//Octane.guid(this);

					this._renderedTo = null;

					Octane.defineProp.call(this,{
						update: 	function(){
												if(this.hasMounted) Octane.render(this,this._renderedTo);
											},
						setState: function(obj){
												_.extend(this.state,obj);
												if(this.hasMounted) this.update();
											}
					});

					Octane.defineGetter.call(this,'Node',
											function(){
												if(this._renderedTo){
													return this._renderedTo.querySelector('[octane-id="'+this.octaneID+'"]');
												}
											});
				}

				_.extend(OctaneComponent.prototype,{
					render: function(){},
					getInitialState: function(){},
					beforeMount: function(){
						return Promise.resolve();
					},
					onMount: function(){},
					onUnmount: function(){}
				});



				Octane.Component = function(params){
					var factory = function ComponentFactory(props){
						var cmp = new OctaneComponent(params);
						_.extend(cmp.props,props);
						return cmp;
					};
					factory.create = function(props){
						var cmp = new OctaneComponent(params);
						_.extend(cmp.props,props);
						return cmp;
					};
					return factory;
				};


				Octane.render = function(Component,container){

					var newRender;
					var lastRender = Component.Node;
					if(lastRender){
						newRender = Component.render();
						if(newRender instanceof OctaneElement) newRender = newRender.render();
						newRender.setAttribute('octane-id',Component.octaneID);
						Component._renderedTo.replaceChild(newRender,lastRender);
					} else {
						Component._renderedTo = container;
						Component.getInitialState();
						Component.beforeMount().then(function(){
							newRender = Component.render();
							if(newRender instanceof OctaneElement) newRender = newRender.render();
							Component.octaneID = octane.guid(newRender);
							container.appendChild(newRender);
							Component.hasMounted = true;
							Component.onMount();
						});
					}
				};

				/* end experimental */



				var ViewModel = Object.create(OctaneBase.prototype);
				ViewModel.extend({

					init: 			function(elem){
												this.elem = elem;
												Octane.guid(this);
												this.elem.setAttribute('octane-id',this.octaneID);
												this.template = Octane.Template.fromString(this.elem.outerHTML);
												var binding = elem.getAttribute('o-model');
												this.accessors('model',{
													get : function(){ return binding;},
													set : function(alias){
														binding = alias;
														this.attachHandlers();
														this.render();
													}
												});

												this.attachHandlers();
												this.render();
											},

					attachHandlers: function(){
												var subBinding;
												(this.model || '').split('.').reduce(function(o,x,i){
													subBinding = (i === 0) ? x : o+'.'+x;
													// set handler for each state change in a subBinding
													Octane.on('statechange:'+subBinding,function(){
														this.render();
													}.bind(this));
													return subBinding;
												}.bind(this),'');
											},

					render: 		function(data){
												data = (data || Octane.get(this.model));
												this.elem.classList.remove('view-active');
												this.elem.outerHTML = this.template.set(data).content;
												this.elem = document.querySelector('[octane-id="'+this.octaneID+'"]');
												this.elem.classList.add('compiled',"view-active");
												Octane.recompile(this.elem.parentElement);
											}
				});




				var Mediator = Object.create(OctaneBase.prototype);


				Mediator.defineProp({

					init: 			function(){
												this.registry = {};
												this.rescope();
												return this;
											},

					// find bound elements on the DOM
					parse: 			function(scope){

												scope = (scope || document).querySelectorAll('[o-model]');
												var n = scope.length;
												var vm;

												while(n--){
													vm = Object.create(ViewModel);
													vm.init(scope[n]);
													this.registry[vm.octaneID] = vm;
												}
											},


					// fire statechange on all bound models, updating the entire DOM
					// fired once at Mediator initialization
					// expensive, should be avoided unless absolutely necessary
					rescope: 		function(scope){
												this.parse(scope);
												var n = Object.keys(_octane.models).length;
												while(n--){
													Octane.fire('statechange:'+models[n]);
												}
											},

					// integrate a Backbone compatible Model into Octane's view binding circuit
					link: 			function(model,alias){

												// protected via closure
												var _alias = null;


												// save original methods
												model.__legacy__ = {
														set 	: model.set,
														get 	: model.get,
														clear : model.clear
												}


												// getter
												if(!model.hasOwnProperty('alias')){
													Octane.defineGetter.apply(model,['alias',
														function(){
															return _alias;
														}]);
												}


												// attach to an alias for data-binding to views
												_.extend(model,{
														become : function(alias){
																this.detach();  // make sure we're detached from one Mediator reference before binding to another
																_octane.models[alias] && _octane.models[alias].detach();
																_octane.models[alias] = this;
																_alias = alias;
																Octane.fire('statechange:'+alias);
																return this;
														},
														detach : function(){
																var alias = this.alias;
																if( alias ){
																		_octane.models[alias] = null;
																		_alias = null;
																		Octane.fire('statechange:'+alias);
																}
																return this;
														},
														set : function(){
																OctaneModel.set.apply(this,arguments);
														},
														get : function(){
																this.state = this.attributes;
																return OctaneModel.prototype._get.apply(this,arguments);
														},
														clear: function(options) {
																var attrs = {};
																for (var key in this.attributes) attrs[key] = void 0;
																return this.set(attrs, _.extend({}, options, {unset: true}));
														},
														original : function(){

																//var clone = _.clone(this);
																var ctx = this.constructor;
																var clone = new ctx();
																clone.set(this.attributes);
																_.extend(clone,this,this.__legacy__);
																var remove = ['__legacy__','become','detach','original'];
																//_.extend(clone,clone.__legacy__);
															 _.each(remove,function(method){
																	 delete clone[method];
																});
																return clone;
														}

												});
												if(alias) model.become(alias);
												return model;
											},
					unlink: 		function(){
												return this.discard.apply(this,arguments);
											},

					// remove an assumed Backbone-type Model
					discard: 		function(binding){

												var model = _octane.models[binding];
												if(model){
													if(model.__legacy__){
															model.set = model.__legacy__.set;
															model.get = model.__legacy__.get;
															model.clear = model.__legacy__.clear;
													}
													model.alias && model.detach();

													// remove all traces of the intregration
													delete model.become;
													delete model.detach;
													delete model.__legacy__;

													return model;
												}
											},

					get: 				function(binding){
												return _octane.models[binding];
											}

				});






				Octane.defineProp({
					Mediator: 		Mediator,
					link: 			function(){
												return Octane.Mediator.link.apply(Mediator,arguments);
											},
					unlink: 		function(){
												return Octane.Mediator.unlink.apply(Mediator,arguments);
											}
				});










		/* ------------------------------------------------------- */
		/*                         MODELS                          */
		/* ------------------------------------------------------- */










				_octane.models = {};




				// base Model factory
				function OctaneModel(data){

					// private
					var _alias	= null;
					var queue = [];
					this.className = this.className || 'OctaneModel';
					Octane.guid(this);

					this.accessors('queue',{
						set:function(pair){
							queue.push(pair);
						},
						get:function(){
							return queue.pop();
						}
					});
					this.defineGetter('alias',
						function(){
							return _alias;
						});

					this.extend({
							state : {},
							become : function(alias){
								var models = _octane.models;
								models[alias] && models[alias].detach();
								models[alias] = this;
								_alias = alias;
								Octane.fire('statechange:'+alias);
								return this;
							},
							detach : function(){
									var alias = this.alias;
									if( alias ){
											_octane.models[alias] = null;
											_alias = null;
											Octane.fire('statechange:'+alias);
									}
									return this;
							}
					});
					// set defaults from prototype
					this.set(this.defaults);
					// overwrite with data passed to constructor
					this.set(data);
					this.initialize && this.initialize.apply(this,arguments);
				}




				// static methods
				Octane.defineProp.call(OctaneModel,{

					// static factory
					create: 		function(data){
												return new this(data);
											},

					// set method for Backbone models bound with Octane.Mediator
					// very similar to OctaneModel.prototype._set, begging for a DRY refactor
					set: 				function(key,val,options){

												var attrs,attrs,cached,keys,attrKeys;
												var $this=this;

												if(__.typeOf(key) == 'object'){
														attrs = key;
														options = val;
												} else {
														(attrs = {})[key] = val;
												}

												_.extend((cached = {}),this.attributes);

												// run hooks on attrs, which may mutate them or add other properties to attrs
												if(this.alias){
														_.forOwn(attrs,function(value,key){
																_octane.hooks[$this.alias+'.'+key] && OctaneModel.prototype._applyHooks.apply($this,[key,attrs]);
														});
												}

												_.forOwn(attrs,function(value,key){
														var keyArray = key.split('.');
														var attrKey = keyArray[0];
														var k = keyArray.length;

														// run the reducer from OctaneModel._set, but on the cached attrs
														keyArray.reduce(function(o,x,index){
																if(index == (k-1)){ // last iteration
																		return o[x] = value;
																}else{
																		return o[x] = _.isObject(o[x]) ? o[x] : {};
																}
														},cached);

														if(cached[attrKey] != $this.attributes[attrKey]){
																// apply model's original set method
																$this.__legacy__.set.apply($this,[ attrKey,cached[attrKey],options ]);
																// alert octane listeners
																if($this.alias){
																		Octane.fire('statechange:'+$this.alias+'.'+key);
																}
														}
												});
												return this.attributes;
											},

					// get the model name from a keystring, ex "App.loading.message" would return "App"
					_parseName: function(binding){
												try {
														return (binding || '').split('.')[0];
												} catch (ex){
													 Octane.error('could not parse model name from '+binding+': '+ex.message);
														return false;
												}
											},

					// get the nested key from a keystring, ex "App.loading.message" would return "loading.message"
					_parseKey: 	function(binding){
												try{
														return (binding || '').split('.').slice(1).join('.');
												} catch (ex){
														Octane.error('could not parse model key from '+binding+': '+ex.message);
														return false;
												}
											}
				}); // end static methods




				OctaneModel.prototype = new OctaneBase;

				OctaneModel.prototype.extend({
					initialize: function(){},
					defaults: 	{},
					constructor:OctaneModel
				});

				OctaneModel.prototype.defineProp({

					_set: 			function(key,val){

												if(this.processing){
													this.queue = [key,val];
												}else{
													this.processing = true;


													var alias = this.alias;
													var tk = __.typeOf(key);
													var fresh,n,keys;

													// handle key,value and {key:value}
													if(tk === 'object'){
														fresh = key;
													}else if(tk === 'string'){
														(fresh = {})[key] = val;
													}else {
														fresh = {};
													}

													// array for state properties changed
													keys = Object.keys(fresh);
													n = keys.length;

													// apply any hooks
													if( alias ){
														while(n--){
															_octane.hooks[alias+'.'+keys[n]] && this._applyHooks(keys[n],fresh);
														}
													}

													// re-measure in case there have been additional properties
													// added to fresh via hooks
													_.each(fresh,function(value,binding){
														this._setState(binding,value);
													},this);
													this.processing = false;
													this.queue && this._set.apply(this,this.queue);
												}
												// alert any subscribers
												alias && Octane.fire('statechange:'+alias);
												return fresh;
											},

					// use reduce to set a value using a nested key, ex "App.loading.message" would set {App:{loading:{message:value}}}
					_setState: 	function(binding,value){

												var state = this.state;
												var alias = this.alias;
												var keyArray = binding.split('.');
												var k = keyArray.length;
												var modelUpdated;

												try{
													keyArray.reduce(function(o,x,index){
														if(index == (k-1)){ // last iteration
																return o[x] = value;
														}else{
																return o[x] = _.isPlainObject(o[x]) ? o[x] : {}; // create if object if not already
														}
													},state);
													modelUpdated = true;
												}catch(ex){
													modelUpdated = false;
													Octane.log('Unable to set model data "'+binding+'"',ex);
												}
												modelUpdated && alias && Octane.fire('statechange:'+alias+'.'+binding);
											},

					// helper, applies hooks on changed model state attributes before they get set
					_applyHooks:function(binding,fresh){

												if(this.alias){
														var hooks = _octane.hooks[this.alias+'.'+binding];
														var input = _.get(fresh,binding);

														if(_.isArray(hooks)){
															_.each(hooks,function(hook){
																input && hook.apply(fresh,[input,binding]);
															});
														}
														/*
														if(_.isArray(hooks)){
															_.each(hooks,function(hook){
																//_.extend(fresh,hook(fresh));
																binding.split('.').reduce(function(o,x,i){
																	if(i===arr.length-1){
																		_.extend(fresh,hook(x,fresh));
																	} else {
																		return _.isObject(o) ? o[x] : null;
																	}
																},fresh);
															});
														}
														*/
												}
											},

					_unset: 		function(toUnset,timeout,throttle){

												var $this = this;
												if(!toUnset) return;

												_.isArray(toUnset) || (toUnset = toUnset.split(','));

												if(timeout && (__.typeOf(timeout) == 'number')){ // timout the unset

														if(throttle){                                // throttle the unsets
																_.each(toUnset,function(keystring,i){
																		setTimeout(function(){
																				$this.set( keystring,void(0) );
																		},timeout*(i+1));                   // make sure we timeout the 0 index
																});
														}else{                                      // unset all together after timeout
																setTimeout(function(){
																		_.each(toUnset,function(keystring){
																				$this.set( keystring, void(0) );
																		});
																},timeout);
														}
												} else {
														_.each(toUnset,function(keystring){         // unset all immediately
																$this.set( keystring, void(0) );
														});
												}
											},

					_destroy: 	function(){

												var  keys = Object.keys(this.state);
												var n = keys.length;

												while(n--){
														delete this.state[keys[n]];
												}

												this.alias && this.detach();
											},

					_get: 			function(binding){

												var $this = this;
												var data;

												if(_.isString(binding)){

														var keyArray = binding.split('.');
														var l = keyArray.length;

														try{
															data = keyArray.reduce(function(o,x,i){
																	return o[x];
															},this.state);
														}catch(ex){
															data = null;
															Octane.log('Unable to get model data "'+binding+'"',ex);
														}
														return data;
												} else {
														return this.state;
												}
											},

					_getAt: 		function(binding,index){

												var data = this._get(binding);
												if(__.isArray(data)){
													return data[index];
												}else{
													return data;
												}

											},

					_clear: 		function(){

												var stateProps = Object.keys(this.state);
												var alias = this.alias;
												var n=stateProps.length;
												var prop;

												while(n--){
														prop = stateProps[n];
														delete this.state[prop];
														alias && Octane.fire('statechange:'+alias+'.'+prop);
												}
												// alert any subscribers
												if(alias) Octane.fire( 'statechange:'+alias );

												return this;
											},

					_reset: 		function(defaults){
												this.clear().set(defaults || this.defaults);
											}
				});




				// overwritable aliases for extension classes
				OctaneModel.prototype.extend({

					get: 				function(){
												return this._get.apply(this,arguments);
											},

					set:  			function(){
												return this._set.apply(this,arguments);
											},

					unset:  		function(){
												return this._unset.apply(this,arguments);
											},

					clear: 			function(){
												return this._clear();
											},

					getAt: 			function(){
												return this._getAt.apply(this,arguments);
											},

					destroy: 		function(){
												this._destroy();
											},
					reset: 			function(){
												this._reset.apply(this,arguments);
											}
				});




				Octane.defineProp({

					Model: 		 	OctaneModel,

					// functional alias for calling new Octane.Model() or Octane.Model.create()
					// returns a named model if it already exists
					model: 			function (data){

												if(_.isString(data)){
													var alias = data;
													// only an alias was passed and it's currently occupied on the Mediator
													// return the model occupying that alias
													if(_octane.models[alias]){
														return _octane.models[alias];
													// only an alias was passed and it's vacant on the Mediator
													// create new model, assign it to the alias, and return it
													} else {
														return new OctaneModel().become(alias);
													}
												}
												// alias was not passed, return an unassigned model instance
												// possibly with data to set
												return new OctaneModel(data);
											},
					// access a bound model's get method from the application object
					get: 				function(modelStateKey){

												var modelName = OctaneModel._parseName(modelStateKey);
												var stateKey = OctaneModel._parseKey(modelStateKey);
												var model = _octane.models[modelName];

												if(model && stateKey){
														return model.get(stateKey);
												} else if(model){
														return model.get();
												}
											},
					// access a bound model's set method from the application object
					set: 				function(key,val){

												var fresh,keys,i,n;
												var tk = __.typeOf(key);

												if(tk === 'object'){ fresh = key; }
												else if(tk === 'string'){ (fresh = {})[key] = val; }
												else { fresh = {}; }

												_.each(fresh,function(value,binding){
													var name 	= OctaneModel._parseName(binding);
													var key 	= OctaneModel._parseKey(binding);
													var model = _octane.models[name] || ( Octane.Model.create().become(name) );
													if(model){
														 (key !=='') ? model.set(key,value) : model.reset(value);
													}
												});
											},
					// access a bound model's unset method from the application object
					unset: 			function(toUnset,timeout,throttle){

												if(!toUnset) return;

												_.isArray(toUnset) || (toUnset = toUnset.split(','));

												var unset = function(binding){
														binding 	= binding.trim();
														var name 	= OctaneModel._parseName(binding);
														var key 	= OctaneModel._parseKey(binding);
														var model = _octane.models[name];
														model && model.unset(key);
												};

												if(timeout && (__.typeOf(timeout) == 'number')){ 				// timout the unset

														if(throttle){                                				// throttle the unsets
																_.each(toUnset,function(binding,i){
																		setTimeout(function(){
																				unset(binding);
																		},timeout*(i+1));                   				// make sure we timeout the 0 index
																});
														}else{                                      				// unset all together after timeout
																setTimeout(function(){
																		_.each(toUnset,unset);
																},timeout);
														}
												} else {
														_.each(toUnset,unset);                      				// unset all immediately
												}
											}
				});







		/* ------------------------------------------------------- */
		/*                    COLLECTIONS                          */
		/* ------------------------------------------------------- */



/*
				_octane.collections = {};




				function OctaneCollection(models,options){
					models = [];

					Octane.defineGetter.apply(this,['models',function(){
						return models;
					}]);

					var _alias	= null;
					var queue = [];
					Octane.guid(this);

					this.accessors('queue',{
						set:function(pair){
							queue.push(pair);
						},
						get:function(){
							return queue.pop();
						}
					});
					this.defineGetter('alias',
						function(){
							return _alias;
					});

					this.extend({
						become : function(alias){
							var cols = _octane.collections;
							cols[alias] && cols[alias].detach();
							cols[alias] = this;
							_alias = alias;
							Octane.fire('collectionchange:'+alias);
							return this;
						},
						detach : function(){
							var alias = this.alias;
							if( alias ){
								_octane.collections[alias] = null;
								_alias = null;
								Octane.fire('collectionchange:'+alias);
							}
							return this;
						});

					this.reset = function(models){
						models = [];
						this.set(models,options);
					};
					this.template = options.template || null;
					this.model = options.model || OctaneModel;
					this.initialize.apply(this,arguments);
					this.models.add(models);
				}

				OctaneCollection.prototype = new OctaneBase;

				OctaneCollection.prototype.extend({
					initialize: function(){},
					constructor: OctaneCollection
				});


				OctaneCollection.prototype.defineProp({

					create: 		function(dataObj){
						return this.models.push(new this.model(dataObj));
					},
					get: 				function(guid){
						return this.models[guid];
					},
					set: 				function (models,options){

						_.defaults((options||{}),{merge:true});
						models = _.isArray(models)||[models];
						this.each(function(model){

							var guid,existing,isModel = this._isModel(model);
							if(isModel) guid = Octane.guid(model);


							if(existing = this.get(guid))) {
								options.merge && existing.set(model.get());
							} else {
								isModel ? this.models.push(model) : this.create(model);
							}

						})



					},
					remove: 		function(){},
					where: 			function(){},
					pluck: 			function(){},
					fetch: 			function(){},
					push: 			function(){},
					pop: 				function(){},
					shift: 			function(){},
					unshift: 		function(){},
					slice: 			function(){},
					add: 				function (models){

						_.isArray(models)||(models = [models]);
						_.each(models,function(model){
							// is the model an octane model or

							var props = model.state || model.attrs || model;

						}

					},
					_isModel: function(model){
						return model instanceof OctaneModel;
					}

				});

				var methods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
				'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
				'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
				'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
				'tail', 'drop', 'last', 'without', 'difference', 'indexOf', 'shuffle',
				'lastIndexOf', 'isEmpty', 'chain', 'sample', 'partition'];


				_.each(methods, function(method) {
					if (!_[method]) return;
					OctaneCollection.prototype[method] = function() {
						var args = slice.call(arguments);
						args.unshift(this.models);
						return _[method].apply(_, args);
					};
				});

*/






		/* ------------------------------------------------------- */
		/*                     CONTROLLERS                         */
		/* ------------------------------------------------------- */










				_octane.controllers = {};




				function OctaneController(name,config){

					_.isString(name) && (this.name = name);

				 _.isPlainObject(config) && _.extend(this,config);

					this.initialize && this.initialize.apply(this,arguments);
					// add this Controller instance to the _octane's controllers object
					this.name && (_octane.controllers[this.name] = this);
				}




				OctaneController.prototype = new OctaneBase;
				OctaneController.prototype.extend({
					constructor: OctaneController,
					initialize: function(){},
					defaults: 	{},
					destroy: 		function(){
												this._destroy.apply(this);
											}
				});
				OctaneController.prototype.defineProp({
					_destroy: 	function(){
												delete _octane.controllers[this.name];
											}
				});




				Octane.defineProp({
					controller: function (name,config){
												if(!name){
													return new OctaneController(Octane.GUID());
												} else if(!_octane.controllers[name]){
													return new OctaneController(name,config);
												} else {
													return _octane.controllers[name];
												}
											},
					Controller: OctaneController
				});















				OctaneModel.extend = OctaneController.extend =  /*OctaneCollection.extend =*/ Factory.extend = extend;










		/* ------------------------------------------------------- */
		/*                       FILTERS                           */
		/* ------------------------------------------------------- */










				_octane.filters = {};




				Octane.defineProp({

					// filterFunction as -> function([params])
					filter: 		function(name,filterFunction){
													_octane.filters[name] = filterFunction;

													return Octane;
											},

				});










		/* ------------------------------------------------------- */
		/*                          TASKS                          */
		/* ------------------------------------------------------- */










				// param 1 : a model key to listen for change on
				// add param 2 as function(data held in model[key])

				Octane.defineProp({

					task: 			function(key,fn,thisArg){

												var cache ={};
												var arr = key.split('.');

												arr.reduce(function(o,x,i,a){
													var watch;
													if(i === 0){
															watch = x;
													}else{
															watch = o+'.'+x;
													}
													Octane.on('statechange:'+watch,function(e){
														var currentVal = Octane.get(key);
														if(currentVal !== cache[key]){
															cache[key] = currentVal;
															fn.call((thisArg||Object.create(null)),currentVal,key);
														}
													});
													return watch;
												},'');
												return Octane;
											}
				});




				// param 1 : a model key to listen for change on
				// add param 2 as function(data held in model[key])

				Octane.defineProp({

					watch: 			function(watching,fn,thisArg){

												var cache ={};
												var arr = watching.split('.');

												arr.reduce(function(o,x,i,a){
													var watch;
													if(i === 0){
															watch = x;
													}else{
															watch = o+'.'+x;
													}
													Octane.on('statechange:'+watch,function(e){
														var currentVal = Octane.get(watching);
														if(currentVal !== cache[watching]){
															cache[watching] = currentVal;
															fn.call((thisArg||Object.create(null)),currentVal,watching);
														}
													});
													return watch;
												},'');
												return Octane;
											}
				});






		/* ------------------------------------------------------- */
		/*                          HOOKS                          */
		/* ------------------------------------------------------- */










				_octane.hooks = {};

				// a function to be applied before the setting of data in the model
				// if one model data value changes depending on another, a hook is the place for that logic
				// key is the incoming data key to parse for, func is the function to apply
				// a hook is applied at set time to a binding

				 Octane.defineProp({

					 hook: 			function hook(binding,fn){

												(_octane.hooks[binding]||(_octane.hooks[binding]=[])).push(fn);

												return this; // chainable
											}
				 });










		/* ------------------------------------------------------- */
		/*                         MODULES                         */
		/* ------------------------------------------------------- */










				_octane.modules       = {};

				_octane.moduleConfigs = {};

				_octane.moduleExports = {};

				_octane.bootlog 			= [];

				// messages to log to the boot logger during the app's initialization
				var msgs		= {
					load	  : function(a)  { return "       "+a+': not initialized, loading...'},
					init		: function(a)  { return "       "+a+': initializing...'},
					done		: function(a)  { return "       "+a+': successfully initialized!'},
					skip	  : function(a)  { return "       "+a+': already initialized, continuing...'},
					fail1		: function(a)  { return "FAILED "+a+': failed to initialize!'},
					check		: function(a)  { return "       "+a+': checking dependencies...'},
					clear		: function(a)  { return "       "+a+': no dependencies, preparing to initialize...'},
					next		: function(a,b){ return "       "+a+': dependency "'+ b +'" loaded and initialized, continuing...'},
					hold		: function(a,b){ return "       "+a+': dependency "'+ b +'" not yet loaded, loading now...'},
					fail2		: function(a,b){ return 'FAILED '+a+': Could not load module, missing module dependency "'+ b +'"'},

				};

				function bootlog(msg,a,b){
					var message = msgs[msg](a,b);
					_octane.bootlog.push( message );
					Octane.set('Bootlog.status',message);
				}




				function OctaneModule (name,dependencies){
						this.initialized        = false;
						this.name               = name;
						this.imports            = {};
						this.controllers        = {};
						this.dependencies       = dependencies;
						this.status							= {_isPending : false};
						var loading = false;

						this.accessors('loading',{
							set : function(bool){
								if(!this.initialized) {
									loading = __.typeOf(bool) == 'boolean' ? bool : loading;
								}
							},
							get : function(){
								return loading;
							}
						});
				}




				OctaneModule.prototype = new OctaneBase;
				OctaneModule.prototype.extend({
					initialize: function(){},
					constructor: OctaneModule
				});

				OctaneModule.prototype.defineProp({

					import: 		function(module){
												return _octane.moduleExports[module];
											},

					export: 		function(exports){
												/*
												_.isObject(_octane.moduleExports[this.name]) || (_octane.moduleExports[this.name] = {});

												try{
													_.extend(_octane.moduleExports[this.name],exports);
												}catch (ex){
													Octane.log('Could not create exports for module '+this.name+'.',ex);
												}
												*/
												_octane.moduleExports[this.name] = exports;
											},

					controller: function(name,methods){

												// give the controller the module's config hash
												(methods || (methods = {})).moduleConfig = (_octane.moduleConfigs[this.name] || {});
												this.controllers[name] = octane.controller(name,methods);
												return this; // chainable
											},

					_getImports:function(){

												_.transform(this.dependencies,function(imports,dependency){
														imports[dependency] = _octane.moduleExports[dependency];
												},this.imports);
											},

					_load: 			function(){

												if(this.initialized){

													bootlog('skip',this.name);
													return Promise.resolve(this);

												} else {

													bootlog('load',this.name);

													return this._checkDependencies()
														.bind(this)
													.then(function(){

														var name = this.name;
														var config 	= _octane.moduleConfigs[name] || {};

														bootlog('init',name);
														this._getImports(name);
														this.initialize(config);

														Octane.App.set({
															"loadingProgress" : (Math.ceil(100 / Object.keys(_octane.modules).length))
														});
														// hook-in for updating a loading screen
														Octane.fire('loaded:module',{
																detail:{moduleID: name }
														});

														this.defineProp('initialized',true);

														bootlog('done',name);
														return Promise.resolve(this);
													})
													.catch(function(err){
														bootlog('fail1',this.name);
														Octane.log(err);
														this.initialized = false;
														return Promise.reject();
													});
												}
											},

					_checkDependencies: function(){

												var deps = this.dependencies || [];
												var n = deps.length;
												var results = [];

												bootlog('check',this.name);

												if(n === 0){
														bootlog('clear',this.name);
														return Promise.resolve();
												} else {
														while(n--){

															results.push(this._checkDependency(deps[n]));

														}
														return Promise.all(results);
												}
											},

					_checkDependency: function (dname){

												dname = ''.trim.apply(dname||'');

												var name 			= this.name;
												var required 	= _octane.modules[dname];

												switch(true){

													case (dname.length === 0) : 													// no dependency

														bootlog('clear',name);
														return Promise.resolve();

													case (!(required && required instanceof OctaneModule)): // module is not present, fail

														bootlog('fail2',name,dname);
														return Promise.reject();

													case ( required && required.initialized ) : 					// module is already loaded, continue

														bootlog('next',name,dname);
														return Promise.resolve();

													case (!required.initialized): 												// module is not loaded, try to load it

														bootlog('hold',name,dname);
														required.status._isPending || (required.status = required._load());
														return required.status;
												}
											}
				});





				Octane.defineProp({

					module: 		function(name,dependencies){
												return (_octane.modules[name] = new OctaneModule(name,dependencies) );
											},

					hasModule: 	function (name){
												return (_octane.modules[name] && _octane.modules[name].initialized);
											},

					moduleConfig:function(module,cfg){
												_.isPlainObject(cfg) && (_octane.moduleConfigs[module] = cfg);
											}
				});










		/* ------------------------------------------------------- */
		/*                          DOM                            */
		/* ------------------------------------------------------- */











				// octane DOM elements

				Octane.defineGetter('loadingContainer',function(){
						return document.getElementsByTagName('o-loading-container')[0] || document.createElement('o-loading-container');
				});

				Octane.defineGetter('bgContainer',function(){
						return document.getElementsByTagName('o-background')[0] || document.createElement('o-background');
				});

				Octane.defineGetter('appContainer',function(){
						return document.getElementsByTagName('o-app-container')[0] || document.createElement('o-app-container');
				});

				Octane.defineGetter('viewContainer',function(){
						return document.getElementsByTagName('o-view-container')[0] || document.createElement('o-view-container');
				});

				Octane.defineGetter('modalContainer',function(){
						return document.getElementsByTagName('o-modal-container')[0] || document.createElement('o-modal-container');
				});

				Octane.defineGetter('listViewElements',function(){
						return document.getElementsByTagName('o-view');
				});

				Octane.defineGetter('listModalElements',function(){
						return document.getElementsByTagName('o-modal');
				});




















		/*-------------------------------------------------------	*/
		/*                 DEFAULT APP ORDINANCES									*/
		/*-------------------------------------------------------	*/










				Octane.designate('[o-control]',function(elem,attrVal){

					// ex. <li  o-control="(click) [ListViewController.refresh,15]">..</li>
					// elem: <li>
					// attrVal: '(click)[ListViewController.refresh,15]

					//var openTag = elem.outerHTML.match(/^<(.*?)>/)[1];
					var events						= _.map((attrVal.match(/\((.*?)\)/g)||[]),function(match){
						return (match ||'').replace(/[\(\)]/g,'');
					});
					var declarations			= _.map((attrVal.match(/\[([^\]]+)\]/g)||[]),function(match){
						return (match ||'').replace(/[\[\]]/g,'');
					});

					var pairs = _.zip(events,declarations);

					_.each(pairs,function(pair){
						var event = pair[0]||'click';
						var declaration = (pair[1]||'').split(',');
						var action = (declaration.shift()||'').split('.');
						var controller = action[0];
						var method		 = action[1];

						// set event handler on octane delegator
						Octane.on(event,elem,function(e,el){
							var ctrl = _octane.controllers[controller];
							try{
								ctrl[method].apply(ctrl,[el].concat(declaration));
							}catch (ex){
								Octane.log('o-control ' +controller+ '.' +method+ ' could not be applied',ex);
							}
						});
					});
					elem = null;
				});



				Octane.designate('[o-src]',function(elem,value){
					var pattern = /\{\{([^{^}]+)\}\}|^(_*)$|^(\s*)$/g;
					if(!pattern.test(value)){
						elem.src = value;
						elem.removeAttribute('o-src');
					} else {
						elem.removeAttribute('src');
						delete elem.src;
					}

				});


				Octane.designate('[o-bg-img]',function(elem,value){
					var pattern = /\{\{([^{^}]+)\}\}/g;
					if(!pattern.test(value)){
						elem.style.backgroundImage = 'url('+value+')';
						elem.removeAttribute('o-bg-img');
					}
				});










		/*-------------------------------------------------------	*/
		/*                 			UI MESSAGES												*/
		/*-------------------------------------------------------	*/







				var UiMessages = OctaneModel.extend({
					hint: 			function(){

												var setObject,toUnset,timeout;

												// handle key,value and {key:value}
												if(_.isString(arguments[0])){
														setObject = {};
														setObject[arguments[0]] = arguments[1];
														timeout = arguments[2];
												} else if(_.isObject(arguments[0])){
														setObject = arguments[0];
														timeout = arguments[1];
												} else {
														return {};
												}
												timeout || (timeout = 5000);

												// automatically remove after 5 seconds or specified time
												toUnset = Object.keys(setObject);
												this._set(setObject);
												this._unset(toUnset,timeout);
											}
				});





	/* -------------------------------------------------------*/
	/*                        INIT                            */
	/* -------------------------------------------------------*/




				_octane.context = 'web';




				// getter and setter for context
				// used for feature detection
				// set to either 'html4','html5','web',or 'cordova'
				Object.defineProperty(Octane,'context',{

					get: 				function(){
												return _octane.context;
											},
					set: 				function(cx){
												var contexts = ['html4','html5','web','cordova'];
												__.inArray(contexts,cx) && (_octane.context = cx);
											}
				});




				Octane.defineProp({

					initialize: function initialize (appConfig,moduleConfigs){




												 // don't reinitialize
												if(Octane.initialized) return;




												_.isPlainObject(appConfig) || (appConfig = {});
												Octane.defaultView  = appConfig.defaultView;
												Octane.context      = appConfig.context;




												// establish module configuration
												// configs passed at init are used over those passed earlier
												// by individual calls to octane.configureModule
												_.isObject(moduleConfigs) || (moduleConfigs = {});
												_.each(_octane.modules,function(m,name){
													if(!_octane.moduleConfigs[name]) _octane.moduleConfigs[name] = {};

													_.assign(_octane.moduleConfigs[name],(moduleConfigs[name]||{}));
												});




												Octane.Mediator.init();





												// parse the DOM initially to create virtual DOM model
												Octane.defineProp({
														// default application models
														App         : new OctaneModel().become('App'),
														uiMessages  : new UiMessages().become('uiMessages'),
														uiStyles    : new OctaneModel().become('uiStyles')
												});





												Octane.App.set({
														loadingProgress : 0,
														name : appConfig.appName
												});




												// hook for loading screens
												Octane.hook('App.loadingProgress',function(loadingProgress,binding){
														var currentProgress = Octane.get('App.loadingProgress') || 0;
														this.loadingProgress = currentProgress + this.loadingProgress;
														//return $state;
												});






												// compile DOM templates
												Octane.Template.compile();





												// add debugging support if module included,
												// pass internal _octane app object as module config
												var modules = _octane.modules;

												var debug = modules['Debug'];
												if(debug){
													_octane.moduleConfigs.Debug.reflection = _octane;
												}





												// Octane initialize returns a Promise!
												// load modules -> compile -> ready
												// make sure core modules are loaded before 3rd party/app specific modules
												return ( ( debug && debug._load()) || Promise.resolve())
													.then(function(){
														return modules['StartupUtilities']._load();
													})
													.then(function(){
														return modules['AppLoading']._load();
													})
													.then(function(){
														return modules['OctaneRouter']._load();
													})
													.then(function(){
														return modules['OctaneModals']._load();
													})
													.then(function(){ // precompile
														return Compiler.run();
													})
													.then(function(){
														return Promise.all(_.map(modules,function(m){
															return m._load();
														}));
													})
													.then(function(){
														return Compiler.run();
													})
													.then(function(){
														Octane.defineProp({initialized : true });
														Octane.fire('octane:ready');
													})
													.catch(function(err){
														Octane.log(err);
													});
											}
				});




				window.octane = window.$o = Octane;

	})($,_,__);
