octane.module('ViewController').extend({

		initialize : function(cfg){
			var Velocity = Velocity || $.Velocity;
			var ViewController = octane.Factory.extend({

				configure:    function(elem){

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

				setCanvasHeight:function(){

												var windowHeight = window.document.body.offsetHeight;
												this.elem.style.height = octane.viewContainer.style.height = windowHeight+'px';

											},

				beforeLoad:   function(deferred){
												try{
													this.beforeLoadTasks.push(deferred);
												} catch(ex){
													octane.log('cannot push "beforeLoad" promise to view '+this.id+', reason: '+ex.message);
												}
											},

				onload:       function(callback,args){
												try{
													this.onloadTasks.push([callback,args]);
												}catch(ex){
													octane.log('cannot push "onload" callback to view '+this.id+', reason: '+ex.message);
												}
											},

				onExit:       function(callback,args){
												try{
													this.onExitTasks.push([callback,args]);
												}catch(ex){
													octane.log('cannot push "onExit" callback to view '+this.id+', reason: '+ex.message);
												}
											},

				_load:        function(){
												this.setCanvasHeight();
												this.elem.classList.add('view-active');
												Velocity(this.elem,'scroll',{duration:100});
												return Promise.delay(405)
												.bind(this)
												.then( this.setCanvasHeight );
											},

				_queue:   		function(){

												this.elem.classList.add('view-queued');
												this.elem.classList.remove('view-active');
												return Promise.delay(405);
											},

				_exit:        function (){
												this.elem.classList.remove('view-active');
												this.elem.classList.remove('view-queued');
												return this._runOnExit().delay(805);
											},

				_runBeforeLoad:function(){

												var todos = this.beforeLoadTasks;
												var completed = _.map(todos,function(deferred){
													if(_.isFunction(deferred)) return new Promise(deferred);
												});
												return Promise.all(completed);
											},

				_runOnload:   function(){

												var todos = this.onloadTasks;
												var completed = _.map(todos,this._execute);
												return Promise.settle(completed);
											},

				_runOnExit:   function(){

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

			this.export(ViewController);

		} // end initialize

}); // end module
