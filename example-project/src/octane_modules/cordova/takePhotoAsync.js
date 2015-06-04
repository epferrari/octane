(function(module,exports){
	var device  = require('./cordova-device.js');
	var Promise = require('bluebird');
	var Camera  = require('cordova-plugin-camera');

	module.exports =  takePhotoAsync = function(options){
		return new Promise(function(resolve,reject){

			if(device.isReady) reject('cannot call CordovaAdapter.takePhotoAsync, device is not ready.');
			options || (options = {});
			var defaults = {
					quality	            : 75,
					destinationType      : Camera.DestinationType.DATA_URL,
					targetHeight         : 300,
					targetWidth          : 400,
					allowEdit            : true,
					saveToPhotoAlbum     : true,
					correctOrientation   : true
				};

			_.defaults(options,defaults);
			navigator.camera.getPicture(resolve,reject,options);
		});
	};
})(module,exports);
