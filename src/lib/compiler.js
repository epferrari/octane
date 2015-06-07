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

	function addScope(node,parentScopeRef){
		console.log('node',node);
		console.log('parentScopeRef',parentScopeRef);
		var scope;
		if(node === document){
			scope = node.scope = 0;
		} else if(parent){
			var parentScope = _.get(Compiler.scopes,parentScopeRef);
			var pos = parentScope.length;
			scope = node.scope = node.dataset.scope = parentScopeRef + '.' + pos;
			_.set(Compiler.scopes,scope,{
				id: Compiler.guid(node),
				compiled: [],
				length: 0
			});
			parentScope.length++;
		}
		return scope;
	}


	document.scope = 0;
	Compiler.extend({
		scopes: {
			0:{
				nodeDidCompile: [],
				id:Compiler.guid(document),
				length:0
			}
		},
		ordinances: {},
		nodeMap: {},
		disposers:{},
		assign: function(qselector,onRender,onDispose){
			var compilerId = this.guid(onRender);
			var ords = this.ordinances;
			(ords[qselector]||(ords[qselector]=[])).push({
				id: qselector,
				onRender: onRender,
				onDispose: onDispose
			});
			return this;
		},

		compile: function(scope,qselector){

			return new Promise(function(resolve,reject){
				if(!qselector){
						qselector = scope;
						scope = document;
				}
				var taskGroup = Compiler.ordinances[qselector];
				var scopeId = Compiler.guid(scope);
				var disposers = (Compiler.disposers[scopeId]||(Compiler.disposers[scopeId] = []));
				var map = Compiler.nodeMap;

				var scopes = _.flatten(scope.querySelectorAll(qselector));
				scopes = _.flatten(scopes);
				scopes = _.map(scopes,function(DOMnode,index){
					console.log(DOMnode);
					return Compiler.compileAll(DOMnode).then(function(){
						var nodeId = Compiler.guid(DOMnode);
						if(!DOMnode.scope) addScope(DOMnode,scope);
						var nodeScope = _.get(Compile.scopes,DOMnode.scope);

						_.each(taskGroup,function(taskSet,taskSetId){

							// push disposal handlers for this task to the scope to be run on flush
							//taskSet.onDispose && disposers.push(taskSet.onDispose);


							var val,attr;


							if(_.contains(nodeScope.nodeDidCompile,taskSetId)) return;


							//if (_.get(map,scopeId+'.'+nodeId+'.'+taskSetId)) return;
							// node has already been compiled on this render, return early
							//map[scopeId]||(map[scopeId]={});
							//map[scopeId][nodeId]||(map[scopeId][nodeId] = {});
							//if(map[scopeId][nodeId][taskSetId]) return;


							// pass the value of the ordinance to the task
							// *if the ordinance is an attribute, selected by wrapped []
							if(attr = qselector.match(/\[(.*)\]/)){
								attr = attr[1];
								val = DOMnode.getAttribute(attr);
							}

							try{
								// run the task, which may return an object with an .onDispose handler
								var compiled = taskSet.onRender(DOMnode,val);
								nodeScope.nodeDidCompile.push(taskSetId);
								// set hashed taskId to true so it doesn't re-run on the same element
								//_.set(map,scopeId+'.'+nodeId+'.'taskSetId,true);
								//map[scopeId]||( map[scopeId]={} );
								//map[scopeId][nodeId]||(	map[scopeId][nodeId]={} );
								//map[scopeId][nodeId][taskSetId] = true;
								// push onDispose handler to the flusher
							} catch (ex){
								Compiler.log(ex);
							}
							DOMnode = null;
						});
					});
				});

				console.log(scopes);
				scopes.then(resolve);
			});
		},

		compileAll: function(node,parentScope){
			return new Promise(function(resolve){
				node || (node = document);
				//var parentScope = _.get(Compiler.scopes,parentScopeRef) || {};
				parentScope || (parentScope = []);
				var toCompile = _.chain(Compiler.ordinances)
				.map(function(ord,qselector){
					var nodes = node.querySelectorAll(qselector);
					if(nodes.length > 0) return {
						id: qselector,
						nodes: nodes
					};
				})
				.flatten()
				.compact()
				.each(function(n){
					Compiler.guid(n);
				})
				.value();

				//if(!node.scope) addScope(node,parentScopeRef);
				// remove nodes in this scope from the parent scope
				// so they are only in this scope
				function removeNodesFromParentScope(toCompile,parentScope){
					return new Promise(function(resolve){
						_.each(toCompile,function(object){

							var id = object.id;
							var nodeList = object.nodes;
							var parentObject = _.find(parentScope,{id: id});
							var index = parentScope.indexOf(parentObject);
							if(index > 0){
								parentScope[index].nodes = _.difference(parentObject.nodes,_.toArray(nodeList));
							}
						});
						resolve(toCompile);
					});
				}


				// recursively run compilation on nodes to create child scopes
				var compileChildNodes = function(toCompile){
					return Promise.all(_.map(toCompile,function(obj){
						if(obj.nodes){
							return Promise.all(_.map(obj.nodes,function(node){
								return Compiler.compileAll(node,toCompile);
							}))
							.then(function(){
								return Promise.all(_(Compiler.ordinances)
								.chain()
								.map(function(arr,qselector){
									/* arr = [{id:'o-view',onRender:fn,onDispose:fn},{id:'o-modal',onRender:fn,onDispose:fn}] */
									return arr;
								})
								.flatten()
								.map(function(group){
									if(obj.id === group.id){
										return Promise.all(_.map(obj.nodes,function(node){
											return new Promise(function(resolve){
												//addScope(node,parentScope);
												var val,attr;
												if(attr = group.id.match(/\[(.*)\]/)){
													attr = attr[1];
													val = node.getAttribute(attr);
												}
												group.onRender(node,val);
												resolve();
											});
										}));
									}
								})
								.value());
							});
						}
					}));
				};

				compileChildNodes(toCompile).then(function(){
					return removeNodesFromParentScope(toCompile,parentScope);
				}).then(function(){
					console.log('scope',node);
					console.log('toCompile',toCompile);
				}).then(resolve);

			});
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
		}
	});

	Compiler
	.any('page:exiting',function(e){
		if(e.detail){
			var page = e.detail.page;
			var scope = _octane.pages[page].view;
			Compiler.flush(page);
		}
	})
	.any('routing:complete',function(e){
		if(e.detail){
			var page = e.detail.page;
			var scope = _octane.pages[page].view;
			Compiler.compileAll(scope);
		}
	});

	global.Compiler = Compiler;

	module.exports = Compiler;
