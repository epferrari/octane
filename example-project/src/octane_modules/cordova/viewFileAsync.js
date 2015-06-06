(function(module,exports){

	var Promise = require('bluebird');
	var device = require('./cordova-device.js');
	require('cordova-plugin-inappbrowser');

	var viewFileAsync = function(url){
		return new Promise(function(resolve,reject){
				if(!device.isReady) return reject('cannot call Cordova Utility "viewFile". Event "deviceready" not fired');
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
	};

	module.exports = viewFileAsync;

})(module,exports);
