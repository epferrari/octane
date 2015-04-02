octane.module('ViewController').extend({
    
    initialize : function(cfg){
        
        var ViewController = octane.Factory.extend({
           
            configure : function(elem){
                
                _.extend(this,{
                    instanced       : true,
                    id              : elem.id,
                    title           : elem.getAttribute('title') || _.startCase(elem.id),
                    elem            : elem,
                    $elem           : $(elem),
                    _guid           : octane.GUID(),
                     beforeLoadTasks: [],
                    onloadTasks     : [],
                    onExitTasks     : []
                }); 
                
                var isClassed = false;
                var viewClasses = ['view-left','view-right','view-bottom','view-top','view-fader'];
                var n;

                _.isArray(cfg.extraViewClasses) && viewClasses.concat(cfg.extraViewClasses);
                n = viewClasses.length;

                while(n--){
                    if(this.elem.classList.contains(viewClasses[n]) ){
                        isClassed = true;
                        break;
                    }
                }
                !isClassed && this.elem.classList.add('view-left');
            },
            
            setCanvasHeight : function($pixels){
                
                var windowHeight = window.document.body.offsetHeight;
                this.elem.style.height = octane.viewContainer.style.height = windowHeight+'px';
               
            },
			
            beforeLoad : function(promise,args){
                try{
                    this.beforeLoadTasks.push([promise,args]);
                } catch(ex){
                    octane.log('cannot push "beforeLoad" promise to view '+this.id+', reason: '+ex.message);
                }    
            },
			
            onload : function(callback,args){
                try{
                   this.onloadTasks.push([callback,args]);
                }catch(ex){
                    octane.log('cannot push "onload" callback to view '+this.id+', reason: '+ex.message);
                }
            },
			
            onExit : function(callback,args){
                try{
                   this.onExitTasks.push([callback,args]);
                }catch(ex){
                    octane.log('cannot push "onExit" callback to view '+this.id+', reason: '+ex.message);
                }
            },
            
            _load : function(){
                this.setCanvasHeight();
                
                return this._runBeforeLoad()
                    .bind(this)
                    .finally(function(){
                        this.elem.classList.add('view-active');
                        $.Velocity(this.elem,'scroll',{duration:100});
                        return Promise.delay(405);
                    })
                    .then( this.setCanvasHeight )
                    .then( this._runOnload );
            },
            
            _exit : function (){
                
                this.elem.classList.remove('view-dismissed');
                return this._runOnExit().delay(805);
            },
            
            _queueExit  : function(){
                
                this.elem.classList.add('view-dismissed');
                this.elem.classList.remove('view-active');
                return Promise.delay(405);
            },
            
            _runBeforeLoad : function(){
                
                var todos = this.beforeLoadTasks;
                var completed = _.map(todos,this._execute);
                return Promise.settle(completed);
            },
            _runOnload : function(){
                
                var todos = this.onloadTasks;
                var completed = _.map(todos,this._execute);
                return Promise.all(completed);
            },
            _runOnExit : function(){
                
                var todos = this.onExitTasks;
                var completed = _.map(todos,this._execute);
                return Promise.all(completed);
            },
            _execute : function(callback){
                var f = callback[0];
                var args = _.isArray(callback[1]) ? callback[1] : [callback[1]];
                return f.apply(this,args);
            }    
        });
                                                      
        this.export({
            Factory        : ViewController,
            animations     : (cfg.viewAnimations || 'css')
        });                                              
    } // end initialize
}); // end module