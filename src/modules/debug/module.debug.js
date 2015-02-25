
    octane.module('Debug').extend({
        
        initialize : function(cfg){
            var _octane = cfg.protected;

            octane.Debug = {
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
                   return _octane.eventHandlerMap;
                },
                getFilterMap  : function (){
                    return _octane.filterMap;
                },
                getFilters : function(){
                    return _octane.filters;
                },
                log : function(full){ 
                    return full ? _octane.bootlog.concat(_octane.logfile) : _octane.logfile;
                },
                getCollections : function(){
                    return _octane.Collections;
                },
                bootlog : function(){
                    return _octane.bootlog;
                }
            };
        }
    });