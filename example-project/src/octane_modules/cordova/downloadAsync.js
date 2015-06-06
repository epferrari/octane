	(function(module,exports){

		var cordova = require('cordova');
		var ft      = require('cordova-plugin-file-transfer');
		var Promise = require('bluebird');
		var device  = require('./cordova-device.js');
		require('cordova-plugin-file');

		var downloadAsync = function(url){
			return new Promise(function(resolve,reject){

				var ft,uri,fileName,dir,path,swatch;

				if(!device.isReady) return reject('cannot call CordovaAdapter.download, device is not ready.');

				ft = new FileTransfer();
				uri = encodeURI(url);
				fileName = uri.split('/').pop();

				switch(device.platformId){
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
		};

		module.exports = downloadAsync;

	})(module,exports);
