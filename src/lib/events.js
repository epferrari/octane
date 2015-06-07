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



	var _           = require("lodash");
	var utils       = require("./utils.js");
	var Quarterback = require('./Quarterback.js');




	// Mixin for objects to interface with the Quarterback
	var Events = {

		// 2 args: add a callback to be executed when THIS object fires an event
		// 3 args: add a callback to be executed when SRC object fires an event
		on: function(event,src,handler){
			this._ensureEventInterface();
			if(arguments.length === 2){
				handler = src;
				src = this;
			}
			this._registerHandler(event,src,handler);
			return this;
			// chainable
		},

		// add a callback to execute whenever event is fired, from any object
		any: function(event,handler){
			this._ensureEventInterface();
			this._registerHandler(event,null,handler);
			return this;
			//chainable
		},

		// handle a callback from an event one time
		once: function(eventType,src,handler){
			this._ensureEventInterface();
			if(arguments.length === 2){
				handler = src;
				src = this;
			}
			var events = this._events_;
			var srcId = this.guid(src);
			var wrapper = function(){
				_.pull(events[srcId][eventType],wrapper);
				handler.apply(this,arguments);
			};
			this._registerHandler(eventType,src,wrapper);
		},

		// stop listening for event on THIS
		off: function(eventType){
			this._ensureEventInterface();
			var events = this._events_;
			var thisId = this.guid();
			if(events[thisId]){
				events[thisId][eventType] = [];
			}
		},

		// call with eventType and src: stop listening for event on SRC
		// call with only eventType: stop listening for an event anywhere
		forget: function(eventType,src){
			this._ensureEventInterface();
			var events = this._events_;
			if(arguments.length === 2){
				var srcId = this.guid(src);
				if(events[srcId]){
					delete events[srcId][eventType];
				}
			}else{
				_.pull(this._listening_,eventType);
				_.forOwn(events,function(src){
					delete src[eventType];
				});
				Quarterback.unregister(this.guid(),eventType);
			}
		},

		// fire an interal event from this object
		fire: function(event,detail){
			this._ensureEventInterface();
			Quarterback.normalizeOctaneEvent(event,this,detail);
		},
		_registerHandler: function(event,src,handler){
			this._ensureEventInterface();
			var eventTypes = event ? event.split(' ') : [];
			var src_id;

			src_id = src ? utils.guid(src) : 'ANY';

			_.each(eventTypes,function(eventType){
				var events = this._events_;

				// add handler to this._events_ under the correct id (or "ANY")
				((events[src_id]||(events[src_id]={}))[eventType]||(events[src_id][eventType]=[])).push(handler);

				// make sure the Quarterback will normalize the event
				if(!_.contains(Quarterback._listening_,eventType)){
					Quarterback._listening_.push(eventType);
					global.addEventListener(eventType,Quarterback.normalizeDOMEvent,false);
				}

				// register this object with the Quarterback
				if(!_.contains(this._listening_,eventType)){
					this._listening_.push(eventType);
					Quarterback.register(eventType,this);
				}
			},this);
			return this;
		},

		// initialize Event interface instance properties on an implementing object
		// invoked the first time an implementor uses an iterface method
		_ensureEventInterface: function(){

			if(this.eventsInitialized) return;
			if(!this.guid){
				Object.defineProperty(this,'guid',{
					value: function(obj){
						utils.guid.apply(this,[obj]);
					},
					writable: false,
					configurable:false
				});
				this.guid();
			}
			Object.defineProperty(this,'__listening__',{
				value: [],
				writable: false,
				configurable: false,
				enumerable: false
			});
			Object.defineProperty(this,'__events__',{
				value: {ANY:{}},
				writable: false,
				configurable: false,
				enumerable: false
			});
			Object.defineProperty(this,'_events_',{
				get: function(){
					return this.__events__;
				}
			});
			Object.defineProperty(this,'_listening_',{
				get: function(){
					return this.__listening__;
				}
			});
			this.clearEventCache = function(){
				var events = this.__events__;
				_.forOwn(events,function(prop,key){
					delete events[key];
				},this);
				events.ANY = {};
				Quarterback.unregister(this.guid());
			};
			Object.defineProperty(this,'eventsInitialized',{
				value: true,
				writable: false,
				configurable: false
			});
		}
	};

	module.exports = Events;
