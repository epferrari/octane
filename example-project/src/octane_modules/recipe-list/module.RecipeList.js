
	octane.module('RecipeList').extend({
		initialize: function(config){

			var select = document.querySelector.bind(document);

			var RecipeList = octane.controller('RecipeList',{
				view: select('ul#recipe-list'),
				template: octane.Template.get('recipe-item'),
				add: function(node){
					var recipe = octane.Mediator.get('Recipe');
					if(recipe.get('name')){
						this.recipes.push(recipe);
						octane.Model.create({id:(recipe.get('id')+1)}).become('Recipe');
						this.template.set(recipe.get()).appendTo(this.view);
					}
				},
				clear: function(){
					octane.Model.create({id:0}).become('Recipe');
					this.recipes = [];
					this.view.innerHTML = '';
				},
				delete: function(node,recipeId){
					var target = this.view.querySelector('[data-recipe-id="'+recipeId+'"]');
					_.remove(this.recipes,function(recipe){
						return recipe.id === recipeId;
					});
					this.view.removeChild(target);
				}
			});

			RecipeList.clear();
		}
	});
