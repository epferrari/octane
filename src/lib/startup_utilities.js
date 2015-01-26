 // init external dependencies/utilities that help octane run
 
 octane.module('startup-utilities',function(cfg){
    
    var utils = {
        fastclickJS : function(){

            // attach fastclick.js for mobile touch
            if ('addEventListener' in document) {
                document.addEventListener('DOMContentLoaded', function() {
                    FastClick.attach(document.body);
                }, false);
            }
        },


        historyJS : function(){

            // add History.js so we can route
            try{
                (function(window,undefined){

                    // Bind to StateChange Event
                    History.Adapter.bind(window,'statechange',function(){ // Note: We are using statechange instead of popstate
                        var State = History.getState(); // Note: We are using History.getState() instead of event.state
                    });

                })(window);
            }catch(ex){

            }
        }
    };
    
    this.initialize = function(){
        var 
        utilsKeys = Object.keys(utils),
        util;

        for(var u=0,U=utilsKeys.length; u<U; u++){
            util = utilsKeys[u];    
            // hook for the loading message
            $O.fire('loading:utility',{detail:util});
            // init utility
           _.isFunction(utils[util]) && utils[util].call();
        }
    } 
});
