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

DOM.defineGetter('viewContainer',function(){
		return getByTag('o-view-container')[0] || createElement('o-view-container');
});

DOM.defineGetter('modalContainer',function(){
		return getByTag('o-modal-container')[0] || createElement('o-modal-container');
});

DOM.defineGetter('getViewElements',function(){
		return getByTag('o-view');
});

DOM.defineGetter('getModalElements',function(){
		return getByTag('o-modal');
});

module.exports = DOM;
