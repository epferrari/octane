
    /* ------------------------------------------------------- */
    // View Exit Animations
    /* ------------------------------------------------------- */

    octane.module('viewExitAnimations',function(){

            this.export({

                removeLoading : function(resolve){},

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
            }) // end this.define
        }); // end module