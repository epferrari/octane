(function(module,exports){

	var Promise = require('bluebird');
	var _       = require('lodash');
	var cordova = require('cordova');
	require('cordova-plugin-device');

	// initially set this to false. It will be set to true when cordova's `deviceready` event fires
	var deviceIsReady = false;
	var platformId;

	// an async check for callbacks waiting on deviceready
	var ensureDeviceReady = new Promise(function(resolve,reject){
		document.addEventListener('deviceready',function(){
			platformId = cordova.platformId;
			deviceIsReady = true;
			_.each(document.querySelectorAll('input.web-app-file-upload'),function(input){
				var parent = input.parentElement;
				parent.removeChild(input);
			resolve();
		});
	});

	module.exports =  {
		get isReady (){
			// a syncronous check for functions we know will be called after the deviceready event should have fired
			return deviceIsReady;
		},
		get platformId (){
			return platformId;
		},
		get isReadyAsync(){
			return ensureDeviceReady;
		}
	};

})(module,exports);
