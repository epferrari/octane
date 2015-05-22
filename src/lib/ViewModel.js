var _ 						= require('lodash');
var OctaneBase 		= require('./OctaneBase.js');
var _octane 			= require('./_octane.js');
var utils 				= require('./utils.js');
var Events 				= require('./Events.js');
var OctaneModel 	= require('./OctaneModel.js');
var Template 			= require('./Template.js');
var Compiler 			= require('./Compiler.js');





var ViewModel = OctaneBase.extend({

	initialize: function(elem,binding){
								this.DOM_Element = elem;
								//this.DOM_Element.octane_id = this.guid();
								//this.template = Octane.Template.fromString(this.DOM_Element.outerHTML);
								binding = binding || this.DOM_Element.getAttribute('o-model');
								this.raw = this.DOM_Element.outerHTML;
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
								if(OctaneBase.appInitialized) Compiler.run(this.DOM_Element);
							}
});
