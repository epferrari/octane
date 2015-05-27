	var _ 					= require('lodash');
	var Promise 		= require('bluebird');
	var Velocity 		= require('velocity-animate');
	var html2canvas = require('html2canvas');
	var _octane 		= require('./_octane.js');
	var Controller 	= require('./Controller.js');
	var DOM 				= require('./DOM.js');

		var
		bgContainer = DOM.bgContainer,
		appContainer = DOM.appContainer,
		viewContainer = DOM.viewContainer,
		modalContainer = DOM.modalContainer;

/* ------------------------------------------------------------------- */
/*                            UTILITY                                  */
/* ------------------------------------------------------------------- */

		var supportsCssFilters = (function(enableWebkit){
				var
				el,
				test1,
				test2,
				filter = 'filter:blur(2px)';

				//CSS3 filter is webkit. so here we fill webkit detection arg with its default
				if(enableWebkit === undefined) {
						enableWebkit = true;
				}
				//creating an element dynamically
				el = document.createElement('div');
				//adding filter-blur property to it
				el.style.cssText = (enableWebkit) ? '-webkit-'+filter : filter;
				//checking whether the style is computed or ignored
				test1 = (el.style.length !== 0);
				//checking for false positives of IE
				test2 = (
						document.documentMode === undefined //non-IE browsers, including ancient IEs
						|| document.documentMode > 9 //IE compatibility mode
				);
				//combining test results
				return test1 && test2;
		})();

	/* ------------------------------------------------------------------- */
	/*                            CONTROLLERS                              */
	/* ------------------------------------------------------------------- */




UiLayers = new Controller('UiLayerController',{
		// darken the modal background and disable click-thrus
		activateModalContainer: {
			// css animation
			css: function(resolve,reject){
						modalContainer.classList.add('active');
						//setTimeout(resolve,405);
						return resolve();
			},
			// js animation with Velocity.js
			js: function(resolve,reject){
						Velocity(modalContainer,'fadeIn',{duration:400})
						 .then(function(){
							modalContainer.classList.add('active');
							return resolve();
						});
			}
		},
		// re-enable click-thrus and remove darkness
		deactivateModalContainer: {
			css: function (resolve,reject){
						setTimeout(function(){
							modalContainer.classList.remove('active');
							resolve();
						},150);
			},
			js: function(resolve,reject){
						Velocity(modalContainer,'fadeOut',{duration:500})
							.then(function(){
								modalContainer.classList.remove('active');
								return resolve();
						});
			}
		},
		hideAppContainer: {
			css: function (resolve,reject){
						appContainer.classList.add('hidden');
						setTimeout(resolve,305);
			},
			js: function(resolve,reject){
						Velocity(appContainer,'fadeOut',{duration:300})
						.then(function(){
							appContainer.classList.add('hidden');
							return resolve();
						});
			}
		},
		revealAppContainer: {
			css: function (resolve,reject){
						appContainer.classList.remove('hidden');
						setTimeout(resolve,305);
			},
			js : function(resolve,reject){
						Velocity(appContainer,'fadeIn',{duration:300})
						 .then(function(){
							appContainer.classList.remove('hidden');
							return resolve();
						});
			}
		},
		// swap out the app container with a static image of itself
		activateBackground: {
			css: function(resolve,reject){
						bgContainer.classList.add('active');
						setTimeout(resolve,305);
			},
			js: function(resolve,reject){
						Velocity(bgContainer,'fadeIn',{duration:300})
						 .then(function(){
							bgContainer.classList.add('active');
							resolve();
						});
			}
		},
		deactivateBackground: {
			css: function(resolve,reject){
						bgContainer.classList.remove('active');
						setTimeout(resolve,305);
			},
			js: function(resolve,reject){
						Velocity(bgContainer,'fadeOut',{duration:300})
						.then(function(){
							bgContainer.classList.remove('active');
							resolve();
						});
			}
		},
		removeBackgroundImage: function(){
			bgContainer.firstChild && bgContainer.removeChild(bgContainer.firstChild);
			return Promise.resolve();
		},
		// get the static image
		getBackgroundImage: function (resolve,reject){
			html2canvas(appContainer,{
				onrendered : function(canvas){
					bgContainer.firstChild && bgContainer.removeChild(bgContainer.firstChild);
					bgContainer.appendChild(canvas);
					resolve(canvas);
				}
			});
		}
});

UiLayers.defineProp('supportsCssFilters',supportsCssFilters);

// cache screenshot as soon as routing completes
if(supportsCssFilter){
		UiLayers.addLayerEffect = function(){
			var method = _octane.animateBy || 'css';
			return new Promise(this.activateBackground[method])
				.bind(this)
				.then( this.activateModalContainer[method] )
				.then( this.hideAppContainer[method] );
		};
		UiLayers.removeLayerEffect = function(){
			var method = _octane.animateBy || 'css';
			return  new Promise(this.deactivateModalContainer[method])
				.bind(this)
				.then( this.revealAppContainer[method] )
				.then( this.deactivateBackground[method] );
		};
		UiLayers.handle('routing:complete',function(){
			if(_octane.useBackgroundFilterEffects) this.getBackgroundImage();
		});
} else {
		UiLayers.activateLayerEffect = function(){
			var method = _octane.animateBy || 'css';
			return new Promise(this.activateModalContainer[method]);
		};
		UiLayers.removeLayerEffect = function(){
			var method = _octane.animateBy || 'css';
			return  new Promise(this.deactivateModalContainer[method]);
		};
}

module.exports = UiLayers;