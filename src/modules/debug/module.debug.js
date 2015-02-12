
    octane.module('Debug',function(cfg){
        var _octane = cfg.protected;
        
        octane.augment({

           getModules : function(){ 
               return _octane.modules;
           },
           getModels : function(){
               return _octane.Models;
           },
           getControllers : function(){
               return _octane.controllers;
           },
           getEvents	: function(){
               return _octane.eventHandlerMap;
           },
           getLog : function(full){ 
                return full ? _octane.bootlog.concat(_octane.logfile) : _octane.logfile;
           },
            getCollections : function(){
                return _octane.Collections;
            },
            bootlog : function(){
                return _octane.bootlog;
            }
        });
    });