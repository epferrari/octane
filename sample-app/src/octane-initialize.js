

	octane.initialize(

      // app config
      {
         context           : 'web',
         appName           : 'Pass Match 2.0',
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
