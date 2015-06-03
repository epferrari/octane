/*
* Copyright 2015 Ethan Ferrari, OneFire Media Inc.
*
*	Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*		http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
*/


	var OctaneBase = require('./OctaneBase.js');
	var getByTag = document.getElementsByTagName.bind(document);
	var createElement = document.createElement.bind(document);


	var DOM = new OctaneBase();

	DOM.defineGetter('loadingContainer',function(){
		return getByTag('o-loading-container')[0] || createElement('o-loading-container');
	});

	DOM.defineGetter('bgContainer',function(){
		return getByTag('o-background')[0] || createElement('o-background');
	});

	DOM.defineGetter('appContainer',function(){
		return getByTag('o-app-container')[0] || createElement('o-app-container');
	});

	DOM.defineGetter('pageContainer',function(){
		return getByTag('o-page-container')[0] || createElement('o-page-container');
	});

	DOM.defineGetter('modalContainer',function(){
		return getByTag('o-modal-container')[0] || createElement('o-modal-container');
	});

	DOM.defineGetter('getPages',function(){
		return getByTag('o-page');
	});

	DOM.defineGetter('getModals',function(){
		return getByTag('o-modal');
	});

	module.exports = DOM;
