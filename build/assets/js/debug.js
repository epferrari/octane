
    octane.module('Debug',function(_octane){
        
        this.extend({

           getModules : function(){ 
               return _octane.modules;
           },
           getModels : function(){
               return _octane.models;
           },
           getControllers : function(){
               return _octane.controllers;
           },
           getTasks :	function(controller){
                return controller.tasks.getCases();
            },
           getEvents	: function(){
               return _octane.eventRegister;
           },
           log : function(message){
               _octane.errors.log(message);
           },
           logfile : function(){ 
                return _octane.errors.logfile;
            }   
        });
    });