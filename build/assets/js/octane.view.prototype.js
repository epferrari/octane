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
                    // adjust the canvas height and load the view
                    $this.setCanvasHeight();
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

            exit : function (){

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
            },

            setCanvasHeight : function(){

                // some jQuery to ensure view-canvas's height
                var height = [];
                this.$elem.children().each(function (){
                    height.push($(this).height());
                });
                var totalHeight = _.reduce(height,function(totalHeight,num){
                    return totalHeight + num;
                });

                document.querySelector('o-canvas').setAttribute('style','height:'+totalHeight+'px');
            },


            setPosition : function (position){
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
            },
            
            addCallback : function(callback){
                try{
                   this.doneLoading.push(callback);
                }catch(exc){
                    octane.error('cannot push callback, '+exc.message);
                }
            },
            
            doCallbacks : function (){
                var $this = this,
                    callbacks = this.doneLoading;

                for (var i=0,n = callbacks.length; i < n; i++){
                    _.isFunction(callbacks[i]) && callbacks[i].bind($this)();
                }
            }

        }); // end .define
    }); // end module