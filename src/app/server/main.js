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
	    processFile: function(b64PhotoPath) {
	    	var future = new Future();
	    	var b64PhotoPath = b64PhotoPath.replace('data:image/jpeg;base64,', '');

	    	fs.writeFileSync(fullPhotoName, b64PhotoPath, 'base64');

	    	var args = [processName, photoPath, tmpDocName, 'txt'].join(' ');

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

	    	content = fs.readFileSync(fullTmpDocName, 'utf8');

	    	return {
	    		'status': 'success',
	    		'data': content
	    	};
	    },

	    generatePDF: function() {
	    	var future = new Future();

	    	var args = [processName, photoPath, docName, 'pdf'].join(' ');

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

		performSugarRequest: function() {
			var sugarToken = Meteor.call('getSugarAuthToken').status === 'success' ? Meteor.call('getSugarAuthToken').data : '';

			if (sugarToken === '') {
				return {
					'status': 'error',
					'data': 'Failed retrieving Sugar authentification token.'
				};
			}

			var sugarNoteId = Meteor.call('createSugarNote', sugarToken).status === 'success' ? Meteor.call('createSugarNote', sugarToken).data : '';

			if (sugarNoteId === '') {
				return {
					'status': 'error',
					'data': 'Failed creating Sugar note.'
				};
			}

			var attachmentAdded = Meteor.call('addAttachmentToNote', sugarToken, sugarNoteId).status === 'success' ? Meteor.call('addAttachmentToNote', sugarToken, sugarNoteId).data : '';

			if (attachmentAdded === '') {
				return {
					'status': 'error',
					'data': 'Failed adding attachment to Sugar note.'
				};
			}

			Meteor.call('removeTemporaryDoc', fullTmpDocName);

			return {
				'status': 'success',
				'data': 'Sugar synchronization successfully made!'
			};
		},
		getSugarAuthToken: function() {
			var future = new Future();

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
		createSugarNote: function(token) {
			var future = new Future();

			var method = 'POST';
			var url = sugarURL + '/Notes'
			var options = {
				headers: {
					"Content-Type": "application/json",
					"oauth-token": token,
				},
				data: {
				    "name": "Note-" + fullDocName,
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
		addAttachmentToNote: function(token, noteId) {
			var future = new Future();

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
		removeTemporaryDoc: function(docName) {
			if (docName)
				fs.unlinkSync(docName);
		},
	});
});