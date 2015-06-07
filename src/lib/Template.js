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



	var _           = require('lodash');
	var appFilters  = require('./_octane.js').filters;
	var utils       = require('./utils.js');
	var _octane     = require('./_octane.js');
	var Compiler    = require('./Compiler.js');
	var Factory     = require('./Factory.js');

	var Template    = Factory('Template',{

		//Proto Methods

		initialize: function(elem){
			if(!elem) return;
			this.name = elem.getAttribute('name') || elem.octane_id || this.guid(elem);
			this.raw 	= elem.innerHTML;
			this.content = '';
		},
		set: function(data){

			_.isObject(data) || (data = {});

			this.content = Template.interpolate(this.raw,data);
			return this;
		},
		render: function(dest){
			return Template._render(this,null,'mountable');
		},

		prependTo: function(dest){
			Template._render(this,dest,'prepend');
		},
		appendTo: function(dest){
			Template._render(this,dest,'append');
		},
		save: function(){
			if(!_octane.templates[this.name]){
				_octane.templates[this.name] = this;
			}else{
				this.log('Could not create template '+this.name+'. Already exists');
			}
		}
	},{

		//Static Methods

		get: function(name){

			if(_octane.templates[name]){
				return _octane.templates[name];
			} else {
				this.log('Template '+name+' does not exist');
			}
		},

		create: function(elem){
			return new Template(elem);
		},

		fromString: function(name,markup){

			if(!markup) {
				markup = name;
				name = undefined;
			}
				var div = document.createElement('div');
				div.name = name;
				div.innerHTML = markup;
				return new Template(div);
		},

		compile: function(scope){

			scope || (scope = document);

			var tmpls = scope.querySelectorAll('script[type="text/octane-template"],o-template');
			var t = tmpls.length;

			while(t--){
				this._cache(tmpls[t]);
			}
		},

		_cache: function(elem){

			if(elem){
				// compile nested templates
				this.compile(elem);
				var tmp = this.create(elem);
				tmp.save();
				elem.parentElement.removeChild(elem);
			}
		},

		interpolate: function(markup,data){

			var pattern = /\{\{([^{^}]+)\}\}/g;
			var matches = markup.match(pattern);
			var n;

			if(_.isArray(matches)){
				n = matches.length;
				while(n--){
					markup = this._interpolate(markup,matches[n],data);
				}
			}
			return markup;
		},

		_interpolate: function (markup,match,data){


			// begin: {{postedBy.firstName @filter:myFilter(param) @default(value)}}
			var stripped = match.replace(/[{}]+/g,'');
				// ^result: postedBy.firstName @filter:myFilter(param) @default(value)
			var split = stripped.split(/\s/);
				// ^result: ["postedBy.firstName","@filter:myFilter","@default(value)"]
			var key = split.shift();
				// ^result: "postedBy.firstName"
			var modifiers = split.join(' ');
				// ^result: "@filter:myFilter(param) @default(value)"
			var filterString 	= (modifiers.match( /@filter:(?=([^\s]+))/ ) || ['',''])[1];
				// ^result: "myFilter(param)"
			var filter				= (filterString.match( /^([^(]+)/ )  || ['',''])[1];
				// ^result: "myFilter"
			var filterParams 	= (filterString.match( /\((.*)\)/ ) || ['',''])[1];
				// ^result: "param"
			var defaultValue = (modifiers.match( /@default\((?:(.*))\)/ ) || ['',''])[1];
				// ^result: "value"
			var nested = key.split('.');
				// result: ["postedBy","firstName"]
			var n = nested.length;

			var value = nested.reduce(function (prev,curr,index){
					if(index === (n-1) && _.isObject(prev)){
						// last iteration, return value
						return prev[curr];
					}
					if(_.isObject(prev)){
						// go one level deeper
						return prev[curr];
					} else {
						// no further nesting, value defined in key does not exist
						return null;
					}
			// start with data object passed to template
			},data);

			if(value === undefined || value === null){
				if(defaultValue.length >0) value = defaultValue;
				else value = ''
			}

			// apply filter if present
			// filter is applied to this arg with val and model properties set
			if(filter.length > 0){
				var paramsArray = filterParams.split(',');
				try{
					if(appFilters[filter]){
						value = appFilters[filter].apply({val:value,model:data},paramsArray).val;
					} else if(_.isFunction(''[filter])){
						value = ''[filter].apply(value,paramsArray);
					} else if(_.isFunction(utils[filter])){
						value = utils[filter](value,params);
					}
				} catch (err){
					this.log('Could not filter data '+value,err);
				}
			}

			// replace all occurences of {{postedBy.firstName @filter:myFilter @param:myParam}}
			// in template with filtered value of data.postedBy.firstName,
			// or data.postedBy.firstName if "myFilter" didn't exist
			return  markup.replace(match,value);
		},

		_render: function (template,dest,method){

			if(template.content == '') template.content = template.raw;

			// a surrogate
			var span = document.createElement('span');
			var nodes,returnNode;

			// turn surrogate html into nodes
			span.innerHTML = template.content;
			span.normalize();
			nodes = span.childNodes;

			if(method === 'prepend'){
				var i=0;
				var n=nodes.length,node;
				var firstChild = dest.firstChild;
				for(;i<n;i++){
						node = nodes[i];
						if(node && node.nodeType == (Node.ELEMENT_NODE || Node.TEXT_NODE)){
							dest.insertBefore(node,firstChild);
						}
				}
			} else if(method === 'append'){
				var i=0,n=nodes.length,node;
				for(;i<n;i++){
						node = nodes[i];
						if(node && node.nodeType == (Node.ELEMENT_NODE || Node.TEXT_NODE)){
							dest.appendChild(nodes[i]);
						}
				}
			} else if(method === 'mountable'){
				if(nodes.length === 1){
					returnNode = span.firstElementChild;
				} else {
					returnNode = span;
				}
			} else {
				dest.innerHTML = template.content;
			}
			template.content = '';
			if(_octane.initialized) Compiler.complileAll(dest);
			return returnNode;
		},


	});

	module.exports = Template;
