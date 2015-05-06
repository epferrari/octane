
		octane.module('UiOverlay').extend({

				initialize :function(cfg){

						var
						bgContainer = octane.bgContainer,
						appContainer = octane.appContainer,
						viewContainer = octane.viewContainer,
						modalContainer = octane.modalContainer,
						Background, // controller
						AppContainer, // controller
						ModalContainer, // controller
						Velocity = Velocity || $.Velocity, // library
						method = octane.viewAnimationMethod || 'css';

				/* ------------------------------------------------------------------- */
				/*                            UTILITY                                  */
				/* ------------------------------------------------------------------- */

						function hasCssFilterSupport (enableWebkit){
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
						}

						/* ------------------------------------------------------------------- */
						/*                            CONTROLLERS                              */
						/* ------------------------------------------------------------------- */

						ModalContainer = octane.controller('ModalContainerController',{
								// darken the modal background and disable click-thrus
								activate : {
										// css animation
										css : function(){
														return new Promise(function(resolve){
																modalContainer.classList.add('active');
																//setTimeout(resolve,405);
																resolve();
														});
										},
										// js animation with Velocity.js
										js : function(){
														return new Promise(function(resolve){
																 Velocity(modalContainer,'fadeIn',{duration:400})
																 .then(function(){
																		modalContainer.classList.add('active');
																		return resolve();
																});
														});
										}
								},
								// re-enable click-thrus and remove darkness
								deactivate :{
										css : function (){
														return new Promise(function(resolve){
																setTimeout(function(){
																		modalContainer.classList.remove('active');
																		resolve();
																},150);
														});
										},
										js : function(){
														return new Promise(function(resolve){
															 Velocity(modalContainer,'fadeOut',{duration:500})
																.then(function(){
																		modalContainer.classList.remove('active');
																		return resolve();
															 });
														});
										}
								}
						});

						AppContainer = octane.controller('AppContainerController',{
								hide : {
										css : function (){
												return new Promise(function(resolve){
														appContainer.classList.add('hidden');
														setTimeout(resolve,305);
												});
										},
										js : function(){
												return new Promise(function(resolve){
														Velocity(appContainer,'fadeOut',{duration:300})
														.then(function(){
																appContainer.classList.add('hidden');
																return resolve();
														});
												});
										}
								},
								reveal : {
										css : function (){
														return new Promise(function(resolve){
																appContainer.classList.remove('hidden');
																setTimeout(resolve,305);
														});
										},
										js : function(){
												return new Promise(function(resolve){
														Velocity(appContainer,'fadeIn',{duration:300})
														 .then(function(){
																appContainer.classList.remove('hidden');
																return resolve();
														});
												});
										}
								}
						});



						Background = octane.controller('BackgroundController',{
								// swap out the app container with a static image of itself
								activate : {
										css : function(){
												return new Promise(function(resolve){
														bgContainer.classList.add('active');
														setTimeout(resolve,305);
												});
										},
										js : function(){
												return new Promise(function(resolve){
														Velocity(bgContainer,'fadeIn',{duration:300})
														 .then(function(){
																bgContainer.classList.add('active');
																resolve();
														});
												});
										}
								},
								deactivate : {
										css : function(){
												return new Promise(function(resolve){
														bgContainer.classList.remove('active');
														setTimeout(resolve,305);
												});
										},
										js : function(){
												return new Promise(function(resolve){
														Velocity(bgContainer,'fadeOut',{duration:300})
														.then(function(){
																bgContainer.classList.remove('active');
																resolve();
														});
												});
										}
								},
								removeImage : function(){
										bgContainer.firstChild && bgContainer.removeChild(bgContainer.firstChild);
										return Promise.resolve();
								},
								// get the static image
								getImage : function (){
										return new Promise(function(resolve){
												html2canvas(appContainer,{
														onrendered : function(canvas){
																bgContainer.firstChild && bgContainer.removeChild(bgContainer.firstChild);
																bgContainer.appendChild(canvas);
																resolve(canvas);
														}
												});
										});
										/*
										testing w/o
										var canvas = document.createElement('canvas');
										return Promise.resolve(canvas);
										*/
								}
						});



						// cache screenshot as soon as routing completes
						if(hasCssFilterSupport){
								octane.on('routing:complete',function(){
										Background.getImage();
								});
						}

						this.export({
							add : function(){
									if(hasCssFilterSupport){
											return Background.activate[method]()
															.then( ModalContainer.activate[method] )
															.then( AppContainer.hide[method] );
									} else {
											return ModalContainer.activate[method]();
									}
							},
							remove : function(){
									if(hasCssFilterSupport){
											return  ModalContainer.deactivate[method]()
															.then( AppContainer.reveal[method] )
															.then( Background.deactivate[method] );
									} else {
											return ModalContainer.deactivte[method]();
									}
							}
						});
				} // end initialize
		}); // end module
