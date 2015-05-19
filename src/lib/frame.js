var _ 					= require('lodash');
var Promise 		= require('bluebird');
var Velocity 		= require('velocity-animate');
var uiPack 			= require('velocity-ui-pack');
var Factory  		= require('./factory.js');


var Frame = Factory.extend({

	prepareFrame:    function(elem){

									_.extend(this,{
											id              : elem.id,
											title           : elem.getAttribute('title') || _.startCase(elem.id),
											elem            : elem,
											beforeLoadTasks : [],
											onloadTasks     : [],
											onExitTasks     : []
									});

									var isClassed = false;
									var viewClasses = ['view-left','view-right','view-bottom','view-top','view-fader'];
									var n;

									_.isArray(cfg.extraViewClasses) && viewClasses.concat(cfg.extraViewClasses);
									n = viewClasses.length;

									while(n--){
										if(this.elem.classList.contains(viewClasses[n]) ){
											isClassed = true;
											break;
										}
									}
									!isClassed && this.elem.classList.add('view-left');
								},
	beforeLoad:   function(deferred){
									try{
										this.beforeLoadTasks.push(deferred);
									} catch(ex){
										this.log && this.log('cannot push "beforeLoad" promise to view '+this.id+', reason: '+ex.message);
									}
								},
	onload:       function(callback,args){
									try{
										this.onloadTasks.push([callback,args]);
									}catch(ex){
										this.log && this.log('cannot push "onload" callback to view '+this.id+', reason: '+ex.message);
									}
								},

	onExit:       function(callback,args){
									try{
										this.onExitTasks.push([callback,args]);
									}catch(ex){
										this.log && this.log('cannot push "onExit" callback to view '+this.id+', reason: '+ex.message);
									}
								},
	frameWillLoad:function(){

									var todos = this.beforeLoadTasks;
									var completed = _.map(todos,function(deferred){
										if(_.isFunction(deferred)) return new Promise(deferred);
									});
									return Promise.all(completed);
								},

	frameDidLoad:   function(){

									var todos = this.onloadTasks;
									var completed = _.map(todos,this._execute);
									return Promise.settle(completed);
								},

	frameDidExit:   function(){

									var todos = this.onExitTasks;
									var completed = _.map(todos,this._execute);
									return Promise.settle(completed);
								},

	_execute:     function(task){
									return new Promise(function(resolve,reject){
										var callback = task[0];
										var args = task[1];
										if(_.isFunction(callback)) callback(args);
										resolve();
									});
								}

});

module.exports = Lifecycle;
