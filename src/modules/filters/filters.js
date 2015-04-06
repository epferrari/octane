
		octane.module('DefaultFilters').extend({

				initialize : function(cfg){

						octane.filter('round',function(input,model,decimalPlaces){

								input = parseFloat(input);
								var power = Math.pow(10,decimalPlaces);
								return Math.round(input*power)/power;
						});

						octane.filter('roundDown',function(input){

								input = parseFloat(input);
								return Math.floor(input);
						});

						octane.filter('titleize',function(input){
								return __.titleize(input);
						});

						octane.filter('caps',function(input){
							return (__.typeOf(input) == 'string') ? input.toUpperCase() : input;
						});

						octane.filter('hidePassword',function(password,state,replacement){
							if(state.showPassword){
								return password;
							}else{
								return password.replace(/\w/g,replacement);
							}
						});
				}
		});
