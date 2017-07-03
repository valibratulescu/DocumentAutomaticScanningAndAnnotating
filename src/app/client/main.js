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
                    alertOnSelectingPhoto = "Error selecting photo!";
                    alertClass = 'alert-danger';
                }

                if (data) {
                    alertOnSelectingPhoto = "Photo has been successfully selected!";
                    alertClass = 'alert-success';

                    Session.set('photoSelected', data);
                }

                $('#step1').find('.alert').addClass(alertClass);
                $('#step1').find('.alert').css('display', 'block');

                $('#step1').find('.next-step').removeClass('disabled');
                $('#step1').find('.next-step').css('pointer-events', 'all');

                Session.set('alertOnSelectingPhoto', alertOnSelectingPhoto);
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
                    alertOnSelectingPhoto = "Error selecting photo!";
                    alertClass = 'alert-danger';
                }

                if (data) {
                    alertOnSelectingPhoto = "Photo has been successfully selected!";
                    alertClass = 'alert-success';

                    $('#step1').find('.next-step').removeClass('disabled');
                    $('#step1').find('.next-step').css('pointer-events', 'all');

                    Session.set('photoSelected', data);
                }

                $('#step1').find('.alert').addClass(alertClass);
                $('#step1').find('.alert').css('display', 'block');

                Session.set('alertOnSelectingPhoto', alertOnSelectingPhoto);
            };

            MeteorCamera.getPicture(cameraOpts, callback);
        },
        'click .process-photo': function() {
            waitingDialog.show('Processing photo...');

        	var photo = Session.get('photoSelected') || '';

            if (photo === '') {
                alertOnProcessingPhoto = "No photo selected.";
                alertClass = 'alert-danger';

                $('#step2').find('.alert').addClass(alertClass);
                $('#step2').find('.alert').css('display', 'block');

                Session.set('alertOnProcessingPhoto', alertOnProcessingPhoto);

                waitingDialog.hide();

                return;
            }

            Meteor.call('processFile', photo, function (error, data) {
                waitingDialog.hide();

                if (error) {
                    alertOnProcessingPhoto = "Error processing photo!";
                    alertClass = 'alert-danger';
                }

                if (data) {
                    alertOnProcessingPhoto = "Photo has been successfully processed";
                    alertClass = 'alert-success';

                    $('#step2').find('.next-step').removeClass('disabled');
                    $('#step2').find('.next-step').css('pointer-events', 'all');
                }

                $('#step2').find('.alert').addClass(alertClass);
                $('#step2').find('.alert').css('display', 'block');

                Session.set('alertOnProcessingPhoto', alertOnProcessingPhoto);
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
            var pdfName = $('.enter-pdf-name').val() || '';

            waitingDialog.show('Generating PDF...');

            Meteor.call('generatePDF', pdfName, function(error, data) {
                waitingDialog.hide();
                
                if (error) {
                    alertOnGeneratingPDF = "Error generating PDF!";
                    alertClass = 'alert-danger';
                }

                if (data) {
                    alertOnGeneratingPDF = "PDF has been successfully generated!";
                    alertClass = 'alert-success';

                    $('#step3').find('.next-step').removeClass('disabled');
                    $('#step3').find('.next-step').css('pointer-events', 'all');
                }

                $('#step3').find('.alert').addClass(alertClass);
                $('#step3').find('.alert').css('display', 'block');

                Session.set('alertOnGeneratingPDF', alertOnGeneratingPDF);
            })
        },
        'click .sync-to-sugar': function() {
            waitingDialog.show('Synchronizing to Sugar...');

            var sugarURL = $('#sugar-url').val() || '';
            var sugarUsername = $('#sugar-username').val() || '';
            var sugarPassword = $('#sugar-password').val() || '';

            var args = [sugarURL, sugarUsername, sugarPassword];

            Meteor.call('performSugarRequest', args, function(error, data) {
                waitingDialog.hide();

                if (error) {
                    alertOnSyncingToSugar = "Error synchronizing to Sugar!";
                    alertClass = 'alert-danger';
                }

                if (data) {
                    alertOnSyncingToSugar = data.data;
                    alertClass = 'alert-success';

                    $('#step4').find('.next-step').removeClass('disabled');
                    $('#step4').find('.next-step').css('pointer-events', 'all');
                }

                $('#step4').find('.alert').addClass(alertClass);
                $('#step4').find('.alert').css('display', 'block');

                Session.set('alertOnSyncingToSugar', alertOnSyncingToSugar);
            })
        },
    });
    Template.processPhoto.helpers({
        'alertOnSelectingPhoto': function() {
            return Session.get('alertOnSelectingPhoto');
        },
        'photoSelected': function() {
            return Session.get('photoSelected');
        },
        'alertOnProcessingPhoto': function() {
            return Session.get('alertOnProcessingPhoto');
        },
        'photoContent': function() {
            return Session.get('photoContent');
        },
        'pdfName': function() {
            return Session.get('pdfName');
        },
        'alertOnGeneratingPDF': function() {
            return Session.get('alertOnGeneratingPDF');
        },
        'alertOnSyncingToSugar': function() {
            return Session.get('alertOnSyncingToSugar');
        },
    });
}