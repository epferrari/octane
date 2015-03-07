// set-up for Views constructor

octane.module('OctaneViews',['ViewController']).extend({
    
    initialize : function(cfg){
           
        var $Views          = {};
        var ViewController  = this.imports.ViewController.Factory;
        var OctaneView      = ViewController.extend({
        
            // Instance Methods
            
            initialize : function(elem){
                
                        if(!elem) octane.error('Must pass an HTML element to OctaneView');
                    
                        this.configure(elem);
                        this.view = this.elem;
                        this.name = _.capitalize(_.camelCase(this.title))+'ViewController';
                        $Views[this.id] = this;
                
                    },
            
            constructor : function OctaneView(){ return octane.Controller.apply(this,arguments); },
            
            destroy : function(){
                        this._destroy();
                        delete $Views[this.name];
                    },
            
           
        },{
             // Static Methods
            
            create : function(elem){
                        return new OctaneView(elem);
                    },
            
            destroy : function(id){
                        var view = this.get(id);
                        view && view.destroy();
                    },
            
            get : function(id){
                        return $Views[id];
                    }
        });
        
        octane.compiler('o-view',OctaneView.create.bind(OctaneView));
        
        
        octane.engrave({ View : OctaneView });
    }
});