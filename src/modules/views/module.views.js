// set-up for Views constructor

octane.module(
    'oView',
    ['viewPrototype'],
    function(cfg){
           
        var 
        Base = octane.constructor, 
        $Views = {},
        $proto = this.import('viewPrototype');
    
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

        function View(elem){
            if(!_.isString(elem.id)) return {instanced:false};

            this.define({

                instanced	: true,
                id			: elem.id,
                title       : elem.getAttribute('title') || __.titleize(elem.id),
                elem		: elem,
                $elem 		: $(elem),
                _guid		: octane.GUID(),
                todoBeforeLoad : [],
                todoAfterLoad : [],					
            });
            
            this.configureLoading();
        }

        View.prototype = new Base('octane View');
        View.prototype.define({
            constructor : View
        });
        
        View.prototype.extend($proto);
        
        this.initialize = function(){
            
            var 
            $views = octane.dom.views(),
            id;
            
            // bind html views to View objects 
            for(var i=0,n=$views.length; i<n; i++){
                id = $views[i].id;
                config = JSON.parse($views[i].getAttribute('o-config'));
                !$Views[id] && ($Views[id] = new View($views[i],config));
            }
            octane.define({
                view : function(id){
                    return $Views[id] || false;
                }
            });
        };
         
    });