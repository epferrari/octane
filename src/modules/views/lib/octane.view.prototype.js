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
                
                // some jQuery to ensure view-canvas's height
                var 
                viewContainer = octane.dom.viewContainer(),
                height = [],
                totalHeight;
                
                viewContainer.style.height = $(window).height()+'px';
                
                this.$elem.children().each(function (){
                    height.push($(this).height());
                });
                totalHeight = _.reduce(height,function(totalHeight,num){
                    return totalHeight + num;
                });
                $pixels = $pixels || totalHeight || 500;
                this.cachedHeight = $pixels;
                
                $.Velocity.animate(viewContainer,{height: $pixels});
               
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