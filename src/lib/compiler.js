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
		assign: function(qselector,task){

			var guid = this.guid(task);
			var ords = this.ordinances;
			(ords[qselector]||(ords[qselector]={}))[guid] = task;
			return this;
		},

		compile: function(context,qselector){

			if(!qselector){
					qselector = context;
					context = document;
			}
			var tasks = this.ordinances[qselector];

			return new Promise(function(resolve,reject){
				_.each(context.querySelectorAll(qselector),function(elem,index){

					var guid 		= Compiler.guid(elem);
					var tasks	 	= Compiler.ordinances[qselector];

					_.each(tasks,function(task,taskId){

						var ordValue; // the value of a selector's attribute, ex o-sync="ordValue"
						var map = Compiler.nodeMap;

						// task has already been run, return early
						if((map[guid]||{})[taskId]) return;

						// pass the value of the ordinance to the task
						// *if the ordinance is an attribute, selected by wrapped []
						var ord = qselector.match(/\[(.*)\]/);
						_.isArray(ord) && (ord = ord[1]);
						ordValue = elem.getAttribute(ord);

						try{
							// run the task
							task(elem,ordValue);
							// set hashed taskId to true so it doesn't re-run on the same element
							(map[guid]||(map[guid]={}))[taskId] = true;
						} catch (ex){
							Compiler.log(ex);
						}
						elem = null;
					});
				});
				resolve();
			});
		},

		compileAll: function(context){
			context || (context = document);

			var compilationTasks = _.map(this.ordinances,function(ord,qselector){
				return this.compile(context,qselector);
			},this);

			return Promise.all(compilationTasks);
		}
	});

	module.exports = Compiler;
