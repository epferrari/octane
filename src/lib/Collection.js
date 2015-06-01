/**
* @todo
*/


/*
var _           = require('lodash');
var _octane     = require('./_octane.js');
var OctaneBase  = require('./OctaneBase.js');
var utils       = require('./utils.js');
var extend      = require('./extend.js');






			function OctaneCollection(models,options){
				models = [];

				OctaneBase.prototype.defineGetter.apply(this,['models',function(){
					return models;
				}]);

				var _alias	= null;
				var queue = [];
				Octane.guid(this);

				this.accessors('queue',{
					set:function(pair){
						queue.push(pair);
					},
					get:function(){
						return queue.pop();
					}
				});
				this.defineGetter('alias',
					function(){
						return _alias;
				});

				this.extend({
					become : function(alias){
						var cols = _octane.collections;
						cols[alias] && cols[alias].detach();
						cols[alias] = this;
						_alias = alias;
						this.fire('collectionchange:'+alias);
						return this;
					},
					detach : function(){
						var alias = this.alias;
						if( alias ){
							_octane.collections[alias] = null;
							_alias = null;
							this.fire('collectionchange:'+alias);
						}
						return this;
					});

				this.reset = function(models){
					models = [];
					this.set(models,options);
				};
				this.template = options.template || null;
				this.model = options.model || OctaneModel;
				this.initialize.apply(this,arguments);
				this.models.add(models);
			}

			OctaneCollection.prototype = new OctaneBase;

			OctaneCollection.prototype.extend({
				initialize: function(){},
				constructor: OctaneCollection
			});


			OctaneCollection.prototype.defineProp({

				create: 		function(dataObj){
					return this.models.push(new this.model(dataObj));
				},
				get: 				function(guid){
					return this.models[guid];
				},
				set: 				function (models,options){

					_.defaults((options||{}),{merge:true});
					models = _.isArray(models)||[models];
					this.each(function(model){

						var guid,existing,isModel = this._isModel(model);
						if(isModel) guid = Octane.guid(model);


						if(existing = this.get(guid))) {
							options.merge && existing.set(model.get());
						} else {
							isModel ? this.models.push(model) : this.create(model);
						}

					})



				},
				remove: 		function(){},
				where: 			function(){},
				pluck: 			function(){},
				fetch: 			function(){},
				push: 			function(){},
				pop: 				function(){},
				shift: 			function(){},
				unshift: 		function(){},
				slice: 			function(){},
				add: 				function (models){

					_.isArray(models)||(models = [models]);
					_.each(models,function(model){
						// is the model an octane model or

						var props = model.state || model.attrs || model;

					}

				},
				_isModel: function(model){
					return model instanceof OctaneModel;
				}

			});

			var methods = ['forEach', 'each', 'map', 'collect', 'reduce', 'foldl',
			'inject', 'reduceRight', 'foldr', 'find', 'detect', 'filter', 'select',
			'reject', 'every', 'all', 'some', 'any', 'include', 'contains', 'invoke',
			'max', 'min', 'toArray', 'size', 'first', 'head', 'take', 'initial', 'rest',
			'tail', 'drop', 'last', 'without', 'difference', 'indexOf', 'shuffle',
			'lastIndexOf', 'isEmpty', 'chain', 'sample', 'partition'];


			_.each(methods, function(method) {
				if (!_[method]) return;
				OctaneCollection.prototype[method] = function() {
					var args = slice.call(arguments);
					args.unshift(this.models);
					return _[method].apply(_, args);
				};
			});
			module.exports = {};
*/
