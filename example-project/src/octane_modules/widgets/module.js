// JavaScript Document

	octane.module('Widgets').export({
		
      // proto method for a controller implementing toggle-able content
      // controller must have a view defined or will throw an error
		toggleView :  function(elem){
					
				var toggleId      = elem.dataset.toggleTarget;
            var togglers      = this.view.querySelectorAll('[data-toggle-target]');
				var collapsibles  = this.view.querySelectorAll('.collapsible.visible');
				var target        = this.view.querySelector('[data-toggle-id="'+toggleId+'"]');
            
            _.each(togglers,function(toggler){
               if(toggler != elem){
               // }
               /*
                * We can just hide all of the self-toggled togglers without this conditional.
                * No we cannot  -E
                *
               */
                  toggler && toggler.classList && toggler.classList.remove('toggler-active');
               }
            });
            
				_.each(collapsibles,function(elem){
					if(elem != target){
						elem && elem.classList && elem.classList.remove('visible');
					}
				});
            
            // at 500 ms the promise ensures closing animations are completed before opening animations begin.	
				Promise.delay(500).then(function(){
               elem && elem.classList.toggle('toggler-active');
					target && target.classList.toggle('visible');
				});
			}
	});

