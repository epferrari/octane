var _ 					= require("lodash");
var utils   		= require("./utils.js");
var log  				= require("./logger.js").log;


/* event delegator */
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
			(map[eventType]||(map[eventType]={}))[delegate.guid()] = delegate;
	},

	unregister: function(delegateId,eventType){
			var map = this.delegateMap;
			if(eventType){
					map[eventType] && (map[eventType][delegateId] = null);
					return;
			} else {
					// only delegate id was passed, remove it from all events
					_.forOwn(map,function(delegates,eventType){
							// an object where keys = delegateIds
							delegates[delegateId] = null;
					});
			}
	},

	dispatch: function(e){
			var eventType = e.type;
			var delegates = this.delegateMap[eventType];
			if(delegates){
				_.each(delegates,function(delegate,id){
						this.delegateEvent.apply(delegate,[e]);
				},this);
			}
	},

	target: function(e,delegate){
			delegate && this.delegateEvent.apply(delegate,[e]);
	},

	delegateEvent: function(e){
			var events = this._events_;
			var eventType = e.type;
			var src = e.target;
			var src_id = src.octane_id;
			var handlers = (events[src_id]&&events[src_id][eventType]) ? events[src_id][eventType] : [];

			// concat event handlers that are called regardless of event src
			handlers = handlers.concat(events.ANY[eventType]);
			// execute handlers with "this" binding as the delegate (applied at .dispatch);
			_.each(handlers,function(handler){
					var h = utils.typeOf(handler);
					if(h === 'function'){
						try{
							handler.apply(this,[e,src]);
						}
						catch(ex){
							log('Error calling handler on "'+eventType+'" during event delegation',ex)
						}
					}else if(h==='object'){
						try{
							handler.handleEvent(e,src);
						}
						catch(ex){
							log('Error calling handleEvent on "'+eventType+'" during event delegation',ex);
						}
					}
			},this);
	}
};

module.exports = Quarterback;
