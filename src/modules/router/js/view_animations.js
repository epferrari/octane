        /* ------------------------------------------------------- */
		// View Animations
		/* ------------------------------------------------------- */
		
        octane.addLibrary('view-animations',{
		
			applyLoading : function(resolve){},
			
			removeLoading : function(resolve){},
				
			loads : {	
				slide : function (resolve){
							var $this = this,
                                $view = $this.$elem,
                                $config = {
                                    duration    : $this.loadDuration,
                                    easing      : $this.loadEasing,
                                    complete    : resolve
                                },
                                anim = new __.Switch({
                                    'left': function(){
                                        $view.velocity(
                                            {"left":"0%"},
                                            $config
                                        );
                                    },
                                    'right': function (){
                                        $view.velocity(
                                            {"right":"0%"},
                                            $config
                                        );
                                    },
                                    'top':	function(){	
                                        $view.velocity(
                                            {"top":"0%"},
                                            $config
                                        );
                                    },
                                    'bottom':function(){
                                        $view.velocity(
                                            {"bottom":"0%"},
                                            $config
                                        );
                                    }
                                });
				
							anim.run($this.loadsFrom);
						}, // end load.slide
						
				fade	: function(resolve){
	
							var $this = this,
								$view = $this.$elem;
								
								$this.setPosition('onscreen').then(function(){
                                    $view.velocity(
                                       'fadeIn',
                                        {
                                            display   : 'block',
                                            easing    : $this.loadEasing,
                                            duration  : $this.loadDuration,
                                            complete  : resolve
                                        });
                                });
						} // end loads.fade()
					}, // end load animations
			exits : {
				
				slide : function (resolve){
							
							var $this = this,
                                $view = $this.$elem,
                                $config = {
                                    duration    : $this.exitDuration,
                                    easing      : $this.exitEasing,
                                    complete    : resolve
                                },
                                anim = new __.Switch({
                                    'left':function(){
                                        $view.velocity(
                                            {
                                                "left":-($(window).width()*1.1),
                                                "right":$(window).width()*2.2
                                            },
                                            $config
                                        );
                                    },
                                    'right':function(){
                                        $view.velocity(
                                            {
                                                "right":-($(window).width()*1.1),
                                                "left":$(window).width()*2.2
                                            },
                                            $config
                                        );
                                    },
                                    'top':function(){	
                                        $view.velocity(
                                            {
                                                "top":-($(window).height()*1.1),
                                                "bottom":$(window).height()*2.2
                                            },
                                            $config
                                        );
                                    },
                                    'bottom':function(){
                                        $view.velocity(
                                            {
                                                "bottom":-($(window).height()*1.1),
                                                "top":$(window).height()*2.2
                                            },
                                            $config
                                        );
                                    }
                                });
							
							anim.run($this.exitsTo);
						}, // end exits.slide()
			
				fade : function(resolve){
							
							var $this = this,
								$view = $this.$elem;
								
								$view.velocity(
									'fadeOut',
									{
										display   :'none',
                                        easing    : $this.exitEasing,
										duration  : $this.exitDuration,
										complete  : resolve
									});		
						} // end exits.fade()
			} // end exit animations
	}); // end library
			
			
			
			
			
			
			
			
			