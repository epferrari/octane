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

	var Compiler   = new OctaneBase();

	Compiler.extend({
		ordinances: {},
		nodeMap: {},
		disposers:{},
		assign: function(qselector,onRender,onDispose){

			var compilerId = this.guid(onRender);
			var disposerId = this.guid(onDispose);
			var ords = this.ordinances;
			this.disposers[disposerId] = onDispose;
			(ords[qselector]||(ords[qselector]={}))[compilerId] = {
				onRender: onRender,
				onDispose: disposerId
			};
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

				_.each(taskGroup,function(taskSet,taskSetId){

					// push disposal handlers for this task to the scope to be run on flush
					taskSet.onDispose && disposers.push(taskSet.onDispose);

					_.each(scope.querySelectorAll(qselector),function(DOMnode,index){

						var nodeId 	  = Compiler.guid(DOMnode);
						var val,attr;

						// node has already been compiled on this render, return early
						if((((map[scopeId]||{})[nodeId])||(map[scopeId][nodeId]={}))[taskSetId]) return;

						// pass the value of the ordinance to the task
						// *if the ordinance is an attribute, selected by wrapped []
						if(attr = qselector.match(/\[(.*)\]/){
							attr = attr[1];
							val = DOMnode.getAttribute(attr);
						}

						try{
							// run the task, which may return an object with an .onDispose handler
							var compiled = taskSet.onRender(DOMnode,val);
							// set hashed taskId to true so it doesn't re-run on the same element
							((map[scopeId]||(map[scopeId]={}))[nodeId]||(map[scopeId][nodeId]={}))[taskSetId] = true;
							// push onDispose handler to the flusher
							if(compiled.onDispose) disposers.push(compiled.onDispose);
						} catch (ex){
							Compiler.log(ex);
						}
						DOMnode = null;
					});
				});
				resolve();
			});
		},

		compileAll: function(scope){
			scope || (scope = document);

			var compilationTasks = _.map(this.ordinances,function(ord,qselector){
				return this.compile(scope,qselector);
			},this);

			return Promise.all(compilationTasks);
		},

		flush: function(scope){

			if(scope && scope !== document){

				// flush a single scope
				var identify = this.guid;
				var scopeID = identify(scope);
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
	.any('routing:begin',function(e){
		var page = e.detail.page;
		Compiler.flush(page);
	})
	.any('routing:complete',function(e){
		var page = e.detail.page;
		Compiler.compileAll(page);
	})

	module.exports = Compiler;
