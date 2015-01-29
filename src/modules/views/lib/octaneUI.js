
    octane.module('UI-Overlay',function(cfg){
        
        var 
        bgContainer = octane.dom.bgContainer(),
        appContainer = octane.dom.appContainer(),
        viewContainer = octane.dom.viewContainer(),
        modalContainer = document.getElementsByTagName('o-modal-container')[0],
        doppelganger,
        overlayMode,
        swapCanvas;
        
    /* ------------------------------------------------------------------- */
    /*                            UTILITY                                  */
    /* ------------------------------------------------------------------- */
        
        function hasCssFilterSupport (enableWebkit){
            var 
            el,
            test1,
            test2,
            filter = 'filter:blur(2px)';

            //CSS3 filter is webkit. so here we fill webkit detection arg with its default
            if(enableWebkit === undefined) {
                enableWebkit = true;
            }
            //creating an element dynamically
            el = document.createElement('div');
            //adding filter-blur property to it
            el.style.cssText = (enableWebkit) ? '-webkit-'+filter : filter;
            //checking whether the style is computed or ignored
            test1 = (el.style.length !== 0);
            //checking for false positives of IE
            test2 = (
                document.documentMode === undefined //non-IE browsers, including ancient IEs
                || document.documentMode > 9 //IE compatibility mode
            );
            //combining test results
            return test1 && test2;
        } 
        
    /* ------------------------------------------------------------------- */
    /*                            CONTROLLERS                              */
    /* ------------------------------------------------------------------- */
        
        swapCanvas = octane.controller('swapCanvas').extend({
            // swap out the app container with a static image of itself
            applyCanvas : function(){
                bgContainer.firstChild && bgContainer.removeChild(bgContainer.firstChild);
                return doppelganger.then(function(canvas){
                    bgContainer.appendChild(canvas);
                }).then(function(){
                    bgContainer.classList.add('active');
                });
            },
            removeCanvas : function(){
                bgContainer.firstChild && bgContainer.removeChild(bgContainer.firstChild);
                return Promise.resolve();
            },
            // get the static image
            getSwapCanvas : function (){
                return new Promise(function(resolve){
                    html2canvas(appContainer,{
                        onrendered : function(canvas){
                            doppelganger = Promise.resolve(canvas);
                            resolve();
                        }
                    });
                });
            }    
        });
            
       
        overlayMode = octane.controller('overlayMode').extend({
        
            enter : function enterOverlayMode(){
                var $this = this;
                if(hasCssFilterSupport){
                    return swapCanvas.applyCanvas().then($this.lockout).then($this.hideViews);
                } else {
                    return $this.lockout();
                }
            },
            exit : function exitOverlayMode(){
                var $this= this;
                return $this.unlock().then(swapCanvas.removeCanvas).then($this.revealViews);
            },   
            // darken the modal background and disable click-thrus
            lockout : function(){
                modalContainer.classList.add('active');
                return Promise.resolve();
            },
            // re-enable click-thrus and remove darkness
            unlock :function (){
                modalContainer.classList.remove('active');
                return Promise.resolve();
            },
            hideViews : function (){
                appContainer.classList.add('hidden');
                return Promise.resolve();
            },
            revealViews : function (){
                appContainer.classList.remove('hidden');
                return Promise.resolve();
            }
        });
        
        this.initialize = function init(){
            var $this = this;
            swapCanvas.getSwapCanvas()
            // cache screenshot as soon as routing completes
            if(hasCssFilterSupport){
                octane.handle('routing:complete',function(){
                    swapCanvas.getSwapCanvas();
                });
            }
        }
        
        this.export({
            enter : overlayMode.enter.bind(overlayMode),
            exit : overlayMode.exit.bind(overlayMode),
            getSwapCanvas : swapCanvas.getSwapCanvas.bind(swapCanvas),
            applySwapCanvas : swapCanvas.applyCanvas.bind(swapCanvas)
        });
        
    }); // end module
        