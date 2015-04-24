
	octane.module('ParseSync').extend({
		
		initialize : function(cfg){
		
			var baseURL = 'api.parse.com/';
			var version = cfg.version || 1;
			var $api = baseURL+'/'+version+'/';
			var appID = cfg.appID;
         var clientID = cfg.clientID;
			var jsKey = cfg.jsKey;
			var restKey = cfg.restKey;
			var url = 'https:/'+appID+':javascript-key='+jsKey+'@'+$api;
			var headers = {
				'X-Parse-Application-Id' : appID,
				'X-Parse-REST-API-Key' : restKey
			};
			
			Parse.initialize(appID,jsKey);
         
         this.export({
            appID : appID,
            clientID : clientID
         });
            
		}
	});
			
			
	