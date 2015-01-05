// set-up for Views constructor

octane.module('octane-views',{
        libraries : 'view-animations',
    },
    function(cfg){
            
            var 
            Base = octane.constructor,
            $Views = {},
            $animations;
    
            try{
                $animations = (cfg.animations['exits'] && cfg.animations['loads']) ? cfg.animations : octane.library('view-animations');
            }catch(e){
                $animations = octane.library('view-animations');
                octane.hasModule('debug') && octane.log('Could not load user-defined view animations. Error: '+e+'. Using default');
            }

    /* ------------------------------------------------------- */
    //  Application View Constructor
    //
    // @param id [string] id attribute of 'o-view' DOM element
    // options : {starts:'left',loads:['slide','left','swing',500], exits:['slide','right','swing',500]}
    // 
    // @option starts: initial postion of the ViewFrame, default is left
    // @option loads[from,easing,duration]
    // @opton exits[to,easing,duration]
    /* ------------------------------------------------------- */

        function View(id,config){
            if(!_.isString(id)) return {instanced:false};

            config = _.isObject(config) ? config : {};

            var $this = this,
                // private properties
                positions 	= ['left','right','top','bottom','behind','invisible','onscreen'],
                loadConfig = _.isObject(config.loads),
                exitConfig = _.isObject(config.exits),
                cfg = {
                    loadsBy         : loadConfig && config.loads.by || 'slide',
                    loadsFrom       : loadConfig && __.inArray(positions,config.loads.from) ? config.loads.from : 'left',
                    loadEasing      : loadConfig && config.loads.ease || 'swing',
                    loadDuration    : loadConfig && _.isNumber(config.loads.dur) ? config.loads.dur : 500,

                    exitsBy         : exitConfig && config.exits.by || 'slide',
                    exitsTo         : exitConfig && __.inArray(positions,config.exits.to) ? config.exits.to : 'right',
                    exitEasing      : exitConfig && config.exits.ease || 'swing',
                    exitDuration	: exitConfig && _.isNumber(config.exits.dur) ? config.exits.dur : 500
                };

            this.define(cfg);

            this.define({

                instanced	: true,
                id			: id,
                elem		: document.getElementById(id),
                $elem 		: $('o-view#'+id),
                _guid		: octane.GUID(),
                doneLoading : [],
                addCallback : function(callback){
                                _.isFunction(callback) && this.doneLoading.push(callback);
                            }					
            });

            this.setPosition(this.loadsFrom);
        }

        View.prototype = new Base('octane View');

        View.prototype.define({
            constructor : View,

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
                        'z-index':999999999
                    });
                    if($this.loadsBy !== 'fade'){
                        $this.$elem.css({
                            opacity:1
                        });
                    }
                    // adjust the canvas height and load the view
                    $this.setCanvasHeight();
                    $animations.loads[$this.loadsBy].bind($this,resolve)();
                }).then(function(){
                    $this.doCallbacks();
                });
            },

            exit : function (){

                var $this = this;

                return new Promise(function(resolve){

                    $animations.exits[$this.exitsBy].bind($this,resolve)();
                }).then(function(){

                    // make sure the view is hidden in its loadFrom position
                    $this.$elem.css({
                            'z-index':-1,
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
                                    $view.css({"bottom":-($(window).height()*1.1),
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

            doCallbacks : function (){
                    var $this = this,
                        callbacks = this.doneLoading;

                    for (var i=0,n = callbacks.length; i < n; i++){
                        _.isFunction(callbacks[i]) && callbacks[i].bind($this)();
                    }
            }

        });
        
        function initialize(){
            
            var $views = octane.dom.views();
            // bind html views to View objects		
            for(var i=0,n=$views.length; i<n; i++){
                id = $views[i].id;
                config = JSON.parse($views[i].getAttribute('o-config'));
                !$Views[id] && ($Views[id] = new View(id,config));
            }
            octane.define({
                view : function(id){
                    return $Views[id] || false;
                }
            });
        }
    
        initialize();
                
        });