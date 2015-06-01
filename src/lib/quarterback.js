
	var _     = require("lodash");
	var utils = require("./utils.js");
	var log   = require("./logger.js");


	// An Event Delegator using inversion of control
	var Quarterback = {

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
				.catch(function(err){
					log.apply(this,[err.detail,err.error]);
				}.bind(this));
			}
		},

		target: function(e,delegate){
			delegate && this.delegateEvent.apply(delegate,[e]);
		},

		delegateEvent: function(e){
			var events    = this._events_;
			var eventType = e.type;
			var src       = e.target;
			var src_id    = src.octane_id;
			var handlers  = (events[src_id] && events[src_id][eventType]) ? events[src_id][eventType] : [];
			var errDetail = 'A handler function failed for event '+eventType+' at dispatch to '+utils.guid(this)+'. Check event map.';

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
						} catch(exc){
							return reject({
								error:exc,
								detail:detail
							});
						}
					}else if(toh === 'object'){
						try {
							result = handler.handleEvent(e,src);
						}catch(exc){
							return reject({
								error:exc,
								detail:detail
							});
						}
					}
					return resolve(result);
				}.bind(this));

			},this));
		}
	};

	module.exports = Quarterback;
