#!/home/vali/.nvm/versions/node/v7.7.3/bin/node

const Tesseract = require('tesseract.js');
const SafeStringify = require('json-stringify-safe');
const CircularJSON = require('circular-json');
const FileSystem = require('file-system');

var photoName = process.argv[2];
var outputFile = process.argv[3];

var job = Tesseract.recognize(photoName);
	
job.progress(function(message) {
	console.log(message);
})

job.catch(function(err) {
	console.log(err);
})

job.then(function(result) {
	// console.log(result);
})

job.finally(function(resultOrError) {
	var string = JSON.stringify(resultOrError.words.map(function(word) {
		return word.text
	}));


	var string = CircularJSON.stringify(resultOrError);

	if (outputFile) {
		FileSystem.writeFile(outputFile, string, function (err) {
		    if (err) 
		        return console.log(err);

		    console.log('Done adding the processed text to output file');
		    process.exit();
		});
	} else {
		console.log('Done');
		process.exit();
	}
})