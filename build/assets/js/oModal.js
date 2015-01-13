octane.module(
    'modal',
    ['oView','viewLoadAnimations','viewExitAnimations'],
    function(cfg){
    
        var 
        Base = octane.constructor,
        $viewProto = this.import('viewPrototype'),
        $loads = this.import('viewLoadAnimations'),
        $exits = this.import('viewExitAnimations'),
        $Modals = {},
        modalBG = document.createElement('div');
            


        function oModal(elem,config){
            if(!_.isString(elem.id)) return {instanced:false};

            config = _.isObject(config) ? config : {};

            this.configure(config);
            this.define({

                instanced	: true,
                id			: elem.id,
                elem		: elem,
                $elem 		: $(elem),
                _guid		: octane.GUID(),
                doneLoading : [],					
            });
            this.setPosition(this.loadsFrom);

            var 
            dismissers = this.elem.querySelectorAll('[o-dismiss="'+this.id+'"]');

            for(var d=0,D=dismissers.length; d<D; d++){   
                this.addDismissHandler(dismissers[d]);
            }
            this.adjustSize();
        }

        oModal.prototype = new Base('Octane Modal');
        oModal.prototype.define({
            constructor :  oModal,
            configure : function(config){
                            var        
                            positions 	= ['left','right','top','bottom','behind','invisible','onscreen'],
                            loadConfig = _.isObject(config.loads),
                            exitConfig = _.isObject(config.exits);

                            this.define({
                                loadsBy         : loadConfig && config.loads.by || 'slide',
                                loadsFrom       : loadConfig && __.inArray(positions,config.loads.from) ? config.loads.from : 'bottom',
                                loadEasing      : loadConfig && config.loads.ease || 'swing',
                                loadDuration    : loadConfig && _.isNumber(config.loads.dur) ? config.loads.dur : 500,

                                exitsBy         : exitConfig && config.exits.by || 'slide',
                                exitsTo         : exitConfig && __.inArray(positions,config.exits.to) ? config.exits.to : 'bottom',
                                exitEasing      : exitConfig && config.exits.ease || 'swing',
                                exitDuration	: exitConfig && _.isNumber(config.exits.dur) ? config.exits.dur : 500
                            });
                        },
            exit        : function(){
                            var $this = this;
                            return $viewProto.exit.bind(this)().then(function(){
                                $(modalBG)
                                    .removeClass('o-modal-active')
                                    .velocity({
                                        opacity : 0
                                    },{
                                            easing    : $this.loadEasing,
                                            duration  : $this.loadDuration,
                                            display   : 'none'
                                    });
                                    
                                $('o-container>header, o-container>o-canvas, o-container>div').removeClass('blur');
                                
                            });
                        },
            setPosition : $viewProto.setPosition,
            addCallback : $viewProto.addCallback,
            doCallbacks : $viewProto.doCallbacks,
            load       : function (){
                            var $this = this;
                            return new Promise(function(resolve){
                                
                                // darken and blur background app
                                $(modalBG)
                                    .addClass('o-modal-active')
                                    .velocity({
                                        opacity : 0.6
                                    },{
                                        display   : 'block',
                                        easing    : $this.loadEasing,
                                        duration  : $this.loadDuration
                                    });
                                $('o-container>header, o-container>o-canvas, o-container>div').addClass('blur');

                                // scroll to top of page
                                $('body').velocity('scroll',{duration:350});

                                // make sure the view is visible
                                $this.$elem.css({
                                    "visibility":"visible",
                                    'display':'block',
                                    'z-index':octane.dom.zIndexOverlay
                                });
                                if($this.loadsBy !== 'fade'){
                                    $this.$elem.css({
                                        opacity:1
                                    });
                                }
                                try{
                                    $loads[$this.loadsBy].bind($this,resolve)();
                                }catch(ex){
                                    octane.hasModule('debug') && octane.log(ex);
                                    $loads.slide.bind($this,resolve)();
                                }        
                            }).then(function(){
                                $this.doCallbacks();
                            });
                        },
            adjustSize : function(){
                            var 
                            $win = $(window),
                            h = $win.height(),
                            w = $win.width();

                            this.$elem.css({
                                'min-height': h,
                                'width'     : w,
                                'min-width' : w,
                                'max-width' : w
                            });
                        },
            addDismissHandler : function(dismisser){
                            var $this = this;

                            dismisser.addEventListener('click',dismisser);
                            dismisser.handleEvent = function(e){
                                e.stopPropagation;
                                e.stopImmediatePropagation;
                                dismissModal($this.id);
                                return false;
                            }
                        }    
        });
        // end oModal prototype



        // helper
        function initModal(elem){
            var 
            id = elem.id,
            config = elem.getAttribute('o-config');

            try{
                config = config ? JSON.parse(config) : null;
            } catch(ex){
                octane.error('invalid o-config attribute for o-modal '+id+'. '+ex.message);
                config = null;
            }
           
            if(!$Modals[id]){
               $Modals[id] = new oModal(elem,config);
            }
        }
        // end helper

        function setTriggerHandlers(){
            
            var triggers = document.querySelectorAll('[o-modal]');

            for(var t=0,T=triggers.length; t<T; t++){
                addTriggerHandler(triggers[t]);  
            }   
        }

        // helper    
        function addTriggerHandler($trigger){
            
             octane.handle('click',$trigger,function(e){
                
                var modalID = $trigger.getAttribute('o-modal');
                callModal(modalID);
            });
        }
        // end helper

        var 
        currentModal = false,
        block = false;

        function callModal(modalID){

            var $modal = $Modals[modalID];

            if(!($modal && ($modal instanceof oModal))){  return };

            if(!block){
                octane.fire('block:routing');
                console.log('current',currentModal.id);
                console.log('called',modalID);
                if(!currentModal){
                    console.log('not calling same modal',currentModal);
                    $modal.load().then(function(){
                        currentModal = $modal;
                        octane.fire('unblock:routing');
                    });
                } else if (currentModal.id !== modalID){
                    // another modal is onscreen, remove it
                   currentModal.exit()
                        .then($modal.load)
                        .then(function(){
                            currentModal = $modal;
                            octane.fire('unblock:routing');
                        });
                } else {
                   octane.fire('unblock:routing'); 
                }
            }
        }

        function dismissModal(modalID){
            
            var $modal = $Modals[modalID];

            if($modal && $modal instanceof oModal){
                
                octane.fire('block:routing');
                
                $modal.exit().then(function(){
                    octane.fire('unblock:routing');
                    currentModal = false;
                });
            }
        }


        function initialize(){
            
            modalBG.setAttribute('id','o-modal-background');
            document.body.appendChild(modalBG);
            
            $modals = document.getElementsByTagName('o-modal')

            for(var m=0,M=$modals.length; m<M; m++){
                initModal($modals[m]);  
            }

            setTriggerHandlers();

            // dismiss modal automatically on route
            octane.handle('routing:begin',function(){
                block = true;
                currentModal && currentModal.exit();  
            });

            // re-enable
            octane.handle('routing:complete',function(){
                block = false;
            });

            // resize canvas to proper dimensions
            octane.handle('load resize orientationchange',function(){
                currentModal && currentModal.adjustSize();
            });
        }

        this.extend({
            call    : callModal,

            dismiss : dismissModal
        });

        initialize();
    
});

    