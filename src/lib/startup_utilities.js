 // init external dependencies/utilities that help octane run
 
 octane.module('StartupUtilities').extend({
     
     initialize : function(cfg){
    
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
         
        var keys = Object.keys(utils);
        var n = keys.length;
        var util;

        while(n--){
            util = keys[n];    
            // hook for the loading message
            octane.fire('loading:utility',{detail:util});
            // init utility
           _.isFunction(utils[util]) && utils[util].call();
        }
     }
});
