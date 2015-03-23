

	octane.module('CordovaUtility').extend({
		
		initialize	: function(config){
			
         var deviceIsReady = false;
         var platformId;
         
         var exports = {
            get deviceReady (){
               return deviceIsReady; // a syncronous check for functions we know will be called after the deviceready event should have fired
            }
         };
         
         
         // write script to DOM 
         if(octane.context === 'cordova' && !window.cordova){
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = 'cordova.js';
            document.body.appendChild(script);
         }
         
         document.addEventListener('deviceready',function(){
				deviceIsReady = true;
            platformId = cordova.platformId;
            octane.context = 'cordova';
			});
         
         
         var ensureDeviceReady = new Promise(function(resolve,reject){    // an async check for callbacks waiting on deviceready
               document.addEventListener('deviceready',function(){
				         resolve();
               });
			});
         
         var takePhoto = function(options){
            
			
            if(!deviceIsReady) return Promise.reject('cannot call Cordova Utility "takePhoto". Event "deviceready" not fired');
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
               
            return new Promise(function(resolve,reject){
               navigator.camera.getPicture(resolve,reject,options);
            });
         };
         
         var addContact =  function(data){
        
           if(!deviceIsReady) return Promise.reject('cannot call Cordova Utility "addContact". Event "deviceready" not fired');
               
            return new Promise(function(resolve,reject){
              
                var contact = navigator.contacts.create(data);
                contact.save(resolve,reject);
               
            });
         };
         
         var download = function(url){
            
            return new Promise(function(resolve,reject){    
              
               var ft,uri,fileName,dir,path,swatch;
               
               if(!deviceIsReady) return reject('cannot call Cordova Utility "download" Event "deviceready" not fired');
               
               ft = new FileTransfer();                       // assumes apache.cordova.file-transfer plugin
               uri = encodeURI(url);
               fileName = uri.split('/').pop();
               
               switch(platformId){
                  
                  case 'ios':                                 // iOS implementation
                     
                     dir = 'tempDirectory';
                     break;
                  
                  case 'android':                              // Android implementation
                     
                     dir = 'applicationStorageDirectory';
                     break;
                  
                  default:
                     
                     reject('Platform is not iOS or Android'); // wrong platform 
                     return;                    
               }
               
               path = cordova.file[dir]+fileName;              // assumes apache.cordova.file plugin
               ft.download(uri,path,resolve,reject);    
             });
         };
         
         var viewFile = function(url){
            
            return new Promise(function(resolve,reject){
               
               if(!deviceIsReady) return reject('cannot call Cordova Utility "viewFile". Event "deviceready" not fired');
               
               switch (platformId){
                  
                  case 'ios':                                     // iOS implementation, assumes inAppBrowser plugin is installed  
                     
                         
                     window.open(url,'_blank','location=no,closebuttoncaption=Close,enableViewportScale=yes');
                     break;
                     
                  case 'android' :                                // Android implementation, assumes openFileNative plugin
                     
                     window.openFileNative.open(url);
                     break;
                     
                  default :
                  
                     reject('Platform is not iOS or Android');
               
               }   
            });
         };
         
         
         var openWith = function(data){
            return new Promise(function(resolve,reject){
               
               if(!deviceIsReady) return reject('cannot call Cordova Utility "openWith". Event "deviceready" not fired');
               
               switch(platformId){
                  
                  case 'ios' :                                    // iOS implementation, assumes apputils plugin
                      
                      apputils.OpenWith(resolve,reject,data);
                      break; 
                  
                  case 'android' :                                // Android implementation, assumes openFileNative plugin
                     
                     window.openFileNative.open(data.url);
                     
                     break;
                   
                  default: reject('Platform is not iOS or Android'); // wrong platform
               }
            });
         };
         
         // todo
         // iOS only, needs sniffer and android implementatiion
         /*var socialShare = function(data){
             
            if(!deviceIsReady) return Promise.reject('cannot call Cordova.socialShare(). Event "deviceready" not fired');
               
            return new Promise(function(resolve,reject){
               apputils.SocialShare(resolve,reject,data);
            });   
         };*/
          
         
        _.extend(exports,{
            
				takePhoto 	      : takePhoto,
            addContact        : addContact,
            download          : download,
            openWith          : openWith,
            viewFile          : viewFile,
            ensureDeviceReady : ensureDeviceReady,
            
            ParsePlugin       : {
               initialize     : function(a,b){
                  return new Promise(function(resolve,reject){
                     parsePlugin.initialize(a,b,resolve,reject);
                  });
               },
               
               subscribe      : function(channel){
                  return new Promise(function(resolve,reject){
                     parsePlugin.subscribe(channel,resolve,reject);
                  });
               },
               
               getInstallationId : function(){
                     return new Promise(function(resolve,reject){
                        parsePlugin.getInstallationId(resolve,reject);
                     });
                  }  
            }   
			});
         
         this.export(exports);
		
      }    
	});