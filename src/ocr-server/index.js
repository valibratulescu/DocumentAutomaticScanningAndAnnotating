#!/home/vali/.nvm/versions/node/v7.7.3/bin/node

var tesseract = require('node-tesseract');

// Recognize text of any language in any format
tesseract.process(process.argv[2], {psm: 6},function(err, text) {
	console.log(arguments[1]);
	// if(err) {
	// 	console.error(err);
	// } else {
	// 	console.log(text);
	// }
});


return;

const Tesseract = require('tesseract.js');
const CircularJSON = require('circular-json');
const FileSystem = require('file-system');
const sizeOf = require('image-size');
const PDFDocument = require('pdfkit');

var photoName = process.argv[2];
var outputFile = process.argv[3];

var job = Tesseract.recognize(photoName);
	
job.progress(function(message) {
})

job.catch(function(err) {
	console.log(err);
})

job.then(function(result) {
	var dimensions = sizeOf(photoName);

	doc = new PDFDocument({
	    autoFirstPage: false
	});

	doc.pipe(FileSystem.createWriteStream('output.pdf'));

	doc.addPage({
	   size: [dimensions.width, dimensions.height],
	   margins: {
	       left: 0,
	       top: 0,
	       right: 0,
	       bottom: 0
	   }
	});


	doc.image(photoName, 0, 0, {
		height: dimensions.height, 
		width: dimensions.width
	});

	for (let block of result.blocks) {
		for (let paragraph of block.paragraphs) {
			for (let line of paragraph.lines) {
				for (let word of line.words) {
					doc.fontSize(word.bbox.y1 - word.bbox.y0 + word.font_size);
					doc.fillOpacity(1);
					doc.fillColor('red');
					doc.text(word.text, word.bbox.x0, word.bbox.y0);

				}
			}
		}
	}

	doc.end();

	console.log("ENDED");
})


job.finally(function(resultOrError) {
	if (outputFile) {
		var string = CircularJSON.stringify(resultOrError, null, 2);
		
		FileSystem.writeFile(outputFile, string, function (err) {
		    if (err) 
		        console.log(err);
		    else 
		    	console.log('Done adding the processed text to the output file');
		});
	}

	console.log('Done');
})