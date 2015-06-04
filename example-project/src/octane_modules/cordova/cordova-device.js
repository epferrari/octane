(function(module,exports){

	var Promise = require('bluebird');
	var _       = require('lodash');
	require('cordova-plugin-device');

	// initially set this to false. It will be set to true when cordova's `deviceready` event fires
	var deviceIsReady = false;
	var platformId;
	// an async check for callbacks waiting on deviceready
	var ensureDeviceReady = new Promise(function(resolve,reject){
		document.addEventListener('deviceready',function(){
			resolve();
		});
	});

	document.addEventListener('deviceready',function(){
		deviceIsReady = true;
		platformId = cordova.platformId;
		_.each(document.querySelectorAll('input.web-app-file-upload'),function(input){
			var parent = input.parentElement;
			parent.removeChild(input);
	});

		return {
			get deviceReady (){
				// a syncronous check for functions we know will be called after the deviceready event should have fired
				return deviceIsReady;
			},
			get platformId (){
				return platformId;
			},

})(module,exports);
