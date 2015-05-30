var modernizr = require('modernizr');
var fs = require('fs');

var tests = {
	"feature-detects":[
		"history",
		"css/animations",
		"css/filters",
		"dom/classlist",
		"dom/createElement-attrs"
	]
};

modernizr.build(tests,function(res){
	fs.mkdir('./vendor',function(){
		fs.writeFileSync('./vendor/modernizr.js',res,{encoding:'utf-8'});
	});
});
