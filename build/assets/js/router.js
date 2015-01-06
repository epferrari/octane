// JavaScript Document

octane.module(
    'router',
    ['octane-views'],
    function (cfg) {
	
        // octane's own pushstate method
        function pushState(params){

            params = _.isObject(params) ? params : {};
            // update the language in the url
            var parsed = __.location().searchObject;	

            octane.extend.call(parsed,params);

            var fragment = [],
                parsedKeys = Object.keys(parsed),
                key;
            for(var k=0,K=parsedKeys.length; k<K; k++){
                key = parsedKeys[k];
                fragment.push(key+'='+parsed[key]);
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

            return new Promise(function(resolve,reject){

                ghost = _.isBoolean(ghost) ? ghost : false;
                var $view = octane.view(id);

                // ensure the onscreen view isn't reanimated
                //////////////////////////////////////////////////////////////////////////////////////
                                                                                                    //
                    if( $view && $view != currentView){                                             //
                                                                                                    //
                    // ensure a route isn't triggered while another route is animating              //
                    //////////////////////////////////////////////////////////////////////////      //
                                                                                            //      //
                        if(!isRouting){                                                     //      //
                                                                                            //      //
                            isRouting = true;                                               //      //
                                                                                            //      //
                        // exit the current view before calling a new view                  //      //
                        //////////////////////////////////////////////////////////////      //      //
                                                                                    //      //      //
                            if(currentView){                                        //      //      //
                                currentView.exit().done(function(){                 //      //      // 
                                    loadView($view,ghost).done(function(result){    //      //      //
                                        octane.fire('routed:view');                 //      //      //
                                        resolve(result);                            //      //      //
                                    });                                             //      //      //
                                });                                                 //      //      //
                            }else{                                                  //      //      //
                                loadView($view,ghost).done(resolve);                //      //      // 
                            }                                                       //      //      //
                        //////////////////////////////////////////////////////////////      //      //
                                                                                            //      //
                        }else{                                                              //      //
                            if(!__.inArray(routesQueue,id)){routesQueue.push(id);}          //      //
                        }                                                                   //      //
                    //////////////////////////////////////////////////////////////////////////      //
                                                                                                    //
                    }else{                                                                          //
                        resolve();                                                                  //
                    }                                                                               //
                                                                                                    //
                //////////////////////////////////////////////////////////////////////////////////////

            });
        }
        // helper
        function loadView($view,ghost){

             return new Promise(function(resolve,reject){

                $view.load().done(function(){
                    !ghost && pushState({view:$view.id});

                    // update the current biew
                    currentView = $view;
                    // update current view in global state, jumpstart Circuit                          
                    octane.goose('application',{ currentView : $view.id });
                    // flag the route complete
                    isRouting = false;
                    // resolve this route
                    resolve();
                    // route next view
                    (routesQueue.length > 0) && route(routesQueue.pop());

                 });
             });
       }  


        // add a callback to be executed when the specified view finishes its loading animation 
        function routeThen(id,callback){

            octane.view(id) && octane.view(id).addCallback(callback);
            return octane;
        }

        function remove(id){

            octane.view(id) && octane.view(id).exit();
            octane.goose('application',{currentView:''});
        }


        function setRoutingButtons(){

            var btns = document.querySelectorAll('[o-route]');
            var n = btns.length;

            while(n--){

                // closure to capture the button and route during the loop
               setRoutingButtonsHelper(btns[n]);
            }
        }

        function setRoutingButtonsHelper(btn,route){
            var route = btn.getAttribute('o-route');
            btn.addEventListener('click',function(){
                octane.route(route);
            });
         }


        // parse URL for a view  
        function parseView(){

            // for HTML5 vs. HTML4 browsers
            // detect with modernizr   
            var html5 = __.inArray(document.getElementsByTagName('html')[0].getAttribute('class').split(' '),'history');

            if(html5){
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

            var
            html5 = __.inArray(document.getElementsByTagName('html')[0].getAttribute('class').split(' '),'history'),
            stateChangeEvent = html5 ? 'popstate' : 'hashchange',
            id, config;

            setRoutingButtons(); 
            // change the view with browser's forward/back buttons
            window.addEventListener(stateChangeEvent,function(){       
                var view = parseView();
                view && octane.route(view).done( function(){} );
            });
            // resize canvas to proper dimensions
            octane.handle('translated resize orientationchange',function(){
                currentView && currentView.setCanvasHeight();
            });
        }

        // Router Public API				
        octane.define({
            parseView       : function(){
                                    return parseView();
                                },
            route			: function(id,ghost){
                                    return route(id,ghost);
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



        // update the page title when the view changes
         octane.controller('application').parser('currentView',function($dirty){
            $dirty.currentViewTitle = __.titleize($dirty.currentView);

            return $dirty;
        });

        // initialize the router		
        initialize();
    });
    
		
	
		
	






















	
	
	
	
	
	
	
	
	
	
	
	