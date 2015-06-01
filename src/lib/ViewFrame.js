
	var _        = require('lodash');
	var Promise  = require('bluebird');
	var Velocity = require('velocity-animate');
	var uiPack   = require('velocity-ui-pack');
	var Factory  = require('./OctaneBase.js');


	var Frame = Factory.extend({
		defaultPos: 'left',
		prepareFrame: function(elem){

			_.extend(this,{
				id:               elem.id,
				title:            elem.getAttribute('title') || _.startCase(elem.id),
				elem:             elem,
				beforeLoadChecks: [],
				beforeLoadTasks:  [],
				onloadTasks:      [],
				onExitTasks:      []
			});

			var isClassed = false;
			var classes = ['frame-left','frame-right','frame-bottom','frame-top','frame-fade'];
			var n = classes.length;
			var isClassed = _.intersection(this.elem.classList,classes).length > 0;

			if(!isClassed) this.elem.classList.add('frame-'+this.defaultPos);
		},

		checkBeforeLoad: function(predicate){
			this.beforeLoadChecks.push(predicate);
		},

		beforeLoad: function(deferred){
			this.beforeLoadTasks.push(deferred);
		},

		onload: function(callback,args,thisArg){
			this.onloadTasks.push({
				cb:callback,
				args:args,
				thisArg:thisArg
			});
		},

		onExit: function(callback,args,thisArg){
			this.onExitTasks.push({
				cb:callback,
				args:args,
				thisArg:thisArg
			});
		},
		frameWillLoad: function(){

			// check that all predicates are met
			var checked = _.map(this.beforeLoadChecks,function(predicate){
				return new Promise(function(resolve,reject){
					var result = predicate();
					!!result ? resolve() : reject();
				});
			});

			// check that all Promises have resolved
			var completed = _.map(this.beforeLoadTasks,function(deferred){
				return new Promise(deferred);
			});

			return Promise.all(checked.concat(completed))
				.bind(this)
				.then(function(){
					return this;
				});
		},

		frameDidLoad: function(){

			var completed = _.map(this.onloadTasks,this._execute);
			return Promise.settle(completed)
				.bind(this)
				.then(function(){
					return this;
				});
		},

		frameDidExit: function(){

			var completed = _.map(this.onExitTasks,this._execute);
			return Promise.settle(completed)
				.bind(this)
				.then(function(){
					return this;
				});
		},

		_execute: function(task){
			return new Promise(function(resolve){
				task.cb.apply((task.thisArg||this),task.args);
				resolve();
			});
		}

	});

	module.exports = Frame;
