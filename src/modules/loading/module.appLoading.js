	/* ------------------------------------------------------- */
	// loading screen
	/* ------------------------------------------------------- */
		var octane = require('../octane.js');

		octane.module('AppLoading').extend({

						initialize : function (cfg){

								_.isPlainObject(cfg) || (cfg = {});

								octane.Model.create({
										message : 'Loading...',
										progress : '0',
										percent : '0%',
										screenReader : 'Loading'
								}).become('appLoading');

								octane
										.hook('appLoading.progress',function(progress){
												this.progress = this.progress <= 100 ? this.progress : 100;
												this.percent = this.progress.toString()+"%";
												this.screenReader = this.percent+' Loaded';
										})
										.hook('appLoading.message',function(message,state){
												this.message = _.isString(this.message) ? this.message : 'Loading...';
										})
										// update progress bar and message as modules load
										.on('loaded:module',function(e) {
												octane.set({
													'appLoading.message' : 'Loading module '+__.titleize(e.detail.moduleID),
													'appLoading.progress' : octane.get('App.loadingProgress')
												});
										})
										.on('loading:utility',function(e){
											octane.set({
												'appLoading.message' : 'Initializting startup utility '+__.titleize(e.detail)
											});
										})
										.on('octane:ready',this.controllers.LoadingController.removeLoadingScreen);
						}
				})
				.controller('LoadingController',{

						 removeLoadingScreen : function(){
								 // unhide the rest of content hidden behind the loader
								 var loadingContainer = octane.loadingContainer;
								 var view =  octane.defaultView || octane.Router.getUrlView()  || 'home';

								octane.appContainer.classList.remove('hidden');
								octane.route(view);
								setTimeout(function(){
									$.Velocity(loadingContainer,'fadeOut',{duration:500})
									.then(function(){
											document.body.removeChild(loadingContainer);
									});
								},500);
						 }
			});
