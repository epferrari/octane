        /* ------------------------------------------------------- */
		// View Animations
		/* ------------------------------------------------------- */
		
        octane.library('view-animations',{
		
			applyLoading : function(){},
			
			removeLoading : function(){},
				
			loads : {	
				slide : function ($deferred){
				
							var $this = this;
							var $view = $this.$elem;
                            var $config = {
                                duration    : $this.loadDuration,
                                easing      : $this.loadEasing,
                                complete    : function(){
                                    $this.onLoadComplete($deferred);
                                }
                            };
							var anim = new __.Switch({
								
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
							return $deferred;
						}, // end load.slide
						
				fade	: function($deferred){
	
							var $this = this,
								$view = $this.$elem;
								
								$this.setPosition('onscreen');
								$view.velocity(
                                   'fadeIn',
									{
										display   : 'block',
										easing    : $this.loadEasing,
										duration  : $this.loadDuration,
										complete  : function(){
											$this.onLoadComplete($deferred);
										}
									});
								return $deferred;
						} // end loads.fade()
					}, // end load animations
			exits : {
				
				slide : function ($deferred){
							
							//console.log('slideOut called on '+this.id+', exiting to: ',config.exits.to);
							
							var $this = this;
							var $view = $this.$elem;
                            var $config = {
                                duration: $this.exitDuration,
                                easing: $this.exitEasing,
                                complete:function(){
                                    $this.onExitComplete($deferred);
                                }
                            }
							var anim = new __.Switch({
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
							
							return $deferred;
						}, // end exits.slide()
			
				fade : function($deferred){
							
							var $this = this,
								$view = $this.$elem;
								
								$view.velocity(
									'fadeOut',
									{
										display:'none',
                                        easing: $this.exitEasing,
										duration: $this.exitDuration,
										complete:function(){
											$this.onExitComplete($deferred);
										}
									});	
							return $deferred;			
						} // end exits.fade()
			} // end exit animations
	}); // end library
			
			
			
			
			
			
			
			
			