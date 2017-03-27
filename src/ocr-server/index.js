#!/home/vali/.nvm/versions/node/v7.7.3/bin/node

var Tesseract = require('tesseract.js');
var SafeStringify = require('json-stringify-safe');
var CircularJSON = require('circular-json');
var FileSystem = require('file-system');

var photo = process.argv[2];
var outputFile = process.argv[3];

var job = Tesseract.recognize(photo);
	
job.progress(function(message) {
	console.log(message);
})

job.catch(function(err) {
	console.log(err);
})

job.then(function(result) {
	console.log(result);
})

job.finally(function(resultOrError) {
	// console.log(resultOrError);

	var string = JSON.stringify(resultOrError.words.map(function(word) {
		return word.text
	}));


	var string = CircularJSON.stringify(resultOrError);

	if (outputFile) {
		FileSystem.writeFile(outputFile, string, function (err) {
		    if (err) 
		        return console.log(err);
		});
	}

  	// process.exit();
})