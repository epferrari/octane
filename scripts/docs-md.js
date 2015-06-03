// render documentation for all modules in ./src/lib to ./docs/md

	"use strict";
	var jsdoc2md = require("jsdoc-to-markdown");
	var fs = require("fs");
	var dmd = require("dmd");
	var util = require("util");
	var path = require("path");

	/* paths used by this script */
	var p = {
			src: path.resolve(__dirname,"../src/lib/*.js"),
			json: path.resolve(__dirname, "./source.json"),
			output: path.resolve(__dirname, "../docs/md/%s.md")
	}

	/* we only need to parse the source code once, so cache it */
	jsdoc2md({ src: p.src, json: true })
			.pipe(fs.createWriteStream(p.json))
			.on("close", dataReady);

	function dataReady(){
			/* parse the jsdoc-parse output.. */
			var data = require(p.json);

			/* ..because we want an array of class names */
			var modules = data.reduce(function(prev, curr){
					if (curr.kind === "module") prev.push(curr.name);
					return prev;
			}, []);

			/* render an output file for each class */
			renderMarkdown(modules, 0);
	}

	function renderMarkdown(modules, index){
			var moduleName = modules[index];
			var template = util.format('{{#module name="%s"}}{{>docs}}{{/module}}', modules);
			console.log(util.format(
					"rendering %s, template: %s", moduleName, template
			));
			return fs.createReadStream(p.json)
					.pipe(dmd({ template: template }))
					.pipe(fs.createWriteStream(util.format(p.output, moduleName)))
					.on("close", function(){
							var next = index + 1;
							if (modules[next]){
									renderMarkdown(modules, next);
							} else {
									fs.unlinkSync(p.json);
							}
					});
	}
