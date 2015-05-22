		var octane = require('../octane.js');
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

						var Debugger = octane.controller("Debugger",{
							getErrors : function(){
								var log = reflection.logfile;
								var l = log.length;
								var i = 0;

								for(;i<l;i++){
									var line = log[i];
									console.log(line[1]);
									console.log('additional context:',line[0]);
								}
							},
							getBootlog : function(){
								var log = reflection.bootlog;
								var l = log.length;
								var i = 0;

								for(;i<l;i++){
									console.log(log[i]);
								}
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
							},
							hideConsole: function(){
								document.querySelector('body>octane-debugger').style.display = 'none';
							},
							showConsole: function(){
								document.querySelector('body>octane-debugger').style.display = 'block';
							}
						});

						octane.defineGetter('errors',function(){
							Debugger.getErrors();
						});

						octane.defineGetter('bootlog',function(){
							Debugger.getBootlog();
						});



						var bar = [
							'<octane-debugger style="display:'+(cfg.isHidden ? 'none' : 'block')+'">',
							'<span>Debug</span>',
							'<ul>',
								'<li o-control="(click)[Debugger.getErrors]" ><i class="fa fa-warning"></i>Errors</li>',
								'<li o-control="(click)[Debugger.getBootlog]"><i class="fa fa-list"></i>Bootlog</li>',
								'<li o-control="(click)[Debugger.getModels]"><i class="fa fa-database"></i>Models</li>',
								'<li o-control="(click)[Debugger.getControllers]"><i class="fa fa-shield"></i>Controllers</li>',
								'<li o-control="(click)[Debugger.getEvents]"><i class="fa fa-bolt"></i>Events</li>',
								'<li o-control="(click)[Debugger.getFilters]"><i class="fa fa-filter"></i>Filters</li>',
								'<li o-control="(click)[Debugger.getModules]"><i class="fa fa-plug"></i>Modules</li>',
								'<li o-control="(click)[Debugger.hideConsole]"><i class="fa fa-remove"></i>Hide</li>',
							'</ul>',
							'</octane-debugger>'];
						var font = '<link href="http://fonts.googleapis.com/css?family=Source+Code+Pro:500 rel="stylesheet" type="text/css">';
						octane.Template.fromString(font).appendTo(document.head);
						octane.Template.fromString(bar.join('')).appendTo(document.body);

						bar = null;
						font = null;
				}
		})
