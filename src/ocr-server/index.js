#!/home/vali/.nvm/versions/node/v7.7.3/bin/node

const Tesseract = require('tesseract.js');
const CircularJSON = require('circular-json');
const FileSystem = require('file-system');
const sizeOf = require('image-size');
const PDFDocument = require('pdfkit');

var photoName = process.argv[2];
var outputFile = process.argv[3];

doc = new PDFDocument();

var dimensions = sizeOf(photoName);
console.log(dimensions);
doc.pipe(FileSystem.createWriteStream('output.pdf'));

doc.image(photoName, 0, 15, {height: dimensions.height, width: dimensions.width});

var job = Tesseract.recognize(photoName);
	
job.progress(function(message) {
})

job.catch(function(err) {
	console.log(err);
})

job.then(function(result) {
	for (let block of result.blocks) {
		for (let paragraph of block.paragraphs) {
			for (let line of paragraph.lines) {
				for (let word of line.words) {
					console.log(word.text);
					console.log(word.bbox.x0);
					console.log(word.bbox.y0);
				}
			}
		}
	}

	doc.end();
})

job.finally(function(resultOrError) {
	var string = CircularJSON.stringify(resultOrError, null, 2);

	if (outputFile) {
		FileSystem.writeFile(outputFile, string, function (err) {
		    if (err) 
		        console.log(err);
		    else 
		    	console.log('Done adding the processed text to the output file');
		    
		    process.exit();
		});
	} else {
		console.log('Done');
		process.exit();
	}
})