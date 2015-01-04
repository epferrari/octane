
    octane.module('debug',function(_octane){
        
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
           getTasks :	function(controller){
                return controller.tasks && controller.tasks.getCases();
            },
           getEvents	: function(){
               return _octane.eventRegister;
           },
           log : function(message){
               _octane.log(message);
           },
           getLog : function(){ 
                return _octane.getLogfile();
            }   
        });
    });