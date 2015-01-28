	/* ------------------------------------------------------- */
	// loading screen
	/* ------------------------------------------------------- */
	
	
		octane.module('appLoading', function (cfg){
			
            cfg = _.isObject(cfg) ? cfg : {};
            
			var 
			$this = this,
			defaults = {
				message : 'Loading...',
				progress : '0',
				percent : '0%',
				screenReader : 'Loading'
			},
		
			$model = octane.model('appLoading',{singleton:true}).set(defaults),
			$controller = octane.controller()			
			.hook('appLoading.progress',function($state,promise){
                $state.progress = $state.progress <= 100 ? $state.progress : 100;
				$state.percent =$state.progress.toString()+"%";
				$state.screenReader = $state.percent+' Loaded';
				promise.resolve($state);	
			})
			.hook('appLoading.message',function($state){
				$state.message = _.isString($state.message) ? $state.message : 'Loading...';
			});
						
			// update progress bar and message as modules load
			octane.handle('loaded:module',function(e) {
				octane.goose('appLoading',{
					message	: 'Loading module '+__.titleize(e.detail.moduleID),
					progress : octane.get('application.loadingProgress')
				});	
			});
			
            octane.handle('loading:utility',function(e){
				octane.goose('appLoading',{
					message : 'Initializting startup utility '+titleize(e.detail)
				})
			});
            
            octane.handle('octane:ready',function(e){
                // unhide the rest of content hidden behind the loader    
                var
                loadingContainer = octane.dom.loadingContainer(),
                appContainer = octane.dom.appContainer(),
                view = octane.parseView() || cfg.defaultView || 'home';
               
                appContainer.classList.remove('hidden');

                setTimeout(function(){
                    octane.route(view).then(function(){
                        return $.Velocity(loadingContainer,'fadeOut',{duration:500})
                    }).then(function(){
                        document.body.removeChild(loadingContainer);
                    });
                },500);
            });
		});