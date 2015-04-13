
		octane.module('Debug').extend({

				initialize : function(cfg){

						var reflection = cfg.reflection;

						/*
						* modules
						* controllers
						* events
						* filters
						* templates
						*/
						octane.defineProp('debug',function(property){
								property == 'events' && (property = 'eventHandlerMap');
								return reflection[property];
						});

						octane.defineGetter('errors',function(){

							 var log = reflection.logfile;
							 var l = log.length;
							 var i = 0;

							 for(;i<l;i++){
									var line = log[i];
									console.log(line[1]);
									console.log('additional context:',line[0]);
							 }
						});

						octane.defineGetter('bootlog',function(){

							var log = reflection.bootlog;
							var l = log.length;
							var i = 0;

							for(;i<l;i++){
								 console.log(log[i]);
							}
						});


						var bar = [
							'<octane-debugger>',
							'<span>Debugger</span>',
							'<ul>',
								'<li (click) o-control="Debugger.getErrors"><i class="fa fa-warning"></i>Errors</li>',
								'<li (click) o-control="Debugger.getBootlog"><i class="fa fa-list"></i>Bootlog</li>',
								'<li (click) o-control="Debugger.getModels"><i class="fa fa-database"></i>Models</li>',
								'<li (click) o-control="Debugger.getControllers"><i class="fa fa-shield"></i>Controllers</li>',
								'<li (click) o-control="Debugger.getEvents"><i class="fa fa-bolt"></i>Events</li>',
								'<li (click) o-control="Debugger.getFilters"><i class="fa fa-filter"></i>Filters</li>',
								'<li (click) o-control="Debugger.getModules"><i class="fa fa-plug"></i>Modules</li>',
							'</ul>',
							'</octane-debugger>'];
						var font = '<link href="http://fonts.googleapis.com/css?family=Source+Code+Pro:500 rel="stylesheet" type="text/css">';
						octane.Template.fromString(font).appendTo(document.head);
						octane.Template.fromString(bar.join('')).appendTo(document.body);
						bar = null;
						font = null;
				}
		})
		.controller("Debugger",{
			getErrors : function(){
				octane.errors;
			},
			getBootlog : function(){
				octane.bootlog;
			},
			getModels : function(){
				console.log(octane.debug('models'));
			},
			getControllers : function(){
				console.log(octane.debug('controllers'));
			},
			getEvents : function(){
				console.log(octane.debug('events'));
			},
			getFilters : function(){
				console.log(octane.debug('filters'));
			},
			getModules : function(){
				console.log(octane.debug('modules'));
			}
		});
