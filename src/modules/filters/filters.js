
		octane.module('DefaultFilters').extend({

				initialize : function(cfg){

						octane.filter('round',function(decimalPlaces){
							var input = this.input;
							var power = Math.pow(10,decimalPlaces);
							input = parseFloat(input);
							return Math.round(input*power)/power;
						});

						octane.filter('roundDown',function(){
							return Math.floor( parseFloat(this.input) );
						});

						octane.filter('titleize',function(){
							return  __.titleize(this.input);
						});

						octane.filter('caps',function(){
							var input = this.input;
							return (__.typeOf(input) == 'string') ? input.toUpperCase() : input;
						});

						octane.filter('hidePassword',function(replacement){
							if(!this.model.showPassword){
								return this.input.replace(/\w/g,replacement);
							}
							return this.input;
						});
				}
		});
