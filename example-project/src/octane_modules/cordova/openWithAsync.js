	(function(module,exports){

		var Promise = require('bluebird');
		var device  = require('./cordova-device.js');

		var openWithAsync = function(url){
			return new Promise(function(resolve,reject){
				if(!deviceIsReady) return reject('cannot call Cordova Utility "openWith". Event "deviceready" not fired');

				switch(device.platformId){
					// iOS implementation, assumes apputils plugin
					case 'ios' :
						window.apputils.OpenWith(resolve,reject,data);
						break;
					case 'android' :
						// Android implementation, assumes openFileNative plugin
						window.openFileNative.open(data.url);
						break;
					default: reject('Platform is not iOS or Android'); // wrong platform
				}
			});
		};

		module.exports = downloadAsync;

	})(module,exports);
