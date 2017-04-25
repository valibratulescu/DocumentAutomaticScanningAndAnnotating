import {
    Meteor
} from 'meteor/meteor';

import fs from 'fs';
import { 
	moment 
} from "meteor/momentjs:moment";

const exec = require('child_process').exec;
const path = require('path');

var docType = 'pdf';
var photoKeyName = 'img';
var photoExtension = '.jpeg';
var ocrSymlink = 'tesseract';

Meteor.startup(() => {
    Meteor.methods({
	    sendPhotoToServer: function() {
	    	var encPhotoPath = arguments[0].replace('data:image/jpeg;base64,', '');

	    	if (!encPhotoPath) {
	    		console.log('No photo has been selected!');

	    		return;
	    	}
	    	
	    	var photoName = Meteor.call('generatePhotoName');
	    	// var photoName = 'out' + photoExtension;

	    	fs.writeFile(photoName, encPhotoPath, 'base64', Meteor.call('processFile', photoName));
	    },
	    processFile: function(photoName) {
	    	var photoPath = Meteor.call('getPhotoPath') + '/' + photoName;
	    	var docName = Meteor.call('generateDocumentName', photoName);

	    	// photoPath = '/home/vali/Desktop/test.jpg';

	    	var args = [ocrSymlink, photoPath, docName, docType];
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
	    generateDocumentName: function(photoName) {
	    	return docType + '-' + photoName;
	    },
	    getPhotoPath: function() {
	    	var photoPath = '';

	    	photoPath = path.resolve();

	    	return photoPath;
		},
	});
});