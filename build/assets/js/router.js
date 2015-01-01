// JavaScript Document

octane.module('router',[],function (cfg) {
	
    // octane application's views object and animation library
	var $Views = {},
        $animations;
    
    if(_.isObject(cfg)){
        
        try{
            $animations = (cfg.animations['exits'] && cfg.animations['loads']) ? cfg.animations : octane.checkout('view-animations');
        }catch(e){
            $animations = octane.checkout('view-animations');
            octane.hasModule('Debug') && octane.log('Could not load user-defined view animations. Error: '+e+'. Using default');
        }
    }
    
	// add History.js so we can route
	(function(window,undefined){

        // Bind to StateChange Event
        History.Adapter.bind(window,'statechange',function(){ // Note: We are using statechange instead of popstate
            var State = History.getState(); // Note: We are using History.getState() instead of event.state
        });

	})(window);
	
	
    
    
	function pushState(params){
		
		params = _.isObject(params) ? params : {};
		// update the language in the url
		var parsed = __.location().searchObject;	
		
		octane.extend.call(parsed,params);
		
		var fragment = [];
		for(var key in parsed){
			if( ({}).hasOwnProperty.call(parsed,key) ){	
				fragment.push(key+'='+parsed[key]);
			}
		}
		
		fragment = fragment.join('&');
		fragment = '?'+fragment;
        
        var language = octane.translator && octane.translator.getLang(),
            title = __.titleize(params.view) || __.titleize(currentView);
		
		History.pushState( 
            { lang: language },
            octane.name +' | '+ title,
            fragment
        );
	}
   
	var isRouting,
        currentView,
	    // store routes called while another route is executing its loading animation
	   routesQueue = [];
	
	// @param id [str]: id of the o-view to be called
	// @param callback [fn]: a function to be executed when the loading animation finishes
	// 	function's thisArg is bound to the view called
	// @param ghost [bool]: do not update the history with the view (default false)
	function route(id,ghost){

        ghost = _.isBoolean(ghost) ? ghost : false;
		var $view = $Views[id],
            $def = $.Deferred();
		
        // ensure the onscreen view isn't reanimated
        //////////////////////////////////////////////////////////////////////////////////////
                                                                                            //
            if($view instanceof View && $view != currentView){                              //
                                                                                            //
            // ensure a route isn't triggered while another route is animating              //
            //////////////////////////////////////////////////////////////////////////      //
                                                                                    //      //
                if(!isRouting){                                                     //      //
                                                                                    //      //
                    isRouting = true;                                               //      //
                                                                                    //      //
                // exit the current view before calling a new view                  //      //
                //////////////////////////////////////////////////////////          //      //
                                                                        //          //      //
                    if(currentView instanceof View){                    //          //      //
                        currentView.exit().done(function(){             //          //      // 
                            loadView($view,$def);                       //          //      //
                        });                                             //          //      //
                    }else{                                              //          //      //
                        loadView($view,$def);                           //          //      // 
                    }                                                   //          //      //
                //////////////////////////////////////////////////////////          //      //
                                                                                    //      //
                }else{                                                              //      //
                    if(!__.inArray(routesQueue,id)){routesQueue.push(id);}          //      //
                }                                                                   //      //
            //////////////////////////////////////////////////////////////////////////      //
                                                                                            //
            }else{                                                                          //
                $def.reject();                                                              //
            }                                                                               //
                                                                                            //
        //////////////////////////////////////////////////////////////////////////////////////
        
        // helper
        function loadView($view,$def){
            
             $view.load().done(function(){
                !ghost && pushState({view:$view.id});

                $view.doCallbacks();
                //!ghost && octane.fire('view:loaded',{detail:{id:id}});

                currentView = $view;

                // update current view in global state, jumpstart Circuit                          
                octane.goose('application',{ currentView : $view.id });

                isRouting = false;

                // route next view
                (routesQueue.length > 0) && route(routesQueue.pop());

                $def.resolve();
             });
        }
		
        // return promise
		return $def;
	}
	
	// add a callback to be executed when the specified view finishes its loading animation 
	function routeThen(id,callback){
		
		$Views[id] instanceof View && $Views[id].addCallback(callback);
		return this;
	}
	
	function remove(id){
		
		$Views[id] instanceof View && $Views[id].exit();
		octane.goose('application',{currentView:''});
	}
	
    
	function setRoutingButtons(){
		
		var btns = document.querySelectorAll('.o-btn');
		var n = btns.length;
		
		while(n--){
			  
            // closure to capture the button and route during the loop
           setRoutingButtonsHelper(btns[n]);
		}
	}
    
    function setRoutingButtonsHelper(btn,route){
        var route = btn.getAttribute('o-route');
	    btn.addEventListener('click',function(){
            console.log('routing ', route);
            octane.route(route);
        });
     }
        
        
    // parse URL for a view  
    function parseView(api){

        if(api){
            return __.location().searchObject.view || false;
        } else {
             var hash = window.location.hash,
                param,
                parsed = {};

            (function (){ 
               hash = hash.replace('#?','');
                hash = hash.split('&');
                for(var i=0,n=hash.length;i<n;i++){
                    param = hash[i].split('=');
                    parsed[param[0]] = param[1];
                }
           })();

           return parsed.view || false;
        }
     }
    
	function initialize(){
		
		var 	//$views = document.getElementsByTagName('o-view'),
                $views = octane.dom.views(),
				id, config;
				
		for(var i=0,n=$views.length; i<n; i++){
			id = $views[i].id;
			config = JSON.parse($views[i].getAttribute('o-config'));
			!$Views[id] && ($Views[id] = new View(id,config));
		}
				
		setRoutingButtons();
		
        // for HTML5 vs. HTML4 browsers
        // detect with modernizr   
         var features = document.getElementsByTagName('html')[0].getAttribute('class').split(' '),
            historyAPI = __.inArray(features,'history'),
            stateChangeEvent = historyAPI ? 'popstate' : 'hashchange';   

            window.addEventListener(stateChangeEvent,function(){
                   
                var view = parseView(historyAPI);
                   view && octane.route(view).done( function(){
                      } );
            });
        
            octane.handle('translated resize orientationchange',function(){
                currentView && currentView.setCanvasHeight();
            });
	}
    
	// Router Public API				
	octane.define({
		initRouter		: function(){
                                return initialize();
                            },
        parseView       : function(supportsHistoryAPI){
                                return parseView(supportsHistoryAPI);
                            },
		route			: function(id,ghost){
								return route(id,ghost).then( octane.translator.translate );
                            },
		routeThen		: function(id,callback){
								return routeThen(id,callback);
                            },
		exit			: function(id){
								return remove(id);
                            },
		pushState		: function (params){
							     pushState(params);
                            },
		currentView      : function(){
							return currentView;
                            }
	});
    
    if(octane.hasModule('debug')){
        this.define({
            getViews : function(){
                return $Views;
            }
        });
    }
    
    // update the page title when the view changes
     octane.controller('application').parser('currentView',function($dirty){
        $dirty.currentViewTitle = __.titleize($dirty.currentView);

        return $dirty;
    });
	
    
    // set-up for Views constructor
    var Base = octane.constructor;
    //var $animations = octane.library('viewAnimations') || {};
    
    
	/* ------------------------------------------------------- */
	//  Application Views
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
                    onLoadComplete  : function($deferred){

                            // resolve the deferred object we pass in from the loading call
                            $deferred && $deferred.resolve(id);
                        },
                    exitsBy         : exitConfig && config.exits.by || 'slide',
                    exitsTo         : exitConfig && __.inArray(positions,config.exits.to) ? config.exits.to : 'right',
                    exitEasing      : exitConfig && config.exits.ease || 'swing',
                    exitDuration	: exitConfig && _.isNumber(config.exits.dur) ? config.exits.dur : 500,
                    onExitComplete	: function($deferred){

                            // resolve the deferred object we pass in from the exiting call
                            $deferred && $deferred.resolve(id);
                        }
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
								this.doneLoading.push(callback);
							}					
			});
            
            this.setPosition(this.loadsFrom);
		}
		
        View.prototype = new Base('octane View');
    
        View.prototype.define({
            
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
                
                // scroll to top of page
                $('body').velocity('scroll',{duration:200});
                
                // make sure the view is visible
                this.$elem.css({
                    "visibility":"visible",
                    'display':'block',
                    'z-index':9999999999
                });
                
                if(this.loadsBy !== 'fade'){
                    this.$elem.css({
                        opacity:1
                    });
                }

                this.setCanvasHeight(); 
                
                // animate and return a deferred object
                var $def = $.Deferred();
				return $animations.loads[this.loadsBy].bind(this,$def)();
            },
                              
            exit : function (){
                
                var $this = this,
                    $def = $.Deferred();

                return $animations.exits[this.exitsBy].bind($this,$def)().done(function(){
                    
                    // make sure the view is hidden in its loadFrom position
                    $this.$elem.css({
                            'z-index':-1,
                            'visibility':'hidden',
                            'display':'none',
                            'opacity':0
                        });
                    
                    $this.setPosition(this.loadsFrom);
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
                
                var $view = this.$elem,
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
            },
            
            doCallbacks : function (){
                    var $this = this,
                        callbacks = this.doneLoading;
            
                    for (var i=0,n = callbacks.length; i < n; i++){
                        _.isFunction(callbacks[i]) && callbacks[i].bind($this)();
                    }
            }
        
        });
		
		// initialize the router		
		initialize();
});
		
	
		
	






















	
	
	
	
	
	
	
	
	
	
	
	