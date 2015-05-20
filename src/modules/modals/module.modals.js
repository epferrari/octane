var _ 					= require('lodash');
var Promise 		= require('bluebird');
var Velocity 		= require('velocity-animate');
var uiPack 			= require('velocity-ui-pack');
var _octane 		= require('./_octane.js');
var Controller 	= require('./controller.js');
var Frame 			= require('./frame.js');
var DOM 				= require('./dom.js');
var Router 			= require


var animBy          = octane.animateBy ||'css';
var Overlay         = this.import('UiOverlay');
var Velocity        = Velocity || $.Velocity;
var bg              = DOM.modalContainer;
var modalQueue      = [];
var currentModal    = false;
var block           = false;

var OctaneModal     = Frame.extend({

	// Instance Methods

	constructor:  function OctaneModal(){
		return Controller.apply(this,arguments);
	},

	initialize:   function(elem){

									if(!elem) throw new Error('Must pass an HTMLElement to OctaneModal');

									this.prepareFrame(elem);
									this.adjustSize();
									this.name = _.capitalize(_.camelCase(this.title))+'ModalController';
									_octane.modals[this.id] = this;

	},

	load:         function(){

									var routerWasLocked = octane.Router.isLocked;
									var modalLoaded;

									if(!block){

											octane.Router.lock();

											if(!currentModal){                                // no modal onscreen, load this one
												modalLoaded = Overlay.add()
												.bind(this)
												.then(this._load);
											} else if (currentModal && !this.isCurrent){      // another modal is onscreen, remove it
												modalLoaded = currentModal._exit()
												.bind(this)
												.then(this._load);
											} else {                                          // this modal is already onscreen, resolve
												modalLoaded = Promise.resolve();
											}

											modalLoaded.then(function(){
												!routerWasLocked && octane.Router.unlock();
											});

									} else {
										modalQueue.push(this.id);                           // modal animations are blocked, send to queue
									}
								},

	dismiss:      function(){

									var routerWasLocked = octane.Router.isLocked;
									if(this.isCurrent){
											octane.Router.lock();
											this._exit()
											.then(function(){
												!routerWasLocked && octane.Router.unlock();
												currentModal = false;
											})
											.then(Overlay.remove);
									}
								},

	adjustSize:   function(){

									var viewport = document.body.getBoundingClientRect();
									var h = (viewport.top - viewport.bottom)+'px';
									var w = (viewport.right - viewport.left)+'px';

									_.extend(this.elem.style,{
											minHeight   : h,
											width       : w,
											minWidth    : w,
											maxWidth    : w
									});
								},

	destroy:      function(){
									this._destroy();
									this.elem = null;
									_modals[this.id] = null;
								},

	_load:        function (){

									this.adjustSize();
									//bg.classList.add('loading');

									return this.frameWillLoad()                          // array of Promises to call before loading
									.bind(this)
									.then(function(){
										//bg.classList.remove('loading');
										this.elem.classList.add('modal-active');
										Velocity(this.elem,'scroll',{duration:300});
									})
									.then(function(){
										return this.frameDidLoad();                           // array of callbacks to run after loading
									})
									.then(function(){
										currentModal = this;
									})
									.catch(function(err){
										this.log(err);
									});
								},

	_exit:       function(){
								this.elem.classList.remove('modal-active');
								return this.frameDidExit()                                // array of callbacks to run at exit
								.catch(function(err){
									octane.log(err);
								});
							}
},{
	 // Static Methods

	create:     function(elem){
								return new OctaneModal(elem);
							},

	destroy:    function(id){
								_modals[id] && _modals[id].destroy();
							},

	get:        function(id){
								return _modals[id];
							},

	load:       function(id){
								_modals[id] && _modals[id].load();
							},

	dismiss:    function (){
								currentModal && currentModal.dismiss();
							}
});

OctaneModal.handle('routing:called',function(e){
	this.dismiss();
});

				octane.defineGetter.apply(OctaneModal.prototype,[
					'isCurrent',
					function(){
						return (this === currentModal);
				}]);

				octane.defineGetter.apply(OctaneModal,[
					'current',
					function(){
						return currentModal;
				}]);

				octane.defineGetter.apply(OctaneModal,[
					'isLocked',
					function(){
						return block;
				}]);



				octane.compiler('o-modal',function(elem){
					OctaneModal.create(elem);
				})
				.compiler('[o-modal]',function(elem){
					octane.handle('click',elem,function(e,el){
						var m = el.getAttribute('o-modal');
						OctaneModal.load(m);
					});
				})
				.compiler('.o-modal-dismiss',function(elem){
					octane.handle('click',elem,function(e,el){
						e.stopPropagation;
						e.stopImmediatePropagation;
						OctaneModal.dismiss();
						return false;
					});
				})
				// dismiss modal automatically on route
				.handle('routing:begin',function(){
					block = true;
					OctaneModal.dismiss();
				})
				// re-enable modal calling after routing completes
				.handle('routing:complete',function(){
					block = false;
					OctaneModal.load(modalQueue.pop());
				})
				// resize canvas to proper dimensions
				.handle('load resize orientationchange',function(){
					currentModal && currentModal.adjustSize();
				})
				.defineProp({ Modal: OctaneModal });

		} // end initialize
}); // end module
