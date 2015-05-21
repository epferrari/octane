var _ 					= require('lodash');
var Promise 		= require('bluebird');
var Velocity 		= require('velocity-animate');
var uiPack 			= require('velocity-ui-pack');
var Factory 		= require('./base.js');
var DOM 				= require('./dom.js');
var Controller  = require('./controller.js');
var Frame 			= require('./frame.js');
var _octane			= require('./_octane.js');

var OctaneView = Frame.extend({

	initialize: 	function(name,elem){

									if(!elem) throw new Error('Must pass an HTMLElement to OctaneView');

									this.prepareFrame(elem);
									this.view = this.elem;
									this.name = _.capitalize(_.camelCase(this.title))+'ViewFrameController';
									_octane.views[this.id] = this;
								},

	constructor: 	function OctaneView(){
									return Controller.apply(this,arguments);
								},

	setCanvasHeight:function(){

									var windowHeight = window.document.body.offsetHeight;
									this.elem.style.height = DOM.viewContainer.style.height = windowHeight+'px';
								},

	_load:        function(){
									this.setCanvasHeight();
									this.elem.classList.add('view-active');
									Velocity(this.elem,'scroll',{duration:100});
									return Promise.delay(405)
									.bind(this)
									.then( this.setCanvasHeight );
								},

	_queue:   		function(){

									this.elem.classList.add('view-queued');
									this.elem.classList.remove('view-active');
									return Promise.delay(405);
								},

	_exit:        function (){
									this.elem.classList.remove('view-active');
									this.elem.classList.remove('view-queued');
									return this.frameDidExit().delay(805);
								},

	destroy: 			function(){
									this._destroy();
									_octane.views[this.name] = null;
								},
},{
	// Static Methods

	create: 			function(elem){
									return new OctaneView(elem);
								},

	destroy: 			function(id){
									var view = this.get(id);
									view && view.destroy();
								},

	get: 					function(id){
									return _octane.views[id];
								}
});

module.exports = OctaneView;
