octane.module('Modal',['OctaneViews','UiOverlay'],function(cfg){
    
        var
        ViewProto = this.import('ViewPrototype'),
        Overlay = this.import('UiOverlay'),
        ViewLoadAnimations = this.import('ViewLoadAnimations'),
        ViewExitAnimations = this.import('ViewExitAnimations'),
        $Modals = {},
        Velocity = Velocity || $.Velocity,
        bg = octane.dom.modalContainer(),
        
        animBy = octane.viewAnimationMethod || 'css';
            
        function OctaneModal(elem){
            if(!_.isString(elem.id)) return {instanced:false};

            this.define({

                instanced	: true,
                id			: elem.id,
                elem		: elem,
                $elem 		: $(elem),
                _guid		: octane.GUID(),
                todoAfterLoad : [],
                todoBeforeLoad : []
            });
            
            this.configureLoading();
            this.adjustSize();
        }

        OctaneModal.prototype = new octane.Base;
        OctaneModal.prototype.define({
            constructor :  OctaneModal,
            configureLoading : ViewProto.configureLoading,    
            addAfterLoadCallback    : ViewProto.addAfterLoadCallback,
            callAfterLoadCallbacks  : ViewProto.callAfterLoadCallbacks,       
            load        : function (){
                            var 
                            $this = this;
                            
                            this.adjustSize();
                            bg.classList.add('loading');
                            
                            return Overlay.on()
                                .then(function(){
                                    bg.classList.remove('loading');
                                })
                                .then(function(){
                                    Velocity(document.body,'scroll',{duration:300});
                                    $this.elem.classList.add('modal-active');
                                })
                                .then($this.callAfterLoadCallbacks.bind($this));
                        },
            exit        : function(){
                            var $this = this;
                            $this.elem.classList.remove('modal-active');
                            return Overlay.off();
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
                        }
                
        });
    
        ModalAnimation = octane.controller('ModalAnimationController').augment({
            dismiss : {
               js : function(){
                        var modal = this;
                        return ViewExitAnimations[direction].bind(modal)().then(function(){
                            modal.elem.classList.remove('active');
                        });
               },
                css : function(){
                        var modal = this;
                        return new Promise(function(resolve){
                           model.elem.classList.remove('active');
                            setTimeout(resolve,805);
                        });
                }
            },
            call : {
                js : function(){
                        var modal = this;
                        return ViewLoadAnimations[direction].bind(modal)().then(function(){
                            modal.elem.classList.add('active');
                        });
                },
                css : function(elem){
                        var modal = this;
                        return new Promise(function(resolve){
                            modal.elem.classList.add('active');
                            setTimeout(resolve,805);
                        });
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

            if(!($modal && ($modal instanceof OctaneModal))){  return };

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

            if($modal && $modal instanceof OctaneModal){
                
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
            id = elem.id;
           
            if(!$Modals[id]){
               $Modals[id] = new OctaneModal(elem);
            }
        }
        // end helper

        function setTriggerHandlers(){
            
            var 
            triggers = document.querySelectorAll('[o-modal]'),
            n = triggers.length,
            addHandler = function(elem){
               
                elem.removeEventListener('click');
                elem.addEventListener('click',function(e){

                    var modalID = elem.getAttribute('o-modal');
                    callModal(modalID);
                });
            };

            while(n--){ 
                addHandler(triggers[n]);  
            } 
        }
        
        function setDismissHandlers(){
            
            var 
            elems = document.querySelectorAll('.o-modal-dismiss'),
            n = elems.length,
            setHandler = function(elem){
                //elem.removeEventListener('click',handler);
                elem.addEventListener('click',handler);
            };
            
            function handler(e){
                e.stopPropagation;
                e.stopImmediatePropagation;
                dismissModal(currentModal.id);
                return false;
            }
            
            while(n--){   
                setHandler(elems[n]);
            }
        }

        this.initialize = function(){
            
            $modals = document.getElementsByTagName('o-modal')

            for(var m=0,M=$modals.length; m<M; m++){
                initModal($modals[m]);  
            }

            octane.compiler( setTriggerHandlers );
            octane.compiler( setDismissHandlers );

            // dismiss modal automatically on route
            octane.handle('routing:begin',function(){
                block = true;
                dismissModal(currentModal.id);  
            });

            // re-enable modal calling after routing completes
            octane.handle('routing:complete',function(){
                block = false;
                callModal(modalQueue.pop());
            });

            // resize canvas to proper dimensions
            octane.handle('load resize orientationchange',function(){
                currentModal && currentModal.adjustSize();
            });
        }

        this.augment({
            call    : callModal,
            dismiss : dismissModal,
            current : function(){
                return currentModal;
            },
            isBlocked : function(){
                return block;
            },
            callThen : function(modalID,callback,args){
                $Modals[modalID] && $Modals[modalID].addAfterLoadCallback(callback,args);
            }
        });
});

    