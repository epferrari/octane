- case1:  Octane objectA fires an event
	- if objectA has registered an `on` callback for the event, call it
		- means we call objectA's own `callHandlers` method
		- or we have pushed objectA's `callHandlers` method into Octane's delegator under `[objectA.guid][event]`
	- if objectB has registered a `handle` callback for the event with `src = objectA`, call it
		- when we register with `objectB.handle` method on objectA, we need to add the callback to the other object's callback array
		
	
===

###### case 1:

	objectA.on('event',action1);
	objectB.handle('event',objectA,action2);
	objectA.fire('event');
	
	// action1, action2
	
	eventDelegator = function(event,guid){
		var events = this._events_;
		var handlers = events[guid] ? events[guid][event] : [];
		if(this === Octane) handlers.concat(events[this.guid][event]);
		if(handlers){
			_.each(handlers,function(handler){
				handler.apply(this,[event]);
			});
		}
	};
	
	objectA.on = function(event,action){
		this._events_[this.guid][event].push(action);	}
	
	objectB.handle = function(event,objectA,action){
		this._events_[objectA.guid][event].push(action);
		if(!_.contains(this._listening_,event)){
			Octane.handle(event,objectA,eventDelegator.bind(this));
		}
	}
	
	Octane.handle = function(event,objectA,action){
		this._events_[objectA.guid][event].push(action);
		if(!_.contains(this._listening_,event)){
			if(src instanceof HTMLElement){
				window.addEventListener(event,DOMEventDelegator.bind(this),false);
			}		
		}
	}
	
	objectA.fire = function(event){
		var guid = this.guid;
		var events = Octane._events_;
		var handlers = events[guid] ? events[guid][event] : null;
		if(handlers){
			_.each(handlers,function(handler){
				handler(event,guid);
			});
		}
		eventDelegator.apply(Octane,[event,this.guid]);
	}
		
###### case 2:
	
	objectA.handle('click',elem,action3);
	octane.trip(elem,'click');
	
	// action3
	
	objectA.handle = function(event,elem,action){
		this._events_[elem.guid][event].push(action);
		if(!_.contains(this._listening_,event)){
			Octane.handle(event,elem,eventDelegator.bind(this));
		}
	};
	
	Octane.handle = function(event,elem,action){
		this._events_[elem.guid][event].push(action);
		if(!_.contains(this._listening_,event)){
			if(elem instanceof HTMLElement){
				window.addEventListener(event,DOMEventDelegator.bind(this),false);
			}		
		}
	}
	
	DOMEventDelegator = function(e){
		src = e.srcElement||e.target;
		if(this._events_[src.guid]){
			eventDelegator.apply(this,[event,src.guid]);
		}
	};
			
			
	
###### case 3:
	
	objectA.handle('statechange:modelX',action4);
	octane.handle('statechange:modelX',action5);
	objectB.handle('statechange:modelX',modelX,action6);
	modelX.fire('statechange:modelX');
	
	action4, action5, action6
	
	objectA.handle = function(event,src,action){
		if(arguments.length !== 3){
			action = src;
			src = Octane;
		}
		this._events_[src.guid].push(action);
		if(!_.contains(this._listening_,event)){
			Octane.handle(event,src,eventDelegator.bind(this));
		}
	
	modelX.fire = function(event){
		var guid = this.guid;
		var events = Octane._events_;
		var handlers = events[guid] ? events[guid][event] : null;
		if(handlers){
			_.each(handlers,function(handler){
				handler(event,guid);
			});
		}
		eventDelegator.apply(Octane,[event,this.guid]);
	}	
	 