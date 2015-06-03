
	var fs = require('fs');
	var os = require('os');

	var lib = './src/lib/';
	var enc = 'utf-8';
	var license = fs.readFileSync(lib+'license-boilerplate.txt');

	fs.readdir(lib,function(err,files){

		var pointer;
		var i = 0;
		var checkFile = function(err,data){
			if( data.indexOf('Copyright 2015 Ethan Ferrari, OneFire Media Inc') < 0 ) {
				console.log('Writing license to '+files[0]+ '.');
				data = license + os.EOL + os.EOL + data;
				fs.writeFileSync(lib+files[i],data);
			} else {
				console.log('File '+files[i]+ ' has license, continuing.');
			}
			i++;
			if(files[i] ) {
				fs.readFile(lib+files[i],enc,checkFile);
			} else {
				console.log('All files licensed!');
			}
		};

		fs.readFile(lib+files[0],enc,checkFile);
	});
