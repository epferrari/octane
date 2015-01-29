
    octane.module('debug',function(cfg){
        var _octane = cfg.protected;
        
        octane.extend({

           getModules : function(){ 
               return _octane.modules;
           },
           getModels : function(){
               return _octane.models;
           },
           getControllers : function(){
               return _octane.controllers;
           },
           getEvents	: function(){
               return _octane.eventRegister;
           },
           getLog : function(full){ 
                return full ? _octane.bootlog.concat(_octane.logfile) : _octane.logfile;
           },
            bootlog : function(){
                return _octane.bootlog;
            }
        });
    });