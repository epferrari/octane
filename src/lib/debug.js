
		var _ 					= require('lodash');
		var _octane 		= require('./_octane.js');
		var Template 		= require('./Template.js');
		var Controller 	= require('./Controller.js');
		var QB 					= require('./Quarterback.js');


		var debug = new Controller("Debug",{
			getErrors : function(){
				var log = _octane.logfile;
				if(log.length ===0) console.log('no errors');

				_.each(_octane.logfile,function(entry){
					console.log(entry.error);
					console.log('additional details:',entry.message);
					console.log('logged by: '+entry.caller);
				});
			},
			getBootlog : function(){
				_.each(_octane.bootlog,function(message){
					console.log(message);
				});
			},
			getModels : function(){
				console.log(_octane.models);
			},
			getControllers : function(){
				console.log(_octane.controllers);
			},
			getEvents : function(){
				console.log(QB._listening_);
			},
			getEventMap: function(){
				console.log(QB.delegateMap);
			},
			getFilters : function(){
				console.log(_octane.filters);
			},
			getModules : function(){
				console.log(_octane.modules);
			},
			hideConsole: function(){
				document.querySelector('body>octane-debugger').style.display = 'none';
			},
			showConsole: function(){
				document.querySelector('body>octane-debugger').style.display = 'block';
			}
		})


		var bar = [
			'<octane-debugger style="display:none">',
				'<span>Debug</span>',
				'<ul>',
					'<li o-control="(click)[Debug.getErrors]" ><i class="fa fa-warning"></i>Errors</li>',
					'<li o-control="(click)[Debug.getBootlog]"><i class="fa fa-list"></i>Bootlog</li>',
					'<li o-control="(click)[Debug.getModels]"><i class="fa fa-database"></i>Models</li>',
					'<li o-control="(click)[Debug.getControllers]"><i class="fa fa-shield"></i>Controllers</li>',
					'<li o-control="(click)[Debug.getEvents]"><i class="fa fa-bolt"></i>Events</li>',
					'<li o-control="(click)[Debug.getFilters]"><i class="fa fa-filter"></i>Filters</li>',
					'<li o-control="(click)[Debug.getModules]"><i class="fa fa-plug"></i>Modules</li>',
					'<li o-control="(click)[Debug.hideConsole]"><i class="fa fa-remove"></i>Hide</li>',
				'</ul>',
			'</octane-debugger>'];
		var font = '<link href="http://fonts.googleapis.com/css?family=Source+Code+Pro:500 rel="stylesheet" type="text/css">';
		Template.fromString(font).appendTo(document.head);
		Template.fromString(bar.join('')).appendTo(document.body);

		bar = null;
		font = null;

	module.exports = debug;
