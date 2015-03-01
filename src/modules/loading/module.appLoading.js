	/* ------------------------------------------------------- */
	// loading screen
	/* ------------------------------------------------------- */
	
	
		octane.module('AppLoading').extend({
            
            initialize : function (cfg){
			
                _.isPlainObject(cfg) || (cfg = {});

                octane.Model.create({
                    message : 'Loading...',
                    progress : '0',
                    percent : '0%',
                    screenReader : 'Loading'
                }).become('appLoading');

                octane.controller('LoadingController').augment({
                    removeLoadingScreen : function(){
                        // unhide the rest of content hidden behind the loader    
                        var
                        loadingContainer = octane.dom.loadingContainer(),
                        appContainer = octane.dom.appContainer(),
                        view =  cfg.defaultView || octane.Router.getUrlView()  || 'home';

                        appContainer.classList.remove('hidden');

                        setTimeout(function(){
                            octane.route(view)
                            
                            .then(function(){
                                return $.Velocity(loadingContainer,'fadeOut',{duration:500})
                            })
                            .then(function(){
                                document.body.removeChild(loadingContainer);
                            });
                            
                        },500);
                    }
                });

                octane
                    .hook('appLoading.progress',function($state){
                        $state.progress = $state.progress <= 100 ? $state.progress : 100;
                        $state.percent =$state.progress.toString()+"%";
                        $state.screenReader = $state.percent+' Loaded';	
                    })
                    .hook('appLoading.message',function($state){
                        $state.message = _.isString($state.message) ? $state.message : 'Loading...';
                    })		
                    // update progress bar and message as modules load
                    .handle('loaded:module',function(e) {
                        octane.set({
                            'appLoading.message' : 'Loading module '+__.titleize(e.detail.moduleID),
                            'appLoading.progress' : octane.get('App.loadingProgress')
                        });	
                    })
                    .handle('loading:utility',function(e){
                        octane.set({
                            'appLoading.message' : 'Initializting startup utility '+titleize(e.detail)
                        })
                    })
                    .handle('octane:ready',octane.controller('LoadingController').removeLoadingScreen);
            }
		});