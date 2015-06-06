(function(module,exports){

	var octane   = require('octane');
	var _        = require('lodash');
	var select   = document.querySelector.bind(document);

	/*	
	var TodoList = new octane.CollectionView('TodoList');
	TodoList.controller('add',function(node){
		var todo = octane.model('Todo');
		if(todo.get('name')){
			// add the todo item to the TodoList controller's collection,
			// and render it to the colleciton view
			this.todos.add(todo);
			// create a new recipe model and load it into the 'Todo' position
			octane.Model.create({id:(todo.get('id')+1)}).become('Todo');

		}
	})
	.controller('clear',function(){
		// clear the todos and reset the count
		// clear the collection view
		octane.Model.create({id:0}).become('Todo');
		this.collection.reset();
	})
	.controller('delete',function(node,todoId){
		this.collection.remove(function(recipe){
			return todo.id === todoId;
		});
	});
	*/

	var TodoList = octane.controller('TodoList',{
		view: select('ul#todo-list'),
		template: octane.Template.get('todo-item'),
		add: function(node){
			var todo = octane.model('Todo');
			if(todo.get('name')){
				// add the todo item to the TodoList controller's collection,
				// and render it to the colleciton view
				this.todos.push(todo);
				this.template.set(todo.get()).appendTo(this.view);
				// create a new recipe model and load it into the 'Todo' position
				octane.Model.create({id:(todo.get('id')+1)}).become('Todo');

			}
		},
		clear: function(){
			// clear the todos and reset the count
			// clear the collection view
			octane.Model.create({id:0}).become('Todo');
			this.todos = [];
			this.view.innerHTML = '';
		},
		delete: function(node,recipeId){
			//var target = this.view.querySelector('[data-todo-id="'+todoId+'"]');
			_.remove(this.todos,function(recipe){
				return todo.id === todoId;
			});
			// remove the node from the collection view
			this.view.removeChild(node);
		}
	});

	TodoList.clear();

	module.exports = TodoList;

})(module,exports);
