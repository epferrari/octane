var OctaneBase = require('./OctaneBase.js');

var Factory = function(){
	return OctaneBase.extend.apply(OctaneBase,arguments);
};

module.exports = Factory;
