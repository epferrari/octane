

	octane.initialize(

			// app config
			{
				 context           : 'web',
				 appName           : 'Octane Demo',
				 defaultView       : 'home'
			},

			// module configs
			{
				 ParseSync   : {
						appID          : '',
						jsKey          : '',
						clientID       : '' // for Cordova Parse plugin
				 },
				 MobileWebApp : {}
			}

	);
