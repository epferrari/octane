
    Octane.Module('Debug',function(octane){
        
        this.extend({

           getModules : function(){ 
               return octane.modules;
           },
           getModels : function(){
               return octane.models;
           },
           getControllers : function(){
               return octane.controllers;
           },
           getTasks :	function(controller){
                return controller.tasks.getCases();
            },
           getEvents	: function(){
               return octane.eventRegister;
           },
           log : function(message){
               octane.errors.log(message);
           },
           logfile : function(){ 
                return octane.errors.logfile;
            }   
        });
    });