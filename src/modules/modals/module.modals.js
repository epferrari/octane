octane.module('Modal',['OctaneViews','UiOverlay']).extend({
    
    initialize : function(cfg){
    
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
    
        // TODO 
        var ModalAnimation = octane.controller('ModalAnimationController').augment({
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
        
        var modalQueue = [];
        var currentModal = false;
        var block = false;

        _.extend(OctaneModal,{
            call : function(modalID){

                var $modal = $Modals[modalID];

                if(!($modal && ($modal instanceof OctaneModal))){ return };

                if(!block){
                    octane.Router.lock();
                    if(!currentModal){
                        $modal.load().then(function(){
                            currentModal = $modal;
                            octane.Router.unlock(); 
                        });
                    } else if (currentModal.id !== modalID){
                        // another modal is onscreen, remove it
                       currentModal.exit()
                            .then($modal.load)
                            .then(function(){
                                currentModal = $modal;
                                octane.Router.unlock(); 
                            });
                    } else {
                       octane.Router.unlock(); 
                    }
                } else {
                    modalQueue.push(modalID);
                }
            },
            dismiss : function (){

                var $modal = currentModal;
                if($modal && $modal instanceof OctaneModal){
                    octane.Router.lock();
                    $modal.exit()//.then(function(){
                        octane.Router.unlock();
                        currentModal = false;
                   // });
                }
            },
            create : function (elem){

                var id = elem.id;
                !$Modals[id] && ($Modals[id] = new this(elem));
            },
            getCurrent : function(){
                return currentModal;
            },
            isLocked : function(){
                return block;
            },
            callThen : function(modalID,callback,args){
                $Modals[modalID] && $Modals[modalID].addAfterLoadCallback(callback,args);
            }   
        });
        
        (function(){
            
            //var modals = document.getElementsByTagName('o-modal')
            //var n = modals.length;
           // while(n--){
            //    OctaneModal.create(modals[n]);  
            //}
            
            octane
                .compiler('o-modal',function(elem){
                    OctaneModal.create(elem);
                })
                .compiler('[o-modal]',function(elem){

                    elem.addEventListener('click',function(e){
                        var modalID = elem.getAttribute('o-modal');
                        OctaneModal.call(modalID);
                    });
                })
                .compiler('.o-modal-dismiss',function(elem){

                    elem.addEventListener('click',function(e){
                        e.stopPropagation;
                        e.stopImmediatePropagation;
                        OctaneModal.dismiss();
                        return false;
                    });
                })
                // dismiss modal automatically on route
                .handle('routing:begin',function(){
                    block = true;
                    octane.Modal.dismiss();  
                })
                // re-enable modal calling after routing completes
                .handle('routing:complete',function(){
                    block = false;
                    octane.Modal.call(modalQueue.pop());
                })
                // resize canvas to proper dimensions
                .handle('load resize orientationchange',function(){
                    currentModal && currentModal.adjustSize();
                })
                .define({ Modal : OctaneModal });
        })();
    } // end initialize
}); // end module

    