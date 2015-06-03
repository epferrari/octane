/*
* Copyright 2015 Ethan Ferrari, OneFire Media Inc.
*
*	Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*		http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*/




/**
* @todo everything
*/

/*
// experimental
var _ = require('lodash');
function OctaneElement(t,a,c){
	this.type 		= t || 'span';
	this.attrs 		= a || {};
	this.children = c || [];
}
_.extend(OctaneElement.prototype,{
	render: 		function(){
								var el = document.createElement(this.type);
								_.each(this.children,function(child){
									if(_.isString(child)){
										el.innerHTML = el.innerHTML+child;
									} else if(child instanceof OctaneElement){
										el.appendChild(child.render());
									} else if(child instanceof OctaneComponent){
										Octane.render(child,el);
									} else if(child instanceof HTMLElement){
										el.appendChild(child);
									}
								});
								if(this.attrs.styles){
									_.each(this.attrs.styles,function(val,key){
										el.style[key] = val;
									});
								}
								_.extend(el,this.attrs);
								return el;
							}
});

Octane.createElement = function(type,attrs,children){
	return new OctaneElement(type,attrs,children);
};





function OctaneComponent (params){

	_.extend(this,params);
	this.props = {};
	this.state = {};
	//Octane.guid(this);

	this._renderedTo = null;

	Octane.defineProp.call(this,{
		update: 	function(){
								if(this.hasMounted) Octane.render(this,this._renderedTo);
							},
		setState: function(obj){
								_.extend(this.state,obj);
								if(this.hasMounted) this.update();
							}
	});

	Octane.defineGetter.call(this,'Node',
							function(){
								if(this._renderedTo){
									return this._renderedTo.querySelector('[octane-id="'+this.octane_id+'"]');
								}
							});
}

_.extend(OctaneComponent.prototype,{
	render: function(){},
	getInitialState: function(){},
	beforeMount: function(){
		return Promise.resolve();
	},
	onMount: function(){},
	onUnmount: function(){}
});



Octane.Component = function(params){
	var factory = function ComponentFactory(props){
		var cmp = new OctaneComponent(params);
		_.extend(cmp.props,props);
		return cmp;
	};
	factory.create = function(props){
		var cmp = new OctaneComponent(params);
		_.extend(cmp.props,props);
		return cmp;
	};
	return factory;
};


Octane.render = function(Component,container){

	var newRender;
	var lastRender = Component.Node;
	if(lastRender){
		newRender = Component.render();
		if(newRender instanceof OctaneElement) newRender = newRender.render();
		newRender.setAttribute('octane-id',Component.octane_id);
		Component._renderedTo.replaceChild(newRender,lastRender);
	} else {
		Component._renderedTo = container;
		Component.getInitialState();
		Component.beforeMount().then(function(){
			newRender = Component.render();
			if(newRender instanceof OctaneElement) newRender = newRender.render();
			Component.octane_id = octane.guid(newRender);
			container.appendChild(newRender);
			Component.hasMounted = true;
			Component.onMount();
		});
	}
};
*/
/* end experimental */
