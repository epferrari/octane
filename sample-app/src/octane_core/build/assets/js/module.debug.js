
    octane.module('Debug').extend({
        
        initialize : function(cfg){
            
            var reflection = cfg.protected;
            
            /* 
            * modules
            * controllers
            * events
            * filters
            * templates
            */
            octane.engrave('debug',function(property){
                property == 'events' && (property = 'eventHandlerMap');
                return reflection[property];
            });
            
            octane.defineGetter('errors',function(){
                return reflection.logfile;
            });
            
            octane.defineGetter('bootlog',function(){
                return reflection.bootlog;
            });
        }
    });