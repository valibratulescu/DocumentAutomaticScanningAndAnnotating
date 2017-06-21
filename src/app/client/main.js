import {
    Template
} from 'meteor/templating';
import {
    Session
} from 'meteor/session';

import './main.html';

import { 
    Blaze 
} from 'meteor/blaze';

if (Meteor.isClient) {
    Session.keys = {};

    Meteor.methods({
    });
    Template.processPhoto.events({
        'click .take-photo': function() {
            var cameraOpts = {
                quality: 100,
                width: -1,
                height: -1,
            };

            var callback = function(error, data) {
                if (error) {
                    alertMessage = "Error selecting photo!";
                    alertClass = 'alert-danger';
                }

                if (data) {
                    alertMessage = "Photo has been successfully selected!";
                    alertClass = 'alert-success';

                    Session.set('photoSelected', data);
                }

                $('#step1').find('.alert').addClass(alertClass);
                $('#step1').find('.alert').css('display', 'block');

                $('#step1').find('.next-step').removeClass('disabled');
                $('#step1').find('.next-step').css('pointer-events', 'all');

                Session.set('alertMessage', alertMessage);
            };

            MeteorCamera.getPicture(cameraOpts, callback);
        },
        'click .choose-photo': function() {
            var cameraOpts = {
                quality: 100,
                width: -1,
                height: -1,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY
            };

            var callback = function(error, data) {
                if (error) {
                    alertMessage = "Error selecting photo!";
                    alertClass = 'alert-danger';
                }

                if (data) {
                    alertMessage = "Photo has been successfully selected!";
                    alertClass = 'alert-success';

                    $('#step1').find('.next-step').removeClass('disabled');
                    $('#step1').find('.next-step').css('pointer-events', 'all');

                    Session.set('photoSelected', data);
                }

                $('#step1').find('.alert').addClass(alertClass);
                $('#step1').find('.alert').css('display', 'block');

                Session.set('alertMessage', alertMessage);
            };

            MeteorCamera.getPicture(cameraOpts, callback);
        },
        'click .process-photo': function() {
            waitingDialog.show('Photo is being processed...');

        	var photo = Session.get('photoSelected') || '';

            if (photo === '') {
                photoProcessed = "No photo selected.";
                alertClass = 'alert-danger';

                $('#step2').find('.alert').addClass(alertClass);
                $('#step2').find('.alert').css('display', 'block');

                Session.set('photoProcessed', photoProcessed);

                waitingDialog.hide();

                return;
            }

            Meteor.call('processFile', photo, function (error, data) {
                waitingDialog.hide();

                if (error) {
                    photoProcessed = "Error processing photo!";
                    alertClass = 'alert-danger';
                }

                if (data) {
                    photoProcessed = "Photo has been successfully processed";
                    alertClass = 'alert-success';

                    $('#step2').find('.next-step').removeClass('disabled');
                    $('#step2').find('.next-step').css('pointer-events', 'all');
                }

                $('#step2').find('.alert').addClass(alertClass);
                $('#step2').find('.alert').css('display', 'block');

                Session.set('photoProcessed', photoProcessed);
			});
        },
        'click .view-content': function() {
            Meteor.call('getContent', function (error, data) {
                if (error) {
                    photoContent = "Error extracting photo content!";
                    alertClass = 'alert-danger';
                }

                if (data) {
                    photoContent = data.data
                    alertClass = 'alert-success';
                }

                Session.set('photoContent', photoContent);
            })
        },
        'click .generate-pdf': function() {
            var pdfName = Session.get('pdfName') || '';

            waitingDialog.show('PDF is being generated...');

            Meteor.call('generatePDF', function(error, data) {
                waitingDialog.hide();
                
                if (error) {
                    pdfGenerated = "Error generating PDF!";
                    alertClass = 'alert-danger';
                }

                if (data) {
                    pdfGenerated = "PDF has been successfully generated!";
                    alertClass = 'alert-success';

                    $('#step3').find('.next-step').removeClass('disabled');
                    $('#step3').find('.next-step').css('pointer-events', 'all');
                }

                $('#step3').find('.alert').addClass(alertClass);
                $('#step3').find('.alert').css('display', 'block');

                Session.set('pdfGenerated', pdfGenerated);
            })
        },
        'click .send-to-sugar': function() {
            Meteor.call('performSugarRequest', function(error, data) {
                alert(data.data);
            })
        },
    });
    Template.processPhoto.helpers({
        'alertMessage': function() {
            return Session.get('alertMessage');
        },
        'photoSelected': function() {
            return Session.get('photoSelected');
        },
        'photoProcessed': function() {
            return Session.get('photoProcessed');
        },
        'photoContent': function() {
            return Session.get('photoContent');
        },
        'pdfName': function() {
            return Session.get('pdfName');
        },
        'pdfGenerated': function() {
            return Session.get('pdfGenerated');
        },
    });
}