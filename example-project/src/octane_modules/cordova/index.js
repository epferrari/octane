
	(function(module,exports){

		var octane  = require('octane');
		var cordova = require('cordova');
		var ft      = require('cordova-plugin-file-transfer');
		var Promise = require('bluebird');
		require('cordova-plugin-inappbrowser');
		require('cordova-plugin-camera');
		require('cordova-plugin-file');

		var CordovaAdapter = function(config){

				addContactAsync: function(data){
					return new Promise(function(resolve,reject){
						if(!deviceIsReady) reject('cannot call CordovaAdapter.addContact, device is not ready.');
						var contact = navigator.contacts.create(data);
						return contact.save(resolve,reject);
					});
				},
				downloadAsync: function(url){
					return new Promise(function(resolve,reject){

							var ft,uri,fileName,dir,path,swatch;

							if(!deviceIsReady) return reject('cannot call CordovaAdapter.download, device is not ready.');

							ft = new FileTransfer();
							uri = encodeURI(url);
							fileName = uri.split('/').pop();

							switch(platformId){
								case 'ios':
									// iOS implementation
									dir = 'tempDirectory';
									break;
								case 'android':
									// Android implementation
									dir = 'applicationStorageDirectory';
									break;
								default:
									// wrong platform
									reject('Platform is not iOS or Android');
									return;
							}

							path = cordova.file[dir]+fileName;
							ft.download(uri,path,resolve,reject);
						});
				},
				viewFileAsync: function(url){
					return new Promise(function(resolve,reject){
							if(!deviceIsReady) return reject('cannot call Cordova Utility "viewFile". Event "deviceready" not fired');
							switch (platformId){
								case 'ios':
									// iOS implementation, assumes inAppBrowser plugin is installed
									window.open(url,'_blank','location=no,closebuttoncaption=Close,enableViewportScale=yes');
									break;
								case 'android':
									// Android implementation, assumes openFileNative plugin
									window.openFileNative.open(url);
									break;
								default:
									reject('Platform is not iOS or Android');
							}
					});
				},
				openWithAsync = function(data){
					return new Promise(function(resolve,reject){

							if(!deviceIsReady) return reject('cannot call Cordova Utility "openWith". Event "deviceready" not fired');

							switch(platformId){

								case 'ios' :                                    // iOS implementation, assumes apputils plugin

										apputils.OpenWith(resolve,reject,data);
										break;

								case 'android' :                                // Android implementation, assumes openFileNative plugin

										window.openFileNative.open(data.url);

										break;

								default: reject('Platform is not iOS or Android'); // wrong platform
							}
					});
				},
				ParsePlugin: {
					initialize: function(a,b){
						return new Promise(function(resolve,reject){
							parsePlugin.initialize(a,b,resolve,reject);
						});
					},

					subscribe: function(channel){
						return new Promise(function(resolve,reject){
							parsePlugin.subscribe(channel,resolve,reject);
						});
					},

					getInstallationId: function(){
						return new Promise(function(resolve,reject){
								parsePlugin.getInstallationId(resolve,reject);
						});
					}
				}
			}
		}





})(module,exports);

				 var




				 var

				 // todo
				 // iOS only, needs sniffer and android implementatiion
				 /*var socialShare = function(data){

						if(!deviceIsReady) return Promise.reject('cannot call Cordova.socialShare(). Event "deviceready" not fired');

						return new Promise(function(resolve,reject){
							 apputils.SocialShare(resolve,reject,data);
						});
				 };*/


				_.extend(exports,{

				takePhoto 	      : takePhoto,
						addContact        : addContact,
						download          : download,
						openWith          : openWith,
						viewFile          : viewFile,
						ensureDeviceReady : ensureDeviceReady,


			});

				 this.export(exports);

			}
	});
