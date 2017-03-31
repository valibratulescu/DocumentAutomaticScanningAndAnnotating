import {
    Meteor
} from 'meteor/meteor';

import fs from 'fs';
import { 
	moment 
} from "meteor/momentjs:moment";

const exec = require('child_process').exec;
const path = require('path');

var outputFile = 'output.json';
var photoKeyName = 'img';
var photoExtension = '.jpg';

Meteor.startup(() => {
    Meteor.methods({
	    sendPhotoToServer: function() {
	    	var photoPath = arguments[0].replace('data:image/jpeg;base64,', '');

	    	if (!photoPath) {
	    		console.log('No photo has been selected');

	    		return;
	    	}

	    	var photoName = Meteor.call('generatePhotoName');
	    	var photoName = 'out.jpg';

	    	fs.writeFile(photoName, photoPath, 'base64', Meteor.call('processFile', photoName));
	    },
	    processFile: function(photoName) {
	    	var nodePath = Meteor.call('getNodePath');
			var args = [nodePath, photoName, outputFile];
			var parsedArgs = args.join(' ');

			exec(parsedArgs, (err, stdout, stderr) => {
				if (err) {
			    	console.error(err);

			    	return;
			  	}

		  		console.log(stdout);
			});
	    },
	    generatePhotoName: function() {
	    	var photoName = '';
	    	var currentDate = moment().format();

	    	photoName = photoKeyName + currentDate + photoExtension;

	    	return photoName;
	    },
	    getNodePath: function() {
	    	var nodePath = '';

	    	nodePath = path.resolve("../../../../../../ocr-server") + '/index.js';

	    	return nodePath;
	    },
	    generatePDF: function() {
	    	var pdf = new jsPDF()
 
			pdf.text('Hello world!', 10, 10);
			pdf.save('a4.pdf');
	    },
	});
});