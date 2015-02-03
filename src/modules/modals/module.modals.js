octane.module('Modal',['OctaneViews','UiOverlay'],function(cfg){
    
        var
        $viewProto = this.import('ViewPrototype'),
        $overlay = this.import('UiOverlay'),
        $Modals = {},
        bg = document.getElementsByTagName('o-modal-container')[0];
            
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

        OctaneModal.prototype = octane.base();
        OctaneModal.prototype.define({
            constructor :  OctaneModal,
            configureLoading : $viewProto.configureLoading,    
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
                
                elem.removeEventListener('click');
                elem.addEventListener('click', function(e){
                    e.stopPropagation;
                    e.stopImmediatePropagation;
                    dismissModal(currentModal.id);
                    return false;
                });
            };
            
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

    