(function(module,exports){

	var Promise = require('bluebird');
	var device = require('./cordova-device.js');
	require('cordova-plugin-contacts');

	var addContactAsync = function(data){
		return new Promise(function(resolve,reject){
			if(!device.isReady) reject('cannot call .addContactAsync, device is not ready.');
			var contact = navigator.contacts.create(data);
			return contact.save(resolve,reject);
		});
	};
	
	module.exports = addContactAsync;

})(module,exports);
