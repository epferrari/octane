var _ 						= require('lodash');
var OctaneBase 		= require('./factory.js');
var _octane 			= require('./_octane.js');
var utils 				= require('./utils.js');
var Events 				= require('./events.js');
var OctaneModel 	= require('./model.js');
var ViewModel 		= require('./view-model.js');


var Mediator = new OctaneBase();

// singleton
Mediator.defineProp({

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
												if(alias === 'App' && _octane.models['App']) throw new Error('Cannot link to App model, choose another model');
												this.detach();  // make sure we're detached from one Mediator reference before binding to another
												_octane.models[alias] && _octane.models[alias].detach();
												_octane.models[alias] = this;
												_alias = alias;
												Events.fire.apply(this,['statechange:'+alias]);
												return this;
										},
										detach : function(){
												var alias = this.alias;
												if( alias ){
														_octane.models[alias] = null;
														_alias = null;
														Events.fire.apply(this,['statechange:'+alias]);
												}
												return this;
										},
										set: 	function(key,val,options){

												var attrs,attrs,cached,keys,attrKeys,alias,tk,n;

												tk = utils.typeOf(key);
												if(tk === 'object'){
													attrs = key;
													options = val;
												} else if(tk === 'string'){
													(attrs = {})[key] = val;
												} else {
													attrs = {};
												}

												_.extend((cached = {}),this.attributes);


												// array for state properties changed
												keys = Object.keys(attrs);
												n = keys.length;

												// apply any hooks
												if( alias = this.alias ){
													while(n--){
														_octane.hooks[alias+'.'+keys[n]] && OctaneModel.prototype._applyHooks(keys[n],attrs);
													}
												}

												_.forOwn(attrs,function(value,key){
														var keyArray = key.split('.');
														var attrKey = keyArray[0];
														var k = keyArray.length;

														// run the reducer from OctaneModel._set, but on the cached attrs
														keyArray.reduce(function(o,x,index){
															if(index == (k-1)){ // last iteration
																	return o[x] = value;
															}else{
																	return o[x] = _.isObject(o[x]) ? o[x] : {};
															}
														},cached);

														if(cached[attrKey] !== this.attributes[attrKey]){
															// apply model's original set method
															this._legacy_.set.apply(this,[ attrKey,cached[attrKey],options ]);
															// alert octane listeners
															if(alias){
																	Events.fire.apply(this,['statechange:'+alias+'.'+key]);
															}
														}
												},this);
												return this.attributes;
										},
										get : function(){
												if(this.attributes) this.state = this.attributes;
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
								return Mediator.discard.apply(this,arguments);
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

								_.each(_octane.models,function(model,key){
									this.fire.apply(model,['statechange:'+key]);
								},this);
							},

	getScope: 	function(scope){
								var nodes = (scope || document).querySelectorAll('[o-model]');
								_.each(nodes,function(node){
										var vm = new ViewModel(node);
								});
							}

});

module.exports = Mediator;
