var _ 					= require("lodash");
var utils   		= require("./utils.js");
var Quarterback = require('./Quarterback.js');



// decorator for objects to interface with the Quarterback
module.exports = {

		// add a callback to be executed when this object fires an event
		on: 				function(event,handler){
									this.handle(event,this,handler);
									return this;
									// chainable
								},

		// add a callback to be executed when the src object fires an event
		// if no src object is passed, the event is registered in the Application scope
		// and the callback is executed whenever the event is fired, from any object
		handle: 		function(event,src,handler){

									var eventTypes = event ? event.split(' ') : [];
									var n			= eventTypes.length;
									var a 		= arguments.length;
									var src_id;

									if(a === 2){
										handler = src;
										src = null;
									}

									src_id = src ? this.guid(src) : 'ANY';

									_.each(eventTypes,function(eventType){
										var events = this._events_;

										// add handler to this._events_ under the correct id (or "ANY")
										((events[src_id]||(events[src_id]={}))[eventType]||(events[src_id][eventType]=[])).push(handler);

										// make sure the Quarterback will normalize the event
										if(!_.contains(Quarterback._listening_,eventType)){
												Quarterback._listening_.push(eventType);
												window.addEventListener(eventType,Quarterback.normalizeDOMEvent,false);
										}

										// register this object with the Quarterback
										if(!_.contains(this._listening_,eventType)){
											this._listening_.push(eventType);
											Quarterback.register(eventType,this);
										}
									},this);
									return this;
									// chainable
								},

		// remove a callback
		unhandle: 	function(eventType,src,handler){

										var n = arguments.length;
										var events = this._events_;
										if(n === 3){																									// targeted removal of a single event handler from an object
											try{
												_.pull(events[src.octane_id][eventType],handler);
											}catch(ex){
												this.log && this.log('Error removing handler for '+eventType+' from object '+ src,ex);
											}
										} else if (n === 2){																					// remove all handlers for a single event type from an object
											try{
												events[src.octane_id][eventType] = null;
											}catch(ex){
												this.log && this.log('Error removing handlers for '+eventType+' from object '+ src,ex);
											}
										} else if (n === 1){
											switch( true ){
												case (utils.typeOf(eventType) == 'string'):												// remove all event handlers of a type from the global scope
													events[window.octane_id][eventType] = null;
													break;

												case (_.isObject(eventType) && eventType.octane_id):									// remove all event handlers from an object
													events[eventType.octane_id] = null;
													break;
											}
										}
										return this;
								},

		// fire an interal event from this object
		fire: 			function(event){
									Quarterback.normalizeOctaneEvent(event,this);
								}
};
