(function(module,exports){

	var octane   = require('octane');
	var _        = require('lodash');
	var select   = document.querySelector.bind(document);

	var RecipeList = octane.controller('RecipeList',{
		view: select('ul#recipe-list'),
		template: octane.Template.get('recipe-item'),
		add: function(node){
			var recipe = octane.model('Recipe');
			if(recipe.get('name')){
				// add the recipe to the RecipeList controller's collection,
				// and render it to the colleciton view
				this.recipes.push(recipe);
				this.template.set(recipe.get()).appendTo(this.view);
				// create a new recipe model and load it into the 'Recipe' position
				octane.Model.create({id:(recipe.get('id')+1)}).become('Recipe');

			}
		},
		clear: function(){
			// clear the recipes and reset the count
			// clear the collection view
			octane.Model.create({id:0}).become('Recipe');
			this.recipes = [];
			this.view.innerHTML = '';
		},
		delete: function(node,recipeId){
			//var target = this.view.querySelector('[data-recipe-id="'+recipeId+'"]');
			_.remove(this.recipes,function(recipe){
				return recipe.id === recipeId;
			});
			// remove the node from the collection view
			this.view.removeChild(node);
		}
	});

	RecipeList.clear();

	module.exports = RecipeList;

})(module,exports);
