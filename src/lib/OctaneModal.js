var _ 					= require('lodash');
var Promise 		= require('bluebird');
var Velocity 		= require('velocity-animate');
require('velocity-ui-pack');
var _octane 		= require('./_octane.js');
var Controller 	= require('./Controller.js');
var Frame 			= require('./ViewFrame.js');
var DOM 				= require('./DOM.js');
var Router 			= require('./Router.js');
var UiLayers 		= require('./ui-layers.js');
var Compiler 		= require('./Compiler.js');


var bg              = DOM.modalContainer;
var modalQueue      = [];
var currentModal    = false;
var block           = false;

var OctaneModal     = Frame.extend({

	// Instance Methods
	/*
	constructor:  function OctaneModal(){
		return Controller.apply(this,arguments);
	},
	*/
	constructor: OctaneModal,

	initialize:   function(elem){

									if(!elem) throw new Error('Must pass an HTMLElement to OctaneModal');

									this.prepareFrame(elem);
									this.adjustSize();
									this.name = _.capitalize(_.camelCase(this.title))+'ModalController';
									_octane.modals[this.id] = this;

	},

	load:         function(){

									var routerWasLocked = Router.isLocked;
									var modalLoaded;

									if(!block){

											var key = Router.lock();

											if(!currentModal){                                // no modal onscreen, load this one
												modalLoaded = UiLayers.addLayerEffect()
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
												Router.unlock(key);
											});

									} else {
										modalQueue.push(this.id);                           // modal animations are blocked, send to queue
									}
								},

	dismiss:      function(){

									var routerWasLocked = Router.isLocked;
									if(this.isCurrent){
										var key = Router.lock();
										this._exit()
										.then(function(){
											Router.unlock(key);
											currentModal = false;
										})
										.then(UiLayers.removeLayerEffect);
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
								.bind(this)
								.catch(function(err){
									this.log(err);
								});
							}
},{
	 // Static Methods

	create:     function(elem){
								return new OctaneModal(elem);
							},

	destroy:    function(id){
								var toDestroy = _octane.modals[id];
								if(toDestroy){
									toDestroy.dismiss();
									_.each(toDestroy,function(prop){
										prop = null;
									});
									_octane.modals[id] = null;
								}
							},

	get:        function(id){
								return _octane.modals[id];
							},

	load:       function(id){
								_octane.modals[id] && _octane.modals[id].load();
							},

	dismiss:    function (){
								currentModal && currentModal.dismiss();
							}
});

Object.defineProperty(OctaneModal.prototype,'isCurrent',{
	get: function(){
		return (this === currentModal);
	},
	configurable: false
});

Object.defineProperty(OctaneModal,'current',{
	get: function(){
		return currentModal;
	},
	configurable: false
});

Object.defineProperty(OctaneModal,'isLocked',{
	get: function(){
		return block;
	},
	configurable: false
});



Compiler.assign('o-modal',function(elem){
	OctaneModal.create(elem);
})
.assign('[o-modal]',function(elem){
	OctaneModal.on('click',elem,function(e,el){
		var m = el.getAttribute('o-modal');
		this.load(m);
	});
})
.assign('.o-modal-dismiss',function(elem){
	OctaneModal.on('click',elem,function(e,el){
		this.dismiss();
		return false;
	});
});

// dismiss modal automatically on route
OctaneModal.on('routing:begin routing:called',Router,function(){
	block = true;
	this.dismiss();
})
// re-enable modal calling after routing completes
.on('routing:complete',Router,function(){
	block = false;
	this.load(modalQueue.pop());
})
// resize canvas to proper dimensions
.any('load resize orientationchange',function(){
	currentModal && currentModal.adjustSize();
});

module.exports = OctaneModal;
