octane.module('viewPrototype',
    ['viewLoadAnimations','viewExitAnimations'],
    function(cfg){
    
        var
        $loads = this.import('viewLoadAnimations'),
        $exits = this.import('viewExitAnimations');
        
        this.export({
            
            configure : function(config){
                var        
                positions 	= ['left','right','top','bottom','behind','invisible','onscreen'],
                loadConfig = _.isObject(config.loads),
                exitConfig = _.isObject(config.exits);

                this.define({
                    loadsBy         : loadConfig && config.loads.by || 'slide',
                    loadsFrom       : loadConfig && __.inArray(positions,config.loads.from) ? config.loads.from : 'left',
                    loadEasing      : loadConfig && config.loads.ease || 'swing',
                    loadDuration    : loadConfig && _.isNumber(config.loads.dur) ? config.loads.dur : 500,

                    exitsBy         : exitConfig && config.exits.by || 'slide',
                    exitsTo         : exitConfig && __.inArray(positions,config.exits.to) ? config.exits.to : 'right',
                    exitEasing      : exitConfig && config.exits.ease || 'swing',
                    exitDuration	: exitConfig && _.isNumber(config.exits.dur) ? config.exits.dur : 500
                });   
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
            
            /*load : function(){
                var $this = this;
                
                return this.doThenLoad().finally(function(){
                    return new Promise(function(resolve){
                        // scroll to top of page
                        $('body').velocity('scroll',{duration:350});
                        
                        // make sure the view is visible
                        $this.$elem.css({
                            "visibility":"visible",
                            'display':'block',
                            'z-index':octane.dom.zIndexView
                        });
                        if($this.loadsBy !== 'fade'){
                            $this.$elem.css({
                                opacity:1
                            });
                        }
                        // adjust the canvas height and load the view,
                        // use cached height if available
                        $this.setCanvasHeight($this.cachedHeight);
                        try{
                            $loads[$this.loadsBy].bind($this,resolve)();
                        }catch(ex){
                            octane.hasModule('debug') && octane.log(ex);
                            $loads.slide.bind($this,resolve)();
                        }        
                    });
                }).then(function(){
                    $this.doLoadThen();
                });
            },*/
            /*exit : function (){

                var $this = this;

                return new Promise(function(resolve){
                    
                    try{
                        $exits[$this.exitsBy].bind($this,resolve)();
                    }catch(ex){
                        octane.hasModule('debug') && octane.log(ex);
                        $exits.fade.bind($this,resolve);
                    }
                }).then(function(){

                    // make sure the view is hidden in its loadFrom position
                    $this.$elem.css({
                            'z-index':octane.dom.zIndexHidden,
                            'visibility':'hidden',
                            'display':'none',
                            'opacity':0
                        });

                    $this.setPosition($this.loadsFrom);
                });
            },*/
            
            /* setPosition : function (position){
                var $this = this;
                return new Promise(function(resolve){
                    var $view = $this.$elem,
                        anim = new __.Switch({

                        'left': function(){
                                    $view.css({
                                        "left":-($(window).width()*1.1),
                                        "top":0,
                                        //"bottom":0
                                    });
                        },
                        'right' : function() {
                                    $view.css({
                                        "right":-($(window).width()*1.1),
                                        "top":0,
                                        //"bottom":0
                                    });
                        },
                        'top' : function(){
                                    $view.css({
                                        "top":-($(window).height()*1.1),
                                        "left":0,
                                        "right":0
                                    });
                        },
                        'bottom' : function(){
                                    $view.css({
                                        "top":$(window).height()*1.1,
                                        "bottom":-($(window).height()*1.1),
                                        "left":0,
                                        "right":0
                                    });
                        },
                        'onscreen' :function(){
                                    $view.css({
                                        "left":0,
                                        "right":0,
                                        "top":0,
                                        //"bottom":0
                                    });
                        },
                        default : function(){ 
                                    $view.css({
                                        "left":-($(window).width()*1.1),
                                        "top":0,
                                        //"bottom":0
                                    });
                        }
                    });

                    anim.run(position);
                    resolve();
                });
            },*/
            
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
               //octane.dom.viewContainer().setAttribute('style','height:'+$pixels+'px');
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