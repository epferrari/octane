// set-up for Views constructor

octane.module('OctaneViews',['ViewController']).extend({

		initialize : function(cfg){

				var views          	= {};
				var ViewController  = this.imports.ViewController.Factory;
				var OctaneView      = ViewController.extend({

					// Instance Methods

					initialize: function(elem){

												if(!elem) throw new Error('Must pass an HTMLElement to OctaneView');

												this.configure(elem);
												this.view = this.elem;
												this.name = _.capitalize(_.camelCase(this.title))+'ViewController';
												views[this.id] = this;
											},

					constructor:function OctaneView(){ return octane.Controller.apply(this,arguments); },

					destroy: 		function(){
												this._destroy();
												delete views[this.name];
											},
				},{
					// Static Methods

					create: 		function(elem){
												return new OctaneView(elem);
											},

					destroy: 		function(id){
												var view = this.get(id);
												view && view.destroy();
											},

					get: 				function(id){
												return views[id];
											}
				});

				octane.compiler('o-view',OctaneView.create.bind(OctaneView));

				octane.defineGetter.apply(OctaneView,['list',function(){
					return Object.keys(views);
				}]);

				octane.defineProp({ View : OctaneView });

		}
});
