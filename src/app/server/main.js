import {
    Meteor
} from 'meteor/meteor';

import fs from 'fs';
import { 
	moment 
} from "meteor/momentjs:moment";

import { 
	HTTP 
} from 'meteor/http'

const exec = require('child_process').exec;
const path = require('path');
const request = require('request');
const nlp = require('compromise');

var currentDate = moment().format('YYYY-MM-DD-HH-mm-ss');
var currentPath = path.resolve();

var photoName = 'img-' + currentDate;
var docName = 'doc-' + currentDate;

var fullPhotoName = photoName + '.jpeg';
var fullDocName = docName + '.pdf';

var photoPath = currentPath + '/' + fullPhotoName;
var docPath = currentPath + '/' + fullDocName;

var processName = 'tesseract';

var tmpDocName = 'tmpDoc';
var fullTmpDocName = tmpDocName + '.txt';

// SugarCRM settings
var sugarURL = 'http://192.168.1.3/rest/v10';

Meteor.startup(() => {
    Meteor.methods({
	    sendPhotoToServer: function(b64PhotoPath) {
	    	if (!b64PhotoPath) {
	    		console.log('No photo has been selected!');

	    		return;
	    	}

	    	console.log('Sending photo to server...');

	    	var b64PhotoPath = b64PhotoPath.replace('data:image/jpeg;base64,', '');

	    	fs.writeFileSync(fullPhotoName, b64PhotoPath, 'base64');

	    	console.log('Photo sent to server!');

	    	Meteor.call('processFile')
	    },
	    processFile: function() {
	    	var args = [processName, photoPath, tmpDocName, 'txt'].join(' ');
	    	var child = exec(args);

			child.on('close', Meteor.bindEnvironment(
				function(code) {
					console.log('Generating PDF file...');

					var args = [processName, photoPath, docName, 'pdf'].join(' ');

		    		exec(args, Meteor.bindEnvironment(
		    			function(error, stdout, stderr) {
							if (error) {
						    	console.log(error);

						    	return;
						  	}

					  		console.log("PDF generated!");

					  		Meteor.call('performSugarRequest');
						})
					);
				}
			));   	
	    },
		performSugarRequest: function() {
			console.log('Retrieving Sugar auth token...');

			// Get Sugar authentification token that will be used to create a new Note
			var method = 'POST';
			var url = sugarURL + '/oauth2/token';
			var options = {
				data : {
					'grant_type': 'password',
					'client_id': 'sugar',
					'client_secret': '',
					'username': 'vagrant',
					'password': 'vagrant',
					'platform': 'base',
				}
			};

			HTTP.call(method, url, options, function(error, result) {
				if (error) {
					console.log(error);

					return;
				}

				console.log('Sugar auth token retrieved!');

				var token = JSON.parse(result.content).access_token;

				Meteor.call('createSugarNote', token);
			});
		},
		createSugarNote: function(token) {
			console.log('Creating Sugar note...');

			var docContent = fs.readFileSync(fullTmpDocName, 'utf8');

			fs.unlinkSync(fullTmpDocName);

			var method = 'POST';
			var url = sugarURL + '/Notes'
			var options = {
				headers: {
					"Content-Type": "application/json",
					"oauth-token": token,
				},
				data: {
				    "name": "Note-" + fullDocName,
				    'description': docContent
				}
			};

			HTTP.call(method, url, options, function(error, result) {
				if (error) {
					console.log(error);

					return;
				}

				console.log("Sugar note created!");

				var noteId = JSON.parse(result.content).id;

				Meteor.call('addAttachmentToNote', token, noteId);
			});
		},
		addAttachmentToNote: function(token, noteId) {
			console.log('Adding PDF file to newly note...');

			var opts = {
				url: sugarURL + '/Notes/' + noteId + '/file/filename',
				method: 'POST',
				headers: {
					"oauth-token": token,
					'content-type': 'application/pdf',
				},
				formData: {
					filename: fs.createReadStream(docPath)
				},

			};

			request(opts, function(errror, result, body) {
		  		if (errror) {
		  			console.log(error);

		  			return
		  		}

		  		console.log('PDF document added to the Note!');
			});
		}
	});
});