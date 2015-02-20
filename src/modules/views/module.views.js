// set-up for Views constructor

octane.module('OctaneViews',['ViewPrototype']).extend({
    
    initialize : function(cfg){
           
        var $Views = {};
        var $proto = this.import('ViewPrototype');
    
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

        function OctaneView(elem){
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
            
            // prototype method
            this.configureLoading();
        }

        OctaneView.prototype = new octane.Base;
        OctaneView.prototype.constructor = OctaneView;
        OctaneView.prototype.augment($proto);
        
        (function(){
            
            var $views = octane.dom.views();
            var n = $views.length;
            var config;
            var id;
            
            // bind html views to View objects 
            while(n--){
                id = $views[n].id;
                config = JSON.parse($views[n].getAttribute('o-config'));
                !$Views[id] && ($Views[id] = new OctaneView($views[n],config));
            } 
        })();
        
        octane.define({
            getView : function(id){
                return $Views[id] || false;
            }
        });
    }
});