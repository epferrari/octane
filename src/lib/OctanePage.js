
	var _          = require('lodash');
	var Promise    = require('bluebird');
	var Velocity   = require('velocity-animate');
	var uiPack     = require('velocity-ui-pack');
	var Factory    = require('./OctaneBase.js');
	var DOM        = require('./DOM.js');
	var Controller = require('./Controller.js');
	var Frame      = require('./ViewFrame.js');
	var _octane    = require('./_octane.js');

	var OctanePage = Frame.extend({

		initialize: function(elem){

			if(!elem) throw new Error('Must pass an HTMLElement to OctaneView');

			this.prepareFrame(elem);
			this.view = this.elem;
			this.name = _.capitalize(_.camelCase(this.title))+'FrameController';
			_octane.pages[this.id] = this;
		},

		constructor: function OctaneView(){
			return Controller.apply(this,arguments);
		},

		setCanvasHeight: function(){

			var windowHeight = window.document.body.offsetHeight;
			this.elem.style.height = DOM.pageContainer.style.height = windowHeight+'px';
		},

		_load: function(){
			this.setCanvasHeight();
			this.elem.classList.add('frame-active');
			Velocity(this.elem,'scroll',{duration:100});
			return Promise.delay(405)
			.bind(this)
			.then( this.setCanvasHeight );
		},

		_queue: function(){

			this.elem.classList.add('frame-queued');
			this.elem.classList.remove('frame-active');
			return Promise.delay(405);
		},

		_exit: function (){
			this.elem.classList.remove('frame-active');
			this.elem.classList.remove('frame-queued');
			return this.frameDidExit().delay(805);
		}
	},{
		// Static Methods

		create: function(elem){
			return new OctaneView(elem);
		},

		destroy: function(id){
			var toDestroy = _octane.pages[id];
			if(toDestroy){
				toDestroy._exit();
				_.each(toDestroy,function(prop){
					prop = null;
				});
				_octane.pages[id] = null;
			}
		},

		get: function(id){
			return _octane.pages[id];
		}
	});

	module.exports = OctanePage;
