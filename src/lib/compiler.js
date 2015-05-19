
var Promise 	= require("bluebird");
var _ 				= require("lodash");
var OctaneBase = require('./factory.js');

var Compiler = new OctaneBase();

Compiler.extend({
	ordinances: {},
	nodeMap: 		{},
	assign: 		function(qselector,task){

								var guid = this.guid(task);
								var ords = this.ordinances;
								(ords[qselector]||(ords[qselector]={}))[guid] = task;
							},

	applyOrdinance:function(context,qselector){

								if(!qselector){
										qselector = context;
										context = document;
								}
								var tasks = this.ordinances[qselector];

								return new Promise(function(resolve,reject){
									_.each(context.querySelectorAll(qselector),function(elem,index){
										//console.log(selector);
										//console.log(elem);

										var guid 		= this.guid(elem);
										var tasks	 	= this.ordinances[qselector];

										_.each(tasks,function(task,taskId){

											var ordValue; // the value of a selector's attribute, ex o-sync="ordValue"
											var map = this.nodeMap;

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
												this.log(ex);
											}
											elem = null;
										},Compiler);
									},Compiler);
									resolve();
								});
							},

	run: 				function(context){
								context || (context = document);

								var tasksCompleted = (Object.keys(this.ordinances)).map(function(qselector){
									return this.applyOrdinance(context,qselector);
								}.bind(this));

								return Promise.all(tasksCompleted);
							}
});

module.exports = Compiler;
