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

		traverseAsync: function(node){
			var onComplete,onFail;
			var promise = new Promise(function(res,rej){
				onComplete = res;
				onFail = rej;
			});

			this.traverseSync(node,onComplete);
			return promise;
		},

		traverseSync: function(node,cb){
			var n = 0;
			if(node === document){
				node.dataset = {octaneScope: 0};
			}
			_.each(node.children,function(child){
				child.dataset.octaneScope = node.dataset.octaneScope + '.' + n;
				this.traverseSync(child);
				n++;
			},this);
			if(cb){
				cb(node);
			} else {
				return node;
			}
		},

		assign: function(qselector,onCompile,onDispose){
			var ords = this.ordinances;
			// give the assignment object a unique id
			var ord = {
				selector: qselector,
				onCompile: onCompile,
				onDispose: onDispose
			};
			var key = Compiler.guid(ord);
			(ords[qselector]||(ords[qselector]={}))[key] = ord;
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

		convertToScopesPath: function(path){
			//return path && path.replace(/\./g,'.children.');
			return path;
		},

		// a temporary tree for diffing
		getDiffTree: function($node){

				// ensure the DOM nodes have the proper data-octane-scope attribute
				return this.traverseAsync($node)
				.bind(this)
				.then(function(){
					return _(this.ordinances)
					.chain()
					.reduce(function(acc,ords){
						return _.merge(acc,ords);
					})
					.map(function(ord,key){
						return new Promise(function(resolve){
							var nodes = $node.querySelectorAll(ord.selector);
							// cthe _.get() path for the ordinance object in Compiler.ordinances
							var path = ord.selector + '.' + key;
							var nodeMap = _.map(nodes,function(node){
								return {
									node: node,
									ordinance: ord
								};
							});
							resolve(nodeMap);
						});
					})
					.thru(function(arr){
						return Promise.all(arr);
					})
					.value()
					.then(_.flatten)
					.reduce(function(scopes,result){
						var scopeObject;
						var domPath = result.node.dataset.octaneScope;
						console.log('DOM PATH',domPath);
						if(scopeObject = _.get(scopes,domPath)){
							// add the ordinance key to a path nested in the
							// temporary scopes tree
							// we're assuming for comparison that the key has been compiled on node
							// If there's a discrepancy with the actual Compiler.scopes when we diff,
							// we recompile the node.
							(scopeObject.didCompile || (scopeObject.didCompile = [])).push(result.ordinance);
						} else {
							// create a new scopeObejct for the temp scope tree at scopePath
							scopeObject = {
								didCompile: [result.ordinance],
							};
						}
							if(!scopeObject.DOMnode){
								Object.defineProperty(scopeObject,'DOMnode',{
									get: function(){
										return Compiler.find(domPath);
									}
								});
							}
						// set the scopeObject into the temp scope tree
						_.set(scopes,domPath,scopeObject);
						return scopes;
					},{});
				});
		},


		/**
		*
		* @param diffTree {object} A temporary scope object created from a node with `.getDiffTree`
		* @param atPath {string} The data-octane-scope path of a node, ex. `0.0.0.1.2`
		*/
		diff: function(diffTree,path){
			//console.log('diffTree',diffTree);
			console.log('path',path);
			var prevScope = _.get(Compiler.scopes,path);

			if(diffTree == prevScope || _.isEmpty(diffTree)) {
				return Promise.resolve();
			}else{

				//console.log('diffing');
				// else the tree is not the same as what's on the DOM at this level, diff it in 4 steps
				return new Promise(function(resolve){



					// (2) apply applicable ordinances at root level of the diffTree
					_.each(diffTree.didCompile,function(ord){
						if(!prevScope || (prevScope && !_.contains(prevScope.didCompile,ord))){
							if(prevScope){

								// (1) drop the data-octane-scope's handlers from the Event system to manage memory and performance
								Compiler.forgetFrom({octane_id:path});
								// call any additional dispose handlers defined by ordinances
								prevScope && _.each(prevScope.didCompile,function(ord){
									//var onDisposeFunc = _.get(Compiler.ordinances,ordId +'.onDispose');
									//onDisposeFunc.call();
									ord.onDispose && ord.onDispose();
								});
								//console.log('prevScope.didCompile',prevScope.didCompile);
								//console.log('difftree.didCompile',diffTree.didCompile);
							}
							var onCompileFunc = ord.onCompile;
							var elem,attr,val;

							if( elem = diffTree.DOMnode ){
								// elem now equals the current element at 0.x.x.x position on the DOM
								// TODO: leaving pseudo-guid for now but will replace with data-octane-scope use in Quarterback
								elem.octane_id = path;
								if(attr = ord.selector.match(/^\[(.*)\]$/)){
										attr = attr[1];
										val = elem.getAttribute(attr);
								}

								// polymorph elem's native `.addEventListener` and `.removeEventListener`
								// methods to use the Octane Event API
								elem.addEventListener = function(event,handler,useCapture){
									//console.log('event listener added',event);
									//console.log('path',path);
									//console.log('id',elem.octane_id);
									console.log(path);
									Compiler.on(event,{octane_id:path},handler);
								};
								elem.removeEventListener = function(event,handler){
									Compiler.forget(event,{octane_id:path},handler);
								};

								// call the compiler function with on the current node
								onCompileFunc(elem,val);
							}
						}
					});
					// (3) recursively apply diffs to children of this scope
					// maybe this takes some time, so let's do it async
					//console.log('diffTree',diffTree);
					_(diffTree)
					.chain()
					.map(function(child,key){
						//console.log('key',key);
						//console.log('parsed int',parseInt(key));
						if(key != 'didCompile' && key != 'DOMnode'){
							var $path = path +'.'+key;
							return Compiler.diff(child,$path);
						}
					})
					.thru(function(arr){
						return Promise.all(arr);
					})
					.value()
					// (4) replace the Compiler.scopes tree with the diffTree
					.then(function(){
						diffTree = _.toPlainObject(diffTree);
						//console.log('object ensured diffTree',diffTree)
						//console.log(_.get(Compiler.scopes,path));

						_.set(Compiler.scopes,path,diffTree);
					})
					// resolve this diff operation
					.then(resolve);
				}.bind(this));
			}
		},


		compileAll: function($node){
			console.log($node);
			$node || ($node = document);
			var diffTree = this.getDiffTree($node);
			// $node.dataset.octaneScope will be set on $node when `Compiler.traverseAsync`
			return diffTree.bind(this).then(function(tree){
				return this.diff(tree,$node.dataset.octaneScope);
			});
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

	/*
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
	*/


	global.Compiler = Compiler;

	module.exports = Compiler;
