octane.module('ViewPrototype',function(cfg){
        
        this.export({
            configureLoading : function(){
                
                            var 
                            isClassed = false,
                            viewClasses = ['view-left','view-right','view-bottom','view-top','view-fader'],
                            n;

                            _.isArray(cfg.extraViewClasses) && viewClasses.concat(cfg.extraViewClasses);
                            n = viewClasses.length;

                            while(n--){
                                if(this.elem.classList.contains(viewClasses[n]) ){
                                    isClassed = true;
                                    break;
                                }
                            }
                            !isClassed && this.elem.classList.add('view-left');
                        },
            handleEvent : function(e){
                switch(e.type){
                    case 'translated':
                        this.setCanvasHeight();
                        break;
                    case 'resize':
                        this.setCanvasHeight();
                        break;
                    case 'orientationchange':
                        this.setCanvasHeight();
                        break;  
                }
            },
            load : function(){
                var $this = this;
                octane.dom.viewContainer().style.height = $(window).height()+'px';
                return this.doThenLoad().finally(function(){
                    return new Promise(function(resolve){
                        // scroll to top of page
                        $('body').velocity('scroll',{duration:350});
                        $this.elem.classList.add('view-active');

                        // adjust the canvas height and load the view,
                        // use cached height if available
                        setTimeout(function(){
                            resolve();
                        },805);
                    });
                }).then(function(){
                    $this.setCanvasHeight();
                }).then(function(){
                    $this.doLoadThen();
                });
            },
            queueExit  : function(){
                
                var $this = this;
                
                return new Promise(function(resolve){
                    $this.elem.classList.add('view-dismissed');
                    $this.elem.classList.remove('view-active');
                    resolve();
                });
            },
            exit : function (){

                var $this = this;

                return new Promise(function(resolve){
                    setTimeout(function(){
                        $this.elem.classList.remove('view-dismissed');
                    },1000);
                    resolve();
                });
            },
            setCanvasHeight : function($pixels){
                
                var
                appContainer = octane.dom.appContainer(),
                appContainerNodes = [],
                appContainerNodeList = appContainer.childNodes,
                appContainerHeight,
                viewContainer = octane.dom.viewContainer(),
                viewNodes = [],
                viewNodeList = this.elem.childNodes,
                windowHeight = window.document.body.offsetHeight,
                viewTotalHeight,
                viewContainerHeight = viewContainer.offsetHeight,
                freeSpace;
                
                
                // convert appContainer's NodeList to real array
                for(var i=0,n=appContainerNodeList.length; i<n; i++){
                    appContainerNodes.push(appContainerNodeList[i]);
                }
                // convert current view's NodeList to real array
                for(var j=0,m=viewNodeList.length; j<m;j++){
                    viewNodes.push(viewNodeList[j]);
                }
                // get total height of app container nodes (including view container)
                appContainerHeight = appContainerNodes.reduce(function(height,node,index){
                    return (node && node.nodeType == (Node.ELEMENT_NODE)) ? node.offsetHeight + height : height;
                },0);
                // less the view container's height, if any
                freeSpace = windowHeight - (appContainerHeight - viewContainerHeight);
                // initially set the viewContainer as window height
                viewContainer.style.height = windowHeight+'px';
                // get total height of view from its inner elements
                viewTotalHeight = viewNodes.reduce(function(height,node,index){
                    return (node && node.nodeType == (Node.ELEMENT_NODE)) ? node.offsetHeight + height : height;
                },0);
                // set the view container height to the greater
                viewContainerHeight = (viewTotalHeight > freeSpace) ? viewTotalHeight : freeSpace;
                // animate
                $.Velocity.animate(viewContainer,{height: viewContainerHeight+'px'});
               
            },
            
            beforeLoad : function(promise,args){
                try{
                    this.todoBeforeLoad.push([promise,args]);
                } catch(ex){
                    octane.error('cannot push "beforeLoad" callback to view '+this.id+', reason: '+ex.message);
                }
            },
                
            loadThen : function(callback,args){
                try{
                   this.todoAfterLoad.push([callback,args]);
                }catch(ex){
                    octane.error('cannot push "afterLoad" callback to view '+this.id+', reason: '+ex.message);
                }
            },
            
            doThenLoad : function(){
                
                var 
                $view = this,
                todos = this.todoBeforeLoad,
                completed = [];
                
                for(var i=0,n=todos.length; i<n; i++){
                    try{
                        execute(todos[i]);
                    } catch(ex){
                        octane.error('could not call "beforeLoad" function for view '+this.id+' , reason: '+ex.message);
                        continue;
                    }
                }
                
                // helper
                function execute(promise){
                    
                    var
                    func = promise[0],
                    args = _.isArray(promise[1]) ? promise[1] : [promise[1]];
                    
                    completed.push(func.apply($view,args));
                }
                
                return Promise.settle(completed);
            },
            
            doLoadThen : function (){
                
                var 
                $view = this,
                todos = this.todoAfterLoad;

                for (var i=0,n = todos.length; i < n; i++){
                    try{
                        execute(todos[i]);
                    } catch (ex){
                        octane.error('could not call afterLoad" callback for view '+this.id+' , reason: '+ex.message);
                        continue;
                    }
                }
                
                // helper
                function execute(callback){
                    
                    var
                    func = callback[0],
                    args = _.isArray(callback[1]) ? callback[1] : [callback[1]];
                    
                    func.apply($view,args);
                }
            }

        }); // end .define
    }); // end module