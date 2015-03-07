octane.module('OctaneModals',['ViewController','UiOverlay']).extend({
    
    initialize : function(cfg){
        
        var $Modals         = {};
        var imports         = this.imports;
        var ViewController  = imports.ViewController.Factory;
        var animBy          = imports.ViewController.animations;
        var Overlay         = imports.UiOverlay;
        var Velocity        = Velocity || $.Velocity;
        var bg              = octane.modalContainer;
        var modalQueue      = [];
        var currentModal    = false;
        var block           = false;
        
        var OctaneModal     = ViewController.extend({
            
            // Instance Methods
            
            initialize : function(elem){
                
                            if(!elem) octane.error('Must pass an HTML element to OctaneModal');
                            
                            this.configure(elem);
                            this.adjustSize();
                            var id = this.id;
                             this.name = _.capitalize(_.camelCase(this.title))+'ModalController';
                            $Modals[id] = this;
                
            },
            
            constructor : function OctaneModal(){ return octane.Controller.apply(this,arguments); },
            
            call        : function(){

                            var routerWasLocked = octane.Router.isLocked;
                            var modalLoaded;

                            if(!block){                                     
                                
                                octane.Router.lock();
                                
                                if(!currentModal){                          // no modal onscreen, load this one
                                    
                                    modalLoaded = Overlay.on().bind(this).then(this._load);
                                
                                } else if (currentModal && !this.isCurrent){    // another modal is onscreen, remove it
                                    
                                    modalLoaded = currentModal._exit() 
                                        .bind(this)
                                        .then(this._load);
                                        
                                } else {                                    // this modal is already onscreen, resolve  
                                    modalLoaded = Promise.resolve();
                                }
                                
                                modalLoaded.then(function(){
                                    !routerWasLocked && octane.Router.unlock();
                                });
                                
                            } else {
                                modalQueue.push(this.id);                   // modal animations are blocked, send to queue
                            }
                        },
            
            dismiss     : function(){
                            
                            var routerWasLocked = octane.Router.isLocked;
                            if(this.isCurrent){
                                octane.Router.lock();
                                
                                this._exit()
                                .then(function(){
                                   !routerWasLocked && octane.Router.unlock();
                                    currentModal = false;
                                })
                                .then(Overlay.off);
                            }
                        },
            
            adjustSize  : function(){
                           
                            var viewport = document.body.getBoundingClientRect();
                            var h = (viewport.top - viewport.bottom)+'px';
                            var w = (viewport.right - viewport.left)+'px';
                            
                            _.extend(this.elem.style,{
                                minHeight   : h,
                                width       : w,
                                minWidth    : w,
                                maxWidth    : w
                            });
                        /*
                        var $win = $(window);
                        var h = $win.height();
                        var w = $win.width();
                        
                            this.$elem.css({
                                'min-height': h,
                                'width'     : w,
                                'min-width' : w,
                                'max-width' : w
                            });
                        */
                        },
             
            destroy     : function(){
                            this._destroy();
                            delete $Modals[this.name];
                        },
           
            _load        : function (){
                            
                            var $this = this;
                            
                            this.adjustSize();
                            //bg.classList.add('loading');
                            
                            return this._runBeforeLoad()                   // array of Promises to call before loading
                                .bind(this)
                                .then(function(){
                                    //bg.classList.remove('loading');
                                    this.elem.classList.add('modal-active');
                                    Velocity(this.elem,'scroll',{duration:300});    
                                })
                                .then(function(){
                                    return this._runOnload();           // array of callbacks to run after loading
                                })
                                .then(function(){
                                    currentModal = this;
                                })
                                .catch(function(err){
                                    octane.log(err);
                                });
                        },
            
            _exit        : function(){
                            
                            var $this = this;
                            this.elem.classList.remove('modal-active');
                            return this._runOnExit()                    // array of callbacks to run at exit
                                .catch(function(err){
                                    octane.log(err);
                                });
                        },
           
            
        },{
             // Static Methods
            
            create      : function(elem){
                            return new OctaneModal(elem);
                        },
            
            destroy     : function(id){
                            var modal = OctaneModal.get(id);
                            modal && modal.destroy();
                        },
            
            get         : function(id){
                            return $Modals[id];
                        },
            
            call        : function(id){

                            var modal = $Modals[id];
                            modal && modal.call();
                        },
            
            dismiss     : function (){

                            currentModal && currentModal.dismiss();
                        }
        });
            
        octane.defineGetter.apply(OctaneModal.prototype,['isCurrent',function(){
            return (this === currentModal);
        }]);
        
        octane.defineGetter.apply(OctaneModal,['current',function(){
            return currentModal;
        }]);
        
        octane.defineGetter.apply(OctaneModal,['isLocked',function(){
            return block;
        }]);
        
       

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
            .engrave({ Modal : OctaneModal });
        
    } // end initialize
}); // end module

/*
        
         function OctaneModal(elem){
            if(!_.isString(elem.id)) return {instanced:false};

            this.engrave({

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
        OctaneModal.prototype.engrave({
            constructor :  OctaneModal,
            configureLoading : ViewProto.configureLoading,    
            addAfterLoadCallback    : ViewProto.addAfterLoadCallback,
            callAfterLoadCallbacks  : ViewProto.callAfterLoadCallbacks,       
            load        : function (){
                            var $this = this;
                            
                            this.adjustSize();
                            //bg.classList.add('loading');
                            
                            return Overlay.on()
                                .then(function(){
                                    //bg.classList.remove('loading');
                                })
                                .then(function(){
                                    Velocity($this.elem,'scroll',{duration:300});
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
*/    