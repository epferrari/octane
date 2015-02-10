
    octane.module('DefaultFilters',function(cfg){
        
        octane.filter('round',function(input){
    
            input = parseFloat(input);
        
            return Math.round(input);
        });
        
        octane.filter('round1',function(input){
            
            input = parseFloat(input);
            return Math.round(input*10)/10;
        });
        
        octane.filter('round2',function(input){
            
            input = parseFloat(input);
            return Math.round(input*100)/100;
        });
        
        octane.filter('round3',function(input){
            
            input = parseFloat(input);
            return Math.round(input*1000)/1000;
        });
        
        octane.filter('roundDown',function(input){
            
            input = parseFloat(input);
            return Math.floor(input);
        });
    
    });
        
        