
// mixin method for a controller implementing toggle-able content
	(function(module){

		var Velocity = require('velocity-animate');
		var Promise = require('bluebird');


		exports.AccordionView = {

			onRender: function(){
				this.triggers = this.view.querySelectorAll('[data-panel-target]');
				this.panels   = this.view.querySelectorAll('o-collapsible');
				_.each(this.triggers,function(trigger){
					trigger.on('click',this.handleTriggerClick.bind(this));
				},this);
			},
			onRemove: function(){
				_.each(this.triggers,function(trigger){
					trigger.forget('click');
				});
				this.triggers = this.panels = this.activePanel = this.activeTrigger = null;
			},
			handleTriggerClick: function(){
				if(this.activeTrigger !== trigger){

					this.activeTrigger.classList.remove('trigger-active');
					trigger.classList.add('trigger-active');
					this.activeTrigger = trigger;

					var panelId = trigger.dataset.panelTarget;
					var targetPanel = _.where(this.panels,function(panel){
						return panel.dataset.panelId === panelId;
					});

					this.closePanels()
					.bind(this)
					.then(function(){
						this.openPanel(targetPanel);
					});

				} else {
					trigger.classList.remove('trigger-active');
					this.closePanels();
				}
			},
			closePanels: function(){
				return Promise.all(_.map(this.panels,function(panel){
					if(panel && panel !== targetPanel){
						return Velocity(panel,'slideUp',{duration:150})
						.then(function(p){
							p[0].classList.remove('panel-open');
						});
					}
				}))
			},
			openPanel: function(panel){
				return Velocity(panel,'slideUp',{duration: 150});
					.then(function(p){
						p.[0].classList.remove('panel-open');
					})
			}
		});

		



		exports.togglePanel = function(node){

			if(!node || !this.view) return;

			var panelId      	= node.dataset && node.dataset.panelTarget;
			var view					= this.view;
			var triggers      = view.querySelectorAll('[data-panel-target]');
			var panels  			= view.querySelectorAll('o-collapsible');
			var targetPanel   = view.querySelector('o-collapsible[data-panel-id="'+panelId+'"]');

			_.each(triggers,function(t){
				if(t && t !== trigger){
					t.classList && t.classList.remove('trigger-active');
				}
			});


			.then(function(){
				if(!targetPanel) return;
				var isClosed = !targetPanel.classList.contains('panel-open');
				return Velocity(targetPanel,(isClosed ? 'slideDown' : 'slideUp'),{duration:200})
			})
			.then(function(tp){
				tp && tp[0].classList.toggle('panel-open');
				node && node.classList && node.classList.toggle('trigger-active');
			});
		};



	})(module,exports);
