    /* ------------------------------------------------------- */
    // View Loading Animations
    /* ------------------------------------------------------- */
		
    octane.module('viewLoadAnimations',function(){
            
        this.define({

            applyLoading : function(resolve){},

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
        });// end load animations
    });

       
			
			
			
			
			
			
			
			
			