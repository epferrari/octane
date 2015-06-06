// JavaScript Document

(function(module,exports){

	var octane = require('octane');
	var addToHomescreen = require('add-to-homescreen');

	var ath = addToHomescreen({
		 autostart : true,
		 skipFirstVisit : false,
		 maxDisplayCount : 2
	});

	module.exports = function(config){
		config||(config={});
		var markup = [
			 '<!-- soft fullscreen on iOS 7.1 -->',
			'<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimal-ui">',

			 '<!-- true fullscreen in iOS 1.0 and iOS 8.0 Beta when launched from homescreen -->',
			'<meta name="apple-mobile-web-app-capable" content="yes">'+
			 '<meta name="apple-mobile-web-app-title" content="'+octane.App.get('name')+'">',

			 '<!-- Apple homescreen icons -->'+
			/*'<link rel="apple-touch-icon" href="'+(config.icon60 || 'assets/img/iOSicon60x60.png')+'">',
			'<link rel="apple-touch-icon" sizes="72x72" href="'+(config.icon72 || 'assets/iOSicon76x76.png')+'">',
			'<link rel="apple-touch-icon" sizes="120x120" href="'+(config.icon120 || 'assets/img/iOSicon120x120.png')+'">',
			 '<link rel="apple-touch-icon" sizes="144x144" href="'+(config.icon144 || 'assets/img/iOSicon144x144.png')+'">',
			'<link rel="apple-touch-icon" sizes="152x152" href="'+(config.icon152 || 'assets/img/iOSicon152x152.png')+'">',*/
			 '<link rel="apple-touch-icon" sizes="150x150" href="'+(config.icon150 || 'assets/img/iOSicon152x152.png')+'">',
			 '<!-- iPhone -->',
			'<link rel="apple-touch-startup-image"',
		 'href="'+(config.startupImage || 'assets/img/apple-touch-startup-image.png')+'">';

		if(octane.env === 'web'){
			 document.head.innerHTML = document.head.innerHTML + markup.join('');
			 ath.show();
		}
	};

})(module,exports);
