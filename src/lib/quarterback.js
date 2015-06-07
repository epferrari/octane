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



	var _     = require("lodash");
	var utils = require("./utils.js");
	var log   = require("./logger.js");


	// An Event Delegator using inversion of control
	var Quarterback = {
		__loggerId__: 'QuarterBack',
		_listening_: [],
		delegateMap: {},

		normalizeDOMEvent: function(DOMevent){
			if(!DOMevent) return;
			var target = DOMevent.target||DOMevent.srcElement;
			var e = {
				preventDefault: DOMevent.preventDefault.bind(DOMevent),
				stopPropagation: DOMevent.stopPropagation.bind(DOMevent),
				stopImmediatePropagation: DOMevent.stopImmediatePropagation.bind(DOMevent),
				target: target,
				type: DOMevent.type,
				detail: DOMevent.detail
			}
			Quarterback.dispatch(e);
		},

		normalizeOctaneEvent: function(event,src,detail){
			var noop = _.noop;
			// return an object that dummies a DOMevent
			var e = {
					type: event,
					target: src,
					detail: detail,
					preventDefault: noop,
					stopPropagation: noop,
					stopImmediatePropagation: noop
			};
			Quarterback.dispatch(e);
		},


		// register an object that invokes delegateEvent when event comes in
		register: function(eventType,delegate){
			var map = this.delegateMap;
			(map[eventType]||(map[eventType]={}))[utils.guid(delegate)] = delegate;
		},

		unregister: function(delegateId,eventType){
			var map = this.delegateMap;
			if(eventType && map[eventType]){
					delete map[eventType][delegateId];
					return;
			} else {
				// only delegate id was passed, remove it from all events
				_.forOwn(map,function(delegateGroup){
						// an object where keys = delegateIds
						delete delegateGroup[delegateId];
				});
			}
		},

		dispatch: function(e){
			var eventType = e.type;
			var delegates = this.delegateMap[eventType];
			if(delegates){
				Promise.all(
					_.map(delegates,function(delegate,id){
						return this.delegateEvent.apply(delegate,[e]);
					},this)
				)
				.catch(function(ex){
					log.apply(this,[ex.detail,ex.error]);
				}.bind(this));
			}
		},

		delegateEvent: function(e){
			var events    = this._events_;
			var eventType = e.type;
			var src       = e.target;
			var src_id    = src.octane_id;
			var handlers  = (events[src_id] && events[src_id][eventType]) ? events[src_id][eventType] : [];
			var errDetail = 'An event handler failed for "'+eventType+'" at dispatch to '+utils.guid(this)+'. Check event map.';

			// concat event handlers that are called regardless of event src
			handlers = handlers.concat(events.ANY[eventType]);
			// execute handlers with "this" binding as the delegate (applied at .dispatch);
			return Promise.all(_.map(handlers,function(handler){

				return new Promise(function(resolve,reject){
					var toh = utils.typeOf(handler);
					var result;

					if(toh === 'function'){
						try {
							result = handler.apply(this,[e,src]);
						} catch(err){
							return reject({
								error:err,
								detail:errDetail
							});
						}
					}else if(toh === 'object'){
						try {
							result = handler.handleEvent(e,src);
						}catch(err){
							return reject({
								error:err,
								detail:errDetail
							});
						}
					}
					return resolve(result);
				}.bind(this));

			},this));
		}
	};

	module.exports = Quarterback;
