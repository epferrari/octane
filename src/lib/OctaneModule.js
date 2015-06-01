
	var select 						= document.querySelector.bind(document);
	var selectAll 				= document.querySelectorAll.bind(document);
	var define 						= Object.defineProperty;
	var _ 								= require('lodash');
	var Promise 					= require('bluebird');
	var OctaneBase 				= require('./OctaneBase.js');
	var _octane 					= require('./_octane.js');
	var utils 						= require('./utils.js');
	var ViewModel 				= require('./ViewModel.js');
	var OctaneController 	= require('./Controller.js');






	// messages to log to the boot logger during the app's initialization
	var msgs		= {
		load	  : function(a)  { return "       "+a+': not initialized, loading...'},
		init		: function(a)  { return "       "+a+': initializing...'},
		done		: function(a)  { return "       "+a+': successfully initialized!'},
		skip	  : function(a)  { return "       "+a+': already initialized, continuing...'},
		fail1		: function(a)  { return "FAILED "+a+': failed to initialize!'},
		check		: function(a)  { return "       "+a+': checking dependencies...'},
		clear		: function(a)  { return "       "+a+': no dependencies, preparing to initialize...'},
		next		: function(a,b){ return "       "+a+': dependency "'+ b +'" loaded and initialized, continuing...'},
		hold		: function(a,b){ return "       "+a+': dependency "'+ b +'" not yet loaded, loading now...'},
		fail2		: function(a,b){ return 'FAILED '+a+': Could not load module, missing module dependency "'+ b +'"'},

	};

	function bootlog(msg,a,b){
		var message = msgs[msg](a,b);
		_octane.bootlog.push( message );
	}




	function OctaneModule (name,dependencies){
		this.initialized        = false;
		this.name               = name;
		this.imports            = {};
		this.controllers        = {};
		this.dependencies       = dependencies;
		this.status							= {isPending : function(){return false}};
		var loading = false;

		this.accessors('loading',{
			set : function(bool){
				if(!this.initialized) {
					loading = utils.typeOf(bool) == 'boolean' ? bool : loading;
				}
			},
			get : function(){
				return loading;
			}
		});
	}




	OctaneModule.prototype = Object.create(OctaneBase.prototype);
	OctaneModule.prototype.extend({
		initialize: function(){},
		constructor: OctaneModule
	});

	OctaneModule.prototype.defineProp({

		import: function(module){
			return _octane.moduleExports[module];
		},

		export: function(exports){
			_octane.moduleExports[this.name] = exports;
		},

		controller: function(name,methods){
			// give the controller the module's config hash
			(methods || (methods = {})).moduleConfig = (_octane.moduleConfigs[this.name] || {});
			this.controllers[name] = _octane.controllers[name] = new OctaneController(name,methods);
			return this; // chainable
		},

		_getImports: function(){

			_.transform(this.dependencies,function(imports,dependency){
					imports[dependency] = _octane.moduleExports[dependency];
			},this.imports);
		},

		_load: function(){
			return new Promise(function(resolve,reject){
				if(this.initialized){

					bootlog('skip',this.name);
					//return Promise.resolve(this);
					return resolve(this);

				} else {

					bootlog('load',this.name);

					return this._checkDependencies()
						.bind(this)
					.then(function(){

						var name = this.name;
						var config 	= _octane.moduleConfigs[name] || {};

						bootlog('init',name);
						this._getImports(name);
						this.initialize(config);
						this.defineProp('initialized',true);

						// update progress bar and message as modules load
						ViewModel.get('App').set({
							"loadingProgress": (Math.ceil(100 / Object.keys(_octane.modules).length)),
							"loadingMessage":  "Loading module "+ utils.titleize(name)
						});

						// hook-in for updating a loading screen
						this.fire('loaded:module',{moduleID: name});


						bootlog('done',name);
						//return Promise.resolve(this);
						return resolve(this);
					})
					.catch(function(err){
						bootlog('fail1',this.name);
						this.log(err);
						this.initialized = false;
						//return Promise.reject();
						return reject();
					});
				}
			}.bind(this));
		},

		_checkDependencies: function(){

			var deps = this.dependencies || [];
			var n = deps.length;
			var results = [];

			bootlog('check',this.name);

			if(n === 0){
					bootlog('clear',this.name);
					return Promise.resolve();
			} else {
				while(n--){
					results.push(this._checkDependency(deps[n]));
				}
				return Promise.all(results);
			}
		},

		_checkDependency: function (dname){

			dname = ''.trim.apply(dname||'');
			var name 			= this.name;
			var required 	= _octane.modules[dname];

			switch(true){

				case (dname.length === 0) :
				// no dependency
					bootlog('clear',name);
					return Promise.resolve();

				case (!(required && required instanceof OctaneModule)):
				// module is not present, fail
					bootlog('fail2',name,dname);
					return Promise.reject();

				case ( required && required.initialized ) :
				// module is already loaded, continue
					bootlog('next',name,dname);
					return Promise.resolve();

				case (required && required.status.isPending()):
					bootlog('hold',name,dname);
					return required.status;

				case (!required.initialized):
				// module is not loaded, try to load it
					bootlog('hold',name,dname);
					required.status.isPending() || (required.status = required._load());
					return required.status;
			}
		}
	});


	module.exports = OctaneModule;
