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

Future = Npm.require('fibers/future');

const exec = require('child_process').exec;
const path = require('path');
const request = require('request');
const nlp = require('compromise');

var processName = 'tesseract';
var currentDate = moment().format('YYYY-MM-DD-HH-mm-ss');

var tmpPhotoName = 'tempImg-' + currentDate;
var tmpDocName = 'tempDoc-' + currentDate;
var pdfName = '';

Meteor.startup(() => {
    Meteor.methods({
	    processFile: function(b64PhotoPath) {
	    	var b64PhotoPath = b64PhotoPath.replace('data:image/jpeg;base64,', '');

	    	fs.writeFileSync(tmpPhotoName + '.jpg', b64PhotoPath, 'base64');

	    	var future = new Future();
	    	var args = [processName, tmpPhotoName + '.jpg', tmpDocName, 'txt'].join(' ');

	    	exec(args, Meteor.bindEnvironment(
    			function(error, stdout, stderr) {
    				var response = {};

					if (error) {
				    	response = {
				    		'status': 'error',
				    		'data': error
				    	};
				  	} else {
					  	response = {
					  		'status': 'success',
					  		'data': 'File has been successfully processed!'
					  	};
				  	}
	
			  		future["return"](response);
				})
			);

			return future.wait(); 	
	    },

	    getContent: function() {
	    	var result = {};

	    	content = fs.readFileSync(tmpDocName + '.txt', 'utf8');

	    	return {
	    		'status': 'success',
	    		'data': content
	    	};
	    },

	    generatePDF: function(name) {
	    	pdfName = name || Meteor.call(generatePDFName);

	    	var future = new Future();
	    	var args = [processName, tmpPhotoName + '.jpg', pdfName, 'pdf'].join(' ');

    		exec(args, Meteor.bindEnvironment(
    			function(error, stdout, stderr) {
    				var response;

				  	if (error) {
						response = {
				    		'status': 'error',
				    		'data': error
				    	};
					} else {
						response = {
				    		'status': 'success',
				    		'data': 'PDF successfully generated!'
				    	};
					}

			  		future["return"](response);
				})
			);

			return future.wait(); 
	    },

		performSugarRequest: function(params) {
			var sugarURL = params[0];

			var sugarToken = '';
			var tokenRetrieved = Meteor.call('getSugarAuthToken', params);

			if (tokenRetrieved.status === 'success')
				sugarToken = tokenRetrieved.data;

			if (sugarToken === '') {
				return {
					'status': 'error',
					'data': 'Failed retrieving Sugar authentification token.'
				};
			}

			var sugarNoteId = '';
			var noteCreated = Meteor.call('createSugarNote', sugarToken, sugarURL);

			if (noteCreated.status === 'success')
				sugarNoteId = noteCreated.data;

			if (sugarNoteId === '') {
				return {
					'status': 'error',
					'data': 'Failed creating Sugar note.'
				};
			}


			var attachmentAdded = Meteor.call('addAttachmentToNote', sugarToken, sugarNoteId, sugarURL);

			if (attachmentAdded.status === 'error') {
				return {
					'status': 'error',
					'data': 'Failed adding attachment to Sugar note.'
				};
			}

			Meteor.call('deleteFile', tmpDocName + '.txt');
			Meteor.call('deleteFile', tmpPhotoName + '.jpg');

			return {
				'status': 'success',
				'data': 'Sugar synchronization successfully made!'
			};
		},

		getSugarAuthToken: function(params) {
			var future = new Future();

			var method = 'POST';
			var url = 'http://' + params[0] + '/rest/v10/oauth2/token';
			var options = {
				data : {
					'grant_type': 'password',
					'client_id': 'sugar',
					'client_secret': '',
					'username': params[1],
					'password': params[2],
					'platform': 'base',
				}
			};

			HTTP.call(method, url, options, function(error, result) {
				var response;

				if (error) {
					response = {
			    		'status': 'error',
			    		'data': error
			    	};
				} else {
					response = {
			    		'status': 'success',
			    		'data': JSON.parse(result.content).access_token
			    	};
				}

				future["return"](response);
			});

			return future.wait();
		},

		createSugarNote: function(token, sugarURL) {
			var future = new Future();

			var method = 'POST';
			var url = 'http://' + sugarURL + '/rest/v10/Notes'
			var options = {
				headers: {
					"Content-Type": "application/json",
					"oauth-token": token,
				},
				data: {
				    "name": "Note-for-" + pdfName,
				    'description': Meteor.call('getContent').data
				}
			};

			HTTP.call(method, url, options, function(error, result) {
				var response;

				if (error) {
					response = {
			    		'status': 'error',
			    		'data': error
			    	};
				} else {
					response = {
			    		'status': 'success',
			    		'data': JSON.parse(result.content).id
			    	};
				}

				future["return"](response);
			});

			return future.wait();
		},

		addAttachmentToNote: function(token, noteId, sugarURL) {
			var docPath = path.resolve() + '/' + pdfName + '.pdf';
			var future = new Future();

			var opts = {
				url: 'http://' + sugarURL + '/rest/v10/Notes/' + noteId + '/file/filename',
				method: 'POST',
				headers: {
					"oauth-token": token,
					'content-type': 'application/pdf',
				},
				formData: {
					filename: fs.createReadStream(docPath)
				},

			};

			request(opts, function(error, result, body) {
				var response;

				if (error) {
					response = {
			    		'status': 'error',
			    		'data': error
			    	};
				} else {
					response = {
			    		'status': 'success',
			    		'data': 'Attachment successfully added to Sugar note.'
			    	};
				}

		  		future["return"](response);
			});

			return future.wait();
		},

		deleteFile: function(fileName) {
			if (fileName)
				fs.unlinkSync(fileName);
		},

		generatePDFName: function() {
			return 'PDF-' + currentDate;
		},
	});
});