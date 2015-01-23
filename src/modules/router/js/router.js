// JavaScript Document

octane.module(
    'router',
    ['oView'],
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

        var 
        enRoute = null,
        routingBlocked = false,
        currentView,
        // store routes called while another route is executing its loading animation
        routesQueue = [],
        // conditions under which a route should be called, added with .routeIf()
        routeConditions = {};
        
        // block routing, incoming routes go to queue
        //octane.handle('block:routing',function(){
        function blockRouting(){
            routingBlocked = true;
        }//);
        // release block and route from queue
        //octane.handle('unblock:routing',function(){
        function unblockRouting(){
            routingBlocked = false;
            //( routesQueue.length > 0 ) && route(routesQueue.pop());
            var lastRouteRequested = routesQueue.pop();
            routesQueue = [];
            route(lastRouteRequested).catch(function(ex){
               octane.log(ex);
            });  
        }//);
        
        // add a condition that needs to be true for the route to run
        function routeIf(viewID,condition,failCallback){
           
            if(!_.isArray(routeConditions[viewID])){
                routeConditions[viewID] = [];
            }
            if(_.isFunction(condition)){
                condition = condition;
            } else {
                condition = function(){return true;};
                octane.error('condition passed to .routeIf() for must be a function. View ID: '+viewID);
            }
            
            routeConditions[viewID].push({
                condition : condition,
                onFail    : failCallback
            });
        }
        
        // add a deferred to execute before a view is routed
        // unlike routeIf, route will initialize whether the promise resolves or rejects
        // just keeps view from routing until something is done
        function routeAfter(viewID,deferred,argsArray){
            
            octane.view(viewID) && octane.view(viewID).beforeLoad(deferred,argsArray);
            return octane;
        }
            
        // add a callback to be executed when the specified view finishes its loading animation 
        function routeThen(viewID,callback,argsArray){

            octane.view(viewID) && octane.view(viewID).loadThen(callback,argsArray);
            return octane;
        }
        
        // @param id [str]: id of the o-view to be called
        // @param callback [fn]: a function to be executed when the loading animation finishes
        // function's thisArg is bound to the view called
        // @param ghost [bool]: do not update the history with the view (default false)
        function route(viewID,ghost){
            return new Promise(function(resolve,reject){  
                
                ghost = _.isBoolean(ghost) ? ghost : false;
                var 
                $view = octane.view(viewID);
                
                

            // ensure the onscreen view isn't reanimated
            //////////////////////////////////////////////////////////////////////////////////////
                                                                                                //
                if( $view && $view != currentView){                                             //
                                                                                                //
                // ensure a route isn't triggered while another route is animating              //
                // or while routing has been blocked by another module                          //
                //////////////////////////////////////////////////////////////////////////      //
                                                                                        //      //
                    if(!enRoute && !routingBlocked){                                    //      //
                                                                                        //      //
                        if(!checkRouteIf(viewID)){
                            reject('Routing condition not fulfilled for route "'+viewID+'"');
                            return;
                        }                                                               //      //
                                                                                        //      //
                        octane.fire('routing:begin');                                   //      //
                                                                                        //      //
                        enRoute = viewID;                                               //      //
                                                                                        //      //
                    // exit the current view before calling a new view                  //      //
                    //////////////////////////////////////////////////////////////      //      //
                                                                                //      //      //
                        if(currentView){                                        //      //      //
                            currentView.exit()                                  //      //      //
                                .then(function(){                               //      //      //
                                    return loadView($view,ghost);               //      //      //
                                })                                              //      //      //
                                .then(resolve)                                  //      //      //
                                .catch(octane.log);                             //      //      //
                        }else{                                                  //      //      //
                            loadView($view,ghost)                               //      //      //
                                .then(resolve)                                  //      //      //
                                .catch(octane.log);                             //      //      //
                        }                                                       //      //      //
                    //////////////////////////////////////////////////////////////      //      //
                                                                                        //      //
                    }else{                                                              //      // 
                        if(!__.inArray(routesQueue,viewID) && viewID !== enRoute){      //      //
                            routesQueue.push(viewID);                                   //      //
                        }                                                               //      //
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
            octane.fire('view:loading');
            
            return $view.load().then(function(){
                
                octane.fire('view:loaded');
                !ghost && pushState({view:$view.id});
                // update the current view
                currentView = $view;
                // update current view in global state, jumpstart Circuit                          
                octane.goose('application',{
                    viewID : $view.id,
                    viewTitle : $view.title   
                });
                // flag this route complete
                enRoute = null; 
               // check for queued routes
                if(routesQueue.length > 0){
                     // route next view
                    route(routesQueue.pop());
                } else{
                    // signal to any blocking listeners that routing is complete
                    octane.fire('routing:complete');
                }
             });
        }  
        
        // helper
        function checkRouteIf(viewID){
                    
            var conditions = routeConditions[viewID] || [];

                for(var c=0,C=conditions.length; c<C; c++){
                    if(conditions[c].condition()){
                        // meets routing condition
                        continue;
                    }else{
                        // does not meet routing condition, call fail callback
                        _.isFunction(conditions[c].onFail) && conditions[c].onFail();
                        return false;
                    }
                }
                return true;
        }

        function setRoutingButtons(){

            var btns = document.querySelectorAll('[o-route]');
            var n = btns.length;

            while(n--){
                // closure to capture the button and route during the loop
               setRoutingButtonsHelper(btns[n]);
            }
        }

        function setRoutingButtonsHelper(btn){
            var route = btn.getAttribute('o-route');
            btn.addEventListener('click',function(){
                octane.route(route)
                    .then()
                    .catch(octane.log);
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
                view && octane.route(view).then( function(){
                    //
                })
                .catch(function(ex){
                    octane.log(ex);
                })
            });
            // resize canvas to proper dimensions
            octane.handle('translated resize orientationchange',function(){
                currentView && currentView.setCanvasHeight();
            });
        }

        // Router Public API				
        octane.define({
            parseView       : parseView,
            route			: function(viewID,ghost){
                                return route(viewID,ghost).catch(function(ex){
                                    octane.log(ex);
                                });
                            },
            routeIf         : routeIf,
            routeAfter      : routeAfter,
            routeThen		: routeThen,
            pushState		: pushState,
            currentView     : function(){
                                return currentView
                            },
            blockRouting    : blockRouting,
            unblockRouting  : unblockRouting
        });

        // initialize the router		
        initialize();
    });
    
		
	
		
	






















	
	
	
	
	
	
	
	
	
	
	
	