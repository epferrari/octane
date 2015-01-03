 // init external dependencies/utilities that help octane run
 
 octane.addLibrary('startup-utilities',{
    
    fastlickJS : function(){
        
        // attach fastclick.js for mobile touch
        if ('addEventListener' in document) {
            document.addEventListener('DOMContentLoaded', function() {
                FastClick.attach(document.body);
            }, false);
        }
    },
    
    
	historyJS : function(){
        
        // add History.js so we can route
        (function(window,undefined){

            // Bind to StateChange Event
            History.Adapter.bind(window,'statechange',function(){ // Note: We are using statechange instead of popstate
                var State = History.getState(); // Note: We are using History.getState() instead of event.state
            });

        })(window);
    }
});