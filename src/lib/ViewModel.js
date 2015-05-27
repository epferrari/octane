var _ 						= require('lodash');
var Factory 			= require('./Factory.js');
var _octane 			= require('./_octane.js');
var utils 				= require('./utils.js');
var Events 				= require('./Events.js');
var OctaneModel 	= require('./OctaneModel.js');
var Template 			= require('./Template.js');
var Compiler 			= require('./Compiler.js');





var ViewModel = Factory({

	initialize: function(elem,binding){
								this.DOM_Element = elem;
								//this.DOM_Element.octane_id = this.guid();
								//this.template = Octane.Template.fromString(this.DOM_Element.outerHTML);
								binding = binding || elem.getAttribute('o-model');
								this.raw = elem.outerHTML;
								this.accessors('modelRef',{
									get : function(){ return binding;},
									set : function(alias){
										binding = alias;
										this.watch(binding || '',this.render,this);
										this.render();
									}
								});
								this.watch(binding || '',this.render,this);
								this.render();
							},

	render: 		function(data){

								var lastRender,newRender,markup,span;

								//var currentRender = select('[octane-id="'+this.octane_id+'"]');
								this.DOM_Element.classList.remove("view-active");
								lastRender = this.DOM_Element;
								markup = Template.interpolate(this.raw,data);
								span = document.createElement('span');
								span.innerHTML = markup;
								newRender = span.firstElementChild;
								newRender.setAttribute('octane-id',this.octane_id);
								lastRender.parentElement.replaceChild(newRender,lastRender);
								this.DOM_Element = newRender;
								this.DOM_Element.classList.add('compiled',"view-active");
								if(_octane.initialized) Compiler.compileAll(this.DOM_Element);
							}
},{
	// integrate a Backbone compatible Model into Octane's view binding circuit
	link: 			function(model,alias){

								if(alias === 'App' && _octane.models['App']) throw new Error('Cannot link to App model, choose another model');

								// protected via closure
								var _alias = null;


								// save original methods
								model._legacy_ || (model._legacy_ = {});
								model._legacy_.set 	= model.set;
								model._legacy_.get 	= model.get;
								model._legacy_.clear = model.clear;


								// getter
								if(!model.hasOwnProperty('alias')){
									Object.defineProperty(model,'alias',{
										get: function(){
											return _alias;
										},
										configurable: false
									});
								}


								// attach to an alias for data-binding to views
								_.extend(model,{
										become : function(alias){
												if(alias === 'App' && _octane.models['App']) throw new Error('Cannot replace App model, choose another model');
												this.detach();  // make sure we're detached from one ViewModel reference before binding to another
												_octane.models[alias] && _octane.models[alias].detach();
												_octane.models[alias] = this;
												_alias = alias;
												Events.fire.apply(this,['modelchange:'+alias]);
												return this;
										},
										detach : function(){
												var alias = this.alias;
												if( alias ){
													_octane.models[alias] = null;
													_alias = null;
													Events.fire.apply(this,['modelchange:'+alias]);
												}
												return this;
										},
										set: 	function(key,val,options){

												var inbound,cached,keys,attrKeys,alias,tk,n;

												tk = utils.typeOf(key);
												if(tk === 'object'){
													inbound = key;
													options = val;
												} else if(tk === 'string'){
													(inbound = {})[key] = val;
												} else {
													inbound = {};
												}

												_.extend((cached = {}),this.attributes);


												// array for state properties changed
												keys = Object.keys(attrs);
												n = keys.length;

												// apply any hooks
												if( alias = this.alias ){
													while(n--){
														_octane.hooks[alias+'.'+keys[n]] && OctaneModel.prototype._applyHooks(keys[n],inbound);
													}
												}

												_.forOwn(inbound,function(value,path){

														var attrKey = path.split('.')[0];

														_.set(cached,path,value);

														if(cached[attrKey] !== this.attributes[attrKey]){
															// apply model's original set method
															this._legacy_.set.apply(this,[
																attrKey,
																cached[attrKey],
																options
															]);
															// alert octane listeners
															if(alias){
																Events.fire.apply(this,['modelchange:'+alias+'.'+key]);
															}
														}
												},this);
												return this.attributes;
										},
										get: function(){
												if(this.attributes) this.data = this.attributes;
												return OctaneModel.prototype._get.apply(this,arguments);
										},
										clear: function(options) {
												var attrs = {};
												for (var key in this.attributes) attrs[key] = void 0;
												return this.set(attrs, _.extend({}, options, {unset: true}));
										},
										original : function(){

											//var clone = _.clone(this);
											var ctx = this.constructor;
											var clone = new ctx();
											clone.set(this.attributes);
											_.extend(clone,this,this._legacy_);
											var remove = ['_legacy_','become','detach','original'];
											//_.extend(clone,clone.__legacy__);
											_.each(remove,function(method){
													delete clone[method];
											});
											return clone;
										}

								});
								if(alias) model.become(alias);
								return model;
							},
	unlink: 		function(){
								return ViewModel.discard.apply(this,arguments);
							},

	// remove an assumed Backbone-type Model
	discard: 		function(binding){

								var model = _octane.models[binding];
								if(model){
									if(model._legacy_){
											model.set = model._legacy_.set;
											model.get = model._legacy_.get;
											model.clear = model._legacy_.clear;
									}
									model.alias && model.detach();

									// remove all traces of the intregration
									model.become = null;
									model.detach = null;
									model._legacy_ = null;

									return model;
								}
							},

	get: 				function(binding){
								return _octane.models[binding];
							},

	forceRefresh: function(scope){

								_.each(_octane.models,function(model,name){
									this.fire.apply(model,['modelchange:'+name]);
								},this);
							},

	getScope: 	function(scope){
								var nodes = (scope || document).querySelectorAll('[o-model]');
								_.each(nodes,function(node){
									var vm = new ViewModel(node);
									_octane.viewModels[vm.guid()] = vm;
								});
							}

});

module.exports = ViewModel;
