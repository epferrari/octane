// JavaScript Document

octane.module('Router',['OctaneViews']).extend({
    
    initialize : function (cfg) {
	
        // octane's own pushstate method
        function pushState(params){

            _.isObject(params) || (params = {});
            // update the language in the url
            var parsed = __.urlObject().searchObject;	

            _.extend(parsed,params);

            var fragment = [];
            var parsedKeys = Object.keys(parsed);
            var k=parsedKeys.length;
            var key;
            
            while(k--){
                key = parsedKeys[k];
                fragment.push(key+'='+parsed[key]);
            }

            fragment = fragment.join('&');
            fragment = '?'+fragment;

            var language = octane.Translator && octane.Translator.getLang();
            var title = __.titleize(params.view) || currentView.title;

            History.pushState( 
                { lang: language },
                octane.get('App.name') +' | '+ title,
                fragment
            );
            
            document.querySelector('head>title').innerHTML = octane.get('App.name')+' | '+title;
        }

        var enRoute = null;
        var routingBlocked = false;
        var currentView;
        // store routes called while another route is executing its loading animation
        var queuedRoute = null;
        // conditions under which a route should be called, added with .routeIf()
        var routeConditions = {};
        
        // block routing, incoming routes go to queue
        //octane.handle('block:routing',function(){
        function blockRouting(){
            routingBlocked = true;
        }//);
        // release block and route from queue
        // octane.handle('unblock:routing',function(){
        function unblockRouting(){
            routingBlocked = false;
            
            if(queuedRoute){
                route(queuedRoute.view).then(queuedRoute.resolver).catch(function(ex){
                    octane.log(ex);
                });
            }
        }
        
        // add a condition that needs to be true for the route to run
        function routeIf(viewID,conditions){
            conditions = _.isObject(conditions) ? conditions : {};
            
            if(!_.isArray(routeConditions[viewID])){
                routeConditions[viewID] = [];
            }
            if(!_.isFunction(conditions.predicate)){
                conditions.predicate = function(){
                    return true;
                }
            }
            routeConditions[viewID].push(conditions);
            return octane; // chainable
        }
        
        // add a deferred to execute before a view is routed
        // unlike routeIf, route will initialize whether the promise resolves or rejects
        // just keeps view from routing until something is done
        function beforeRoute(viewID,deferred,argsArray){
            
            octane.getView(viewID) && octane.getView(viewID).addBeforeLoadPromise(deferred,argsArray);
            return octane;
        }
            
        // add a callback to be executed when the specified view finishes its loading animation 
        function routeThen(viewID,callback,argsArray){

            octane.getView(viewID) && octane.getView(viewID).addAfterLoadCallback(callback,argsArray);
            return octane;
        }
        
        // @param id [str]: id of the o-view to be called
        // @param ghost [bool]: do not update the history with the view (default false)
        function route(viewID,ghost){
            
            return new Promise(function(resolve,reject){  
                
                ghost = _.isBoolean(ghost) ? ghost : false;
                var 
                $view = octane.getView(viewID),
                viewOnScreen = ($view == currentView),
                modalOnScreen = (octane.Modal.getCurrent());
            
            // ensure the onscreen view isn't reanimated
            //////////////////////////////////////////////////////////////////////////////////////
                                                                                                //
                if( $view && viewOnScreen && modalOnScreen){                                   //
                    octane.Modal.dismiss(modalOnScreen.id);                                     //
                    resolve();                                                                  //
                } else if ($view && !viewOnScreen){                                             //
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
                        octane.fire('routing:begin');                                   //      //
                                                                                        //      //
                        enRoute = viewID;                                               //      //
                                                                                        //      //
                    // exit the current view before calling a new view                  //      //
                    //////////////////////////////////////////////////////////////      //      //
                                                                                //      //      //
                        if(currentView){                                        //      //      //
                            currentView.queueExit()                             //      //      //
                                .then(function(){                               //      //      //
                                    return loadView($view,ghost,currentView);   //      //      //
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
                        // a new route was called                                       //      // 
                        //if(viewID !== enRoute){
                            queuedRoute = {
                                view : viewID,
                                resolver : resolve
                            };
                            //      //
                        //} else {                                                        //      //
                            // the same route was called twice, resolve immediately
                         //   $view.callAfterLoadCallbacks();                                                           //      //
                        //    resolve();                                                  //      //
                       // }                                                               //      //
                    }                                                                   //      //
                //////////////////////////////////////////////////////////////////////////      //
                                                                                                //
                }else{
                    octane.fire('routing:complete');//
                    resolve();                                                                  //
                }                                                                               //
                                                                                                //
            //////////////////////////////////////////////////////////////////////////////////////

            });
        }
       
        // helper
        function loadView($view,ghost,previousView){
            octane.fire('view:loading');
            
            return $view.load().then(function(){
                
                octane.fire('view:loaded');
                !ghost && pushState({view:$view.id});
                // update the current view
                currentView = $view;
                // update current view in global state, jumpstart Circuit
                octane.set({
                    "App.viewID" : $view.id,
                    "App.viewTitle" : $view.title   
                });
                // send previous view back intot the hidden view stack
                previousView && previousView.exit();
                // flag this route complete
                enRoute = null; 
               // check for queued routes
                if(queuedRoute){
                    // route next view
                    var next = queuedRoute;
                    route(next.view).then(function(){
                        next.resolver();
                        queuedRoute = null;
                    });
                } else{
                    // signal to any blocking listeners that routing is complete
                    octane.fire('routing:complete');
                }
             });
        }  
        
        // helper
        function checkRouteIf(viewID){
            
            var 
            conditions = routeConditions[viewID] || [],
            i=0,n=conditions.length,
            checkCondition = function(condition){
               
                if(condition.predicate()){
                    // meets routing condition
                    return true;
                }else{
                    // does not meet routing condition, call fail callback
                    _.isFunction(condition.onfail) && condition.onfail();
                    return false;
                }
            };

            for(;i<n;i++){
                if (checkCondition(conditions[i])){
                    continue;
                } else {
                    return false;
                }
            }
            return true;
                     
                     
        }

       /* function setRoutingButtons(){

            var 
            btns = document.querySelectorAll('[o-route]'),
            n = btns.length,
            setBtn = function(btn){
                var route = btn.getAttribute('o-route');
               
                // catch a click event from a child node
                // re-purpose it to be used by the octane event mediator
                btn.addEventListener('click',function(e){
                    //e.stopPropagation();
                    //e.stopImmediatePropagation();
                    btn.dispatchEvent(__.customEvent('octane:route',{bubbles:true}));
                },false);
                
                // set up the octane event mediator
                // so event won't get a second listener
                // if you call .compile() again after .initialize()
                octane.handle('octane:route',btn,function(){
                    octane.route(route);
                });
            }
            
            while(n--){
                // closure to capture the button and route during the loop
               setBtn(btns[n]);
            }
        } */
           
        /*function setBackButtons(){
            var
            btns = document.querySelectorAll('.o-back'),
            n= btns.length,
            setBtn = function(btn){
                btn.addEventListener('click',function(e){
                    btn.dispatchEvent(__.customEvent('octane:routeback',{bubbles:true}));
                },false);
           
                octane.handle('octane:routeback',btn,goBack);
            }
            
            function goBack(){
                History.go(-1);
            }
            
            while(n--){
                setBtn(btns[n]);
            }
        }*/
                
        (function handleStateChange(){
            
            var
            html = document.getElementsByTagName('html')[0],
            history =  html && html.classList.contains('history'),
            stateChangeEvent = history ? 'popstate' : 'hashchange';
            
            // change the view with browser's forward/back buttons
            octane.handle(stateChangeEvent,function(){       
                var view = getRequestedView();
                view && octane.route(view);
            });
        })();

        // parse URL for a view  
        function getRequestedView(){

            // for HTML5 vs. HTML4 browsers
            // detect with modernizr   
            var  
            html = document.getElementsByTagName('html')[0],
            history =  html && html.classList.contains('history');

            if(history){
                return __.urlObject().searchObject.view || false;
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
       
        octane.define({ 
            Router      : {},
            route       : function(viewID,ghost){
                            return route(viewID,ghost).catch(function(ex){
                                octane.log(ex);
                            });
                        },
            routeIf     : routeIf,
            beforeRoute : beforeRoute,
            routeThen	: routeThen,
        });
        
        // Router Public API				
        octane.define.apply(octane.Router,[{
            requestedView   : getRequestedView,
            pushState		: pushState,
            currentView     : function(){
                                return currentView
                            },
            getQueue        : function(){
                return queuedRoute;
            },
            lock            : blockRouting,
            unlock          : unblockRouting,
            isLocked        : function(){
                return routingBlocked;
            }
        }]);
            
           
        // resize canvas to proper dimensions
        octane
            .handle('translated resize orientationchange',function(){
                currentView && currentView.setCanvasHeight();
            })
            .compiler('[o-route]',function(el){

                // catch a click event from a child node
                // re-purpose it to be used by the octane event mediator
                el.addEventListener('click',function(e){
                    //e.stopPropagation();
                    //e.stopImmediatePropagation();
                    el.dispatchEvent(__.customEvent('octane:route',{bubbles:true}));
                },false);
                
                // set up the octane event mediator
                // so event won't get a second listener
                // if you call .compile() again after .initialize()
                octane.handle('octane:route',el,function(e,el){
                    var route = el.getAttribute('o-route');
                    octane.route(route);
                });    
            })
            .compiler('.o-back',function(el){
                el.addEventListener('click',function(e){
                    el.dispatchEvent(__.customEvent('octane:routeback',{bubbles:true}));
                },false);

                octane.handle('octane:routeback',el,function(){History.go(-1)});
            });
    } // end initialize
}); // end module 
    
		
	
		
	






















	
	
	
	
	
	
	
	
	
	
	
	