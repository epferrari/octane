// concat all markdown docs from ./docs/md to the root README.md

var fs = require('fs');
var os = require('os');
var _ = require('lodash');
var PATH = './docs/md/';
var ENCODING = 'utf-8';
var README = 'README.md';

fs.readdir(PATH,function(err,files){
	console.log('Creating README.md');

	// make sure this is first
	_.pull(files,README);
	files.unshift(README);

	var output = _.map(files,function(file){
		console.log(file);
		return fs.readFileSync(PATH + file,ENCODING);
	});

	fs.writeFileSync('./'+README,output.join(os.EOL),ENCODING);

	console.log(README+' updated');
});
