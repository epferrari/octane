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



	var Promise    = require("bluebird");
	var _          = require("lodash");
	var OctaneBase = require('./OctaneBase.js');
	var _octane    = require('./_octane.js');

	var Compiler   = new OctaneBase('Compiler');



	document.scope = 0;
	Compiler.extend({
		scopes: {},
		ordinances: {},
		nodeMap: {},

		compilers:{},
		disposers:{},

		traverse: function(node,parentNode){
			var n = 0;
			if(!parentNode){
				node = document;
				node.dataset = {octaneScope:n};
				this.traverse(node.firstElementChild,node);
			} else {
				var n = _.indexOf(parentNode.children,node);
				while(node){
					node.dataset.octaneScope = parentNode.dataset.octaneScope + '.' + n;
					if(node.children) this.traverse(node.firstElementChild,node);
					n++;
					node = node.nextElementSibling;
				}
			}
		},

		assign: function(qselector,onCompile,onDispose){
			var ords = this.ordinances;
			(ords[qselector]||(ords[qselector]=[])).push({
				groupName: qselector,
				onCompile: onCompile,
				onDispose: onDispose
			});
			return this;
		},

		getScopedNodes: function(node){
			return _.chain(this.ordinances)
			.map(function(ord,qselector){
				var nodes = node.querySelectorAll(qselector);
				if(nodes.length > 0) return {
					id: qselector,
					nodes: _.toArray(nodes)
				};
			})
			.flatten()
			.compact()
			.value();
		},

		// teardown anything left from a previous compile using the onDispose handler passed by .assign
		cleanUp: function(node){
			return new Promise(function(resolve){
				var lastCompile;
				if(node.dataset && (lastCompile = _.get(this.scopes,node.dataset.octaneScope)) && lastCompile.nodeId !== this.guid(node) ){
						_.each(lastCompile.onDispose,function(fn){
							fn(lastCompile.element);
						});
						// clear the onDispose handlers, they will be replenished at the next compile
						lastCompile.applied = [];
						lastCompile.onDispose = [];
						lastCompile.rendered = null;
				}
				resolve();
			}.bind(this));
		},

		compileAll: function($node){
			//console.log('compiling',$node);
			return new Promise(function(resolve){

				$node || ($node = document);
				var ready = this.cleanUp($node);

				// reconcile the scope
				this.traverse($node,$node.parentElement);

				var scopedNodes;
				return ready.bind(this)
				.then(function(){
					return scopedNodes = this.getScopedNodes($node);
				})
				.bind(this)
				.then(this._compileChildScopes)
				.then(function(childScopes){
					if(childScopes.length){
						_.each(scopedNodes,function(nodeObject){
							nodeObject.nodes = _.difference(nodeObject.nodes,childScopes);
						});
					}
					return _.map(scopedNodes,function(nodeObj){
						return Compiler._compile(nodeObj);
					});
				}).then(function(compiled){
					resolve(Promise.all(
						_(compiled)
						.chain()
						.flattenDeep()
						.compact()
						.value()
					));
				});
			}.bind(this));
		},

		// recursively run compilation on nodes to create child scopes
		_compileChildScopes: function(scopes){
			return Promise.all(
				_(scopes)
				.chain()
				.map(function(scope){
					if(scope.nodes && scope.nodes.length){
						return _(scope.nodes)
						.chain()
						.map(Compiler.compileAll,Compiler)
						.compact()
						.flattenDeep()
						.value();
					}
				})
				.flatten()
				.compact()
				.value()
			).then(function(res){
				return Promise.all(_(res)
				.chain()
				.flattenDeep()
				.compact()
				.value());
			});
		},

		_compile: function(obj){
			return _(Compiler.ordinances)
				.chain()
				.map(function(arr,qselector){
					return arr;
				})
				.flatten()
				.map(function(fnGroup){

					if(obj.id === fnGroup.groupName){
						return _.map(obj.nodes,function(node){
							return new Promise(function(resolve){

								var fnGroupId = Compiler.guid(fnGroup);
								var $scopes = Compiler.scopes;
								var octaneScope = node.dataset.octaneScope;
								var nodeId = Compiler.guid(node);
								var path = octaneScope+'.compiled';
								var compiled = _.get($scopes,path);
								var val,attr;

								if(compiled && compiled.nodeId === nodeId && _.contains(compiled.applied,fnGroupId)){
									// already compiled, return early
									resolve(node);
								} else {

									if(attr = fnGroup.groupName.match(/\[(.*)\]/)){
										attr = attr[1];
										val = node.getAttribute(attr);
									}
									var rendered = fnGroup.onCompile(node,val);

									if(!compiled){
										_.set($scopes,path,{
											applied: [],
											onDispose: [],
											get element(){
												return Compiler.find(octaneScope);
											}
										});
										compiled = _.get(Compiler.scopes,path);
									}

									compiled.nodeId = nodeId;
									compiled.rendered = rendered;
									compiled.applied.push(fnGroupId);
									compiled.onDispose.push(fnGroup.onDispose);
									if(_.isObject(rendered) && rendered.onDispose) compiled.onDispose.push(rendered.onDispose);
									resolve(node);
								}
							});
						});
					}
				})
				.flatten()
				.value();
		},

		flush: function(scope){

			if(scope && scope !== document){

				// flush a single scope
				var identify = this.guid;
				var scopeId = identify(scope);
				var disposed = _.map(this.disposers[scopeId],function(disposer){
					return new Promise(function(resolve,reject){
						disposer();
						resolve();
					});
				});

				Promise.all(disposed).bind(this).then(function(){
					// flush the scope's cache of compiled elements and disposer handlers
					this.disposers[scopeId] = null;
					this.nodeMap[scopeId] = null;
				});

			} else {

				var disposed = _.chain(this.disposers)
					.map(function(scoped,id){
						return _.map(scoped,function(disposers){
							return new Promise(function(resolve,reject){
								disposer();
								resolve();
							});
						});
					})
					.flatten()
					.value();

				Promise.all(disposed).bind(this).then(function(){
					// flush entire cache
					this.disposers = {};
					this.nodeMap = {};
				});
			}
		},

		/* document.querySelector('[data-octane-scope="0.0.1"][data-octane-scope="0.0.1.2"]') */
		// precision querySelection
		find: function(octaneScope){
			var DATA_OCTANE_SCOPE = '[data-octane-scope="';
			var CLOSE_BRACKET = '"]>';
			var FINAL_BRACKET = '"]';
			var split = octaneScope.toString().split('.');
			split.shift();
			var len = split.length;
			var query = split.reduce(function(prev,curr,index){
				var currN = prev.n + '.' + curr;
				if(index !== len-1){
					return {
						n: currN,
						q: prev.q + DATA_OCTANE_SCOPE + currN + CLOSE_BRACKET
					};
				} else {
					return {
						n: currN,
						q: prev.q + DATA_OCTANE_SCOPE + currN + FINAL_BRACKET
					};
				}
			},{n: 0,q:''});
			return document.querySelector(query.q);
		},
	});

	Compiler
	.any('page:exiting',function(e){
		if(e.detail){
			var page = e.detail.page;
			var scope = _octane.pages[page].view;
			//Compiler.flush(page);
		}
	})
	.any('routing:complete',function(e){
		if(e.detail){
			var page = e.detail.page;
			var scope = _octane.pages[page].view;
			//Compiler.compileAll(scope);
		}
	});

	global.Compiler = Compiler;

	module.exports = Compiler;
