octane.module(
    'modal',
    ['oView','viewLoadAnimations','viewExitAnimations','UI-Overlay'],
    function(cfg){
    
        var 
        Base = octane.constructor,
        $viewProto = this.import('viewPrototype'),
        $loads = this.import('viewLoadAnimations'),
        $exits = this.import('viewExitAnimations'),
        $overlay = this.import('UI-Overlay'),
        $Modals = {},
        bg = document.getElementsByTagName('o-modal-container')[0];
            
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
                todoAfterLoad : [],
                todoBeforeLoad : []
            });
            this.elem.classList.add('view-'+this.loadsFrom);

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
            loadThen    : $viewProto.loadThen,
            doLoadThen  : $viewProto.doLoadThen,       
            load        : function (){
                            var 
                            $this = this;
                            
                            this.adjustSize();
                            bg.classList.add('loading');
                            
                            return $overlay.enter()
                            .then(function(){
                                bg.classList.remove('loading');
                            })
                            .then(function(){
                                $('body').velocity('scroll',{duration:600});
                                $this.elem.classList.add('modal-active');
                            })
                            .then($this.doLoadThen.bind($this));
                        },
            exit        : function(){
                            var $this = this;
                            return new Promise(function(resolve){
                                $this.elem.classList.remove('modal-active');
                                resolve();
                            }).then($overlay.exit);         
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
        
        var
        modalQueue = [],
        currentModal = false,
        block = false;
        
       function callModal(modalID){

            var $modal = $Modals[modalID];

            if(!($modal && ($modal instanceof oModal))){  return };

            if(!block){
                octane.blockRouting();
                if(!currentModal){
                    $modal.load().then(function(){
                        currentModal = $modal;
                        octane.unblockRouting(); 
                    });
                } else if (currentModal.id !== modalID){
                    // another modal is onscreen, remove it
                   currentModal.exit()
                        .then($modal.load)
                        .then(function(){
                            currentModal = $modal;
                            octane.unblockRouting(); 
                        });
                } else {
                   octane.unblockRouting(); 
                }
            } else {
                modalQueue.push(modalID);
            }
        }

        function dismissModal(modalID){
            
            var $modal = $Modals[modalID];

            if($modal && $modal instanceof oModal){
                
                octane.blockRouting();
                
               $modal.exit()//.then(function(){
                    octane.unblockRouting();
                    currentModal = false;
               // });
            }
        }
        
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
            
            var 
            triggers = document.querySelectorAll('[o-modal]'),
            addHandler = function($trigger){
                 octane.handle('click',$trigger,function(e){

                    var modalID = $trigger.getAttribute('o-modal');
                    callModal(modalID);
                });
            };

            for(var t=0,T=triggers.length; t<T; t++){
                addHandler(triggers[t]);  
            } 
        }

        this.initialize = function(){
            
            //modalBG.setAttribute('id','o-modal-bg');
            //document.body.appendChild(modalBG);
            
            $modals = document.getElementsByTagName('o-modal')

            for(var m=0,M=$modals.length; m<M; m++){
                initModal($modals[m]);  
            }

            setTriggerHandlers();

            // dismiss modal automatically on route
            octane.handle('routing:begin',function(){
                block = true;
                dismissModal(currentModal.id);  
            });

            // re-enable
            octane.handle('routing:complete',function(){
                block = false;
                callModal(modalQueue.pop());
            });

            // resize canvas to proper dimensions
            octane.handle('load resize orientationchange',function(){
                currentModal && currentModal.adjustSize();
            });
        }

        this.extend({
            call    : callModal,
            dismiss : dismissModal,
            current : function(){
                return currentModal;
            },
            isBlocked : function(){
                return block;
            },
            callThen : function(modalID,callback,args){
                $Modals[modalID] && $Modals[modalID].loadThen(callback,args);
            }
        });
});

    