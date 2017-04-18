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
var photoExtension = '.jpeg';
var ocrSymlink = 'ocr';

Meteor.startup(() => {
    Meteor.methods({
	    sendPhotoToServer: function() {
	    	var photoPath = arguments[0].replace('data:image/jpeg;base64,', '');

	    	if (!photoPath) {
	    		console.log('No photo has been selected!');

	    		return;
	    	}
	    	
	    	var photoName = Meteor.call('generatePhotoName');
	    	var photoName = 'out' + photoExtension;

	    	fs.writeFile(photoName, photoPath, 'base64', Meteor.call('processFile', photoName));
	    },
	    processFile: function(photoName) {
	    	var realPhotoPath = Meteor.call('getPhotoPath') + '/' + photoName;

	    	var args = [ocrSymlink, realPhotoPath, outputFile];
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
	    getPhotoPath: function() {
	    	var photoPath = '';

	    	photoPath = path.resolve();

	    	return photoPath;
},
	});
});